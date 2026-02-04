"use client";

import { createWorker } from "tesseract.js";
import type { PDFPageProxy } from "pdfjs-dist";

let pdfjsLib: unknown;
const MAX_PAGES = 50;
const MIN_TEXT_LENGTH_FOR_OCR = 30; // 이 글자수 미만이면 OCR 실행
const MIN_QUALITY_THRESHOLD = 0.3; // 텍스트 품질이 낮으면 OCR 사용

export interface IPdfExtractionProgress {
  currentPage: number;
  totalPages: number;
  status: "parsing" | "extracting" | "ocr" | "completed" | "error";
  message: string;
}

export interface IPdfExtractionResult {
  text: string;
  totalCharacters: number;
  pageCount: number;
  ocrPagesCount: number;
  ocrUsedPages: number[];
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
  onProgress?: (progress: IPdfExtractionProgress) => void,
) {
  let ocrWorker: Awaited<ReturnType<typeof createWorker>> | null = null;
  let ocrPagesCount = 0;
  const ocrUsedPages: number[] = [];
  try {
    if (typeof window !== "undefined" && !pdfjsLib) {
      pdfjsLib = await import("pdfjs-dist");
      (pdfjsLib as typeof import("pdfjs-dist")).GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as typeof import("pdfjs-dist")).version}/pdf.worker.min.js`;
    }
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.({
      currentPage: 0,
      totalPages: 0,
      status: "parsing",
      message: "PDF 파일을 분석하는 중...",
    });
    // PDF 문서 로드
    const pdf = await (pdfjsLib as typeof import("pdfjs-dist")).getDocument({
      data: arrayBuffer,
    }).promise;
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
        const filteredText = filterLowQualitySentences(pageText);

        // 필터링 후에도 텍스트가 있으면 OCR 사용 페이지로 기록
        if (filteredText.trim().length > 0) {
          pageText = `[📄 페이지 ${pageNum} - OCR 추출]\n${filteredText}`;
          ocrPagesCount++;
          ocrUsedPages.push(pageNum);
        } else {
          pageText = "";
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
    // 연속된 공백을 하나로 정리
    const cleanedText = fullText
      .trim()
      .split("\n")
      .map((line) => line.replace(/ {2,}/g, " "))
      .join("\n");
    return {
      text: cleanedText,
      totalCharacters: cleanedText.length,
      pageCount: totalPages,
      ocrPagesCount,
      ocrUsedPages,
    } as IPdfExtractionResult;
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
interface ITextItem {
  str: string;
  transform: number[];
}
/**
 * 텍스트 아이템을 좌표 기준으로 정렬하여 문자열로 변환
 */
function sortTextByCoordinates(
  items: Array<ITextItem | { type: string }>,
): string {
  if (items.length === 0) return "";
  // ITextItem만 필터링
  const textItems = items.filter(
    (item): item is ITextItem => "str" in item && "transform" in item,
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
 * 텍스트를 문장 단위로 분리
 * 문장 종결 기호(. ! ? \n) 뒤에 공백이나 줄바꿈이 오는 경우 분리
 */
function splitIntoSentences(text: string): string[] {
  if (!text) return [];

  // 문장 종결 부호 뒤 공백/줄바꿈을 기준으로 분리 (숫자 사이 점은 제외)
  // 예: "안녕하세요. 반갑습니다" → ["안녕하세요.", "반갑습니다"]
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return sentences;
}

/**
 * 문장 단위로 품질을 평가하여 품질 좋은 문장만 필터링
 */
function filterLowQualitySentences(text: string): string {
  const sentences = splitIntoSentences(text);

  const filteredSentences = sentences.filter((sentence) => {
    const quality = calculateTextQuality(sentence);
    return quality >= MIN_QUALITY_THRESHOLD;
  });

  return filteredSentences.join(" ");
}
/**
 * 페이지를 캔버스로 렌더링하고 OCR 실행
 */
async function runPageOCR(
  page: PDFPageProxy,
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
