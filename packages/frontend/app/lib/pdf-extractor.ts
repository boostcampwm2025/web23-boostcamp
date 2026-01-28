import * as pdfjsLib from "pdfjs-dist";
import { createWorker } from "tesseract.js";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const MAX_PAGES = 50;
const MIN_TEXT_LENGTH_FOR_OCR = 30; // 이 글자수 미만이면 OCR 실행
const MIN_QUALITY_THRESHOLD = 0.3; // 텍스트 품질이 낮으면 OCR 사용

export interface PdfExtractionProgress {
  currentPage: number;
  totalPages: number;
  status: "parsing" | "extracting" | "ocr" | "completed" | "error";
  message: string;
}

export interface PdfExtractionResult {
  text: string;
  totalCharacters: number;
  pageCount: number;
  ocrPagesCount: number;
}

/**
 * PDF 파일에서 텍스트를 추출합니다.
 * 페이지에서 추출된 텍스트가 MIN_TEXT_LENGTH_FOR_OCR 미만이면 OCR을 실행합니다.
 *
 * @param file PDF 파일
 * @param onProgress 진행률 콜백 함수
 * @returns 추출된 텍스트와 메타 정보
 */
export async function extractTextFromPdf(
  file: File,
  onProgress?: (progress: PdfExtractionProgress) => void,
): Promise<PdfExtractionResult> {
  let ocrWorker: Awaited<ReturnType<typeof createWorker>> | null = null;
  let ocrPagesCount = 0;

  try {
    const arrayBuffer = await file.arrayBuffer();

    onProgress?.({
      currentPage: 0,
      totalPages: 0,
      status: "parsing",
      message: "PDF 파일을 분석하는 중...",
    });

    // PDF 문서 로드
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = Math.min(pdf.numPages, MAX_PAGES);

    if (pdf.numPages > MAX_PAGES) {
      console.warn(
        `PDF 총 ${pdf.numPages} 페이지입니다. 최대 ${MAX_PAGES} 페이지만 지원합니다.`,
      );
    }

    let fullText = "";

    // 각 페이지별로 처리
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      onProgress?.({
        currentPage: pageNum,
        totalPages,
        status: "extracting",
        message: `${pageNum}/${totalPages} 페이지 분석 중...`,
      });

      const page = await pdf.getPage(pageNum);

      // 1. 텍스트 레이어 추출 시도
      const textContent = await page.getTextContent();
      let pageText = sortTextByCoordinates(textContent.items);
      const textQuality = calculateTextQuality(pageText);

      // 2. 텍스트가 충분하지 않거나 품질이 낮으면 OCR 실행
      const needsOCR =
        pageText.trim().length < MIN_TEXT_LENGTH_FOR_OCR ||
        textQuality < MIN_QUALITY_THRESHOLD;

      if (needsOCR) {
        onProgress?.({
          currentPage: pageNum,
          totalPages,
          status: "ocr",
          message: `${pageNum}페이지 이미지 감지, OCR 실행 중...`,
        });

        // OCR 워커가 없으면 생성 (필요할 때만 한 번만 생성)
        if (!ocrWorker) {
          ocrWorker = await createWorker("kor+eng");
        }

        pageText = await runPageOCR(page, ocrWorker);
        const ocrQuality = calculateTextQuality(pageText);

        // OCR 결과도 품질이 낮으면 버림
        if (ocrQuality < MIN_QUALITY_THRESHOLD) {
          pageText = "";
        } else {
          ocrPagesCount++;
        }
      }

      // 페이지별 텍스트 추가 (빈 줄로 구분)
      if (fullText.length > 0 && pageText.trim().length > 0) {
        fullText += "\n\n";
      }
      fullText += pageText;
    }

    onProgress?.({
      currentPage: totalPages,
      totalPages,
      status: "completed",
      message: "텍스트 추출 완료!",
    });

    return {
      text: fullText.trim(),
      totalCharacters: fullText.trim().length,
      pageCount: totalPages,
      ocrPagesCount,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    onProgress?.({
      currentPage: 0,
      totalPages: 0,
      status: "error",
      message: `오류 발생: ${errorMessage}`,
    });
    throw error;
  } finally {
    // OCR 워커 정리
    if (ocrWorker) {
      await ocrWorker.terminate();
    }
  }
}

interface TextItem {
  str: string;
  transform: number[];
}

/**
 * 텍스트 아이템을 좌표 기준으로 정렬하여 문자열로 변환
 */
function sortTextByCoordinates(
  items: Array<TextItem | { type: string }>,
): string {
  if (items.length === 0) return "";

  // TextItem만 필터링
  const textItems = items.filter(
    (item): item is TextItem => "str" in item && "transform" in item,
  );

  const mappedItems = textItems.map((item) => ({
    str: item.str,
    x: item.transform[4],
    y: item.transform[5],
    width: item.transform[0],
    height: item.transform[3],
  }));

  if (mappedItems.length === 0) return "";

  // 평균 글자 높이 계산 (동적 줄 간격 감지용)
  const avgHeight =
    mappedItems.reduce((sum, item) => sum + Math.abs(item.height), 0) /
    mappedItems.length;
  const lineThreshold = avgHeight * 0.5; // 평균 높이의 50%를 줄 간격으로 사용

  // Y 좌표 기준 내림차순 정렬 (위에서 아래로), 같은 줄이면 X 좌표 오름차순
  mappedItems.sort((a, b) => {
    if (Math.abs(a.y - b.y) < lineThreshold) {
      return a.x - b.x;
    }
    return b.y - a.y;
  });

  let result = "";
  let currentY = mappedItems[0].y;
  let lastX = 0;

  mappedItems.forEach((item, index) => {
    // Y 좌표가 많이 다르면 새 줄로
    if (Math.abs(item.y - currentY) > lineThreshold) {
      result += "\n";
      currentY = item.y;
      lastX = 0;
    } else if (index > 0) {
      // 같은 줄에서 단어 간격이 크면 공백 추가
      const gap = item.x - lastX;
      if (gap > avgHeight) {
        result += " ";
      }
    }

    result += item.str;
    lastX = item.x + item.str.length * Math.abs(item.width);
  });

  return result.trim();
}

/**
 * 페이지를 캔버스로 렌더링하고 OCR 실행
 * 텍스트 품질 평가 (한글/영문 비율, 특수문자 비율 등)
 */
function calculateTextQuality(text: string): number {
  if (!text || text.length < 10) return 0;

  const koreanCount = (text.match(/[ㄱ-ㅎ가-힣]/g) || []).length;
  const englishCount = (text.match(/[a-zA-Z]/g) || []).length;
  const numberCount = (text.match(/[0-9]/g) || []).length;
  const specialCount = (text.match(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ]/g) || []).length;

  const validCharCount = koreanCount + englishCount + numberCount;
  const totalCount = text.length;

  // 유효한 문자 비율
  const validRatio = validCharCount / totalCount;
  // 특수문자가 너무 많으면 품질 저하
  const specialRatio = specialCount / totalCount;

  return validRatio * (1 - specialRatio * 0.5);
}

/**
 * 페이지를 캔버스로 렌더링하고 OCR 실행
 */
async function runPageOCR(
  page: pdfjsLib.PDFPageProxy,
  worker: Awaited<ReturnType<typeof createWorker>>,
): Promise<string> {
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context를 생성할 수 없습니다.");
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport }).promise;

  const {
    data: { text },
  } = await worker.recognize(canvas);
  return text.trim();
}
