import * as pdfjsLib from "pdfjs-dist";
import { createWorker } from "tesseract.js";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const MAX_PAGES = 50;
const MIN_TEXT_LENGTH_FOR_OCR = 50; // 이 글자수 미만이면 OCR 실행

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

      // 2. 텍스트가 충분하지 않으면 OCR 실행
      if (pageText.trim().length < MIN_TEXT_LENGTH_FOR_OCR) {
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

        const ocrResult = await runPageOCR(page, ocrWorker);
        pageText = ocrResult;
        ocrPagesCount++;
      }

      // 페이지 헤더와 함께 결과에 추가
      const pageHeader = `\n--- Page ${pageNum} ---\n`;
      fullText += pageHeader + pageText + "\n";
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
  }));

  // Y 좌표 기준 내림차순 정렬 (위에서 아래로), 같은 줄이면 X 좌표 오름차순
  mappedItems.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 5) {
      return a.x - b.x;
    }
    return b.y - a.y;
  });

  let result = "";
  let currentY = mappedItems[0]?.y;

  mappedItems.forEach((item) => {
    // Y 좌표가 많이 다르면 새 줄로
    if (Math.abs(item.y - currentY) > 5) {
      result += "\n";
      currentY = item.y;
    }
    result += item.str + " ";
  });

  return result.replace(/\s+/g, " ").trim();
}

/**
 * 페이지를 캔버스로 렌더링하고 OCR 실행
 */
async function runPageOCR(
  page: pdfjsLib.PDFPageProxy,
  worker: Awaited<ReturnType<typeof createWorker>>,
): Promise<string> {
  const viewport = page.getViewport({ scale: 2.5 });
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
  return text;
}
