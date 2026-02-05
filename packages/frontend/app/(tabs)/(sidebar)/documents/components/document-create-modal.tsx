"use client";

import React, { useState, useRef } from "react";
import { DocumentItem } from "@/app/(tabs)/(simulator)/components/document-card";
import { createCoverLetter, createPortfolio } from "@/app/lib/actions/document";
import { Button } from "@/app/components/ui/button";
import {
  extractTextFromPdf,
  IPdfExtractionProgress,
} from "@/app/lib/pdf-extractor";
import { X, FileText, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { CoverLetterForm } from "./cover-letter-form";
import { PortfolioForm } from "./portfolio-form";

const MAX_CONTENT_LENGTH = 8000; // 최대 8000 제한

// OCR 마커 템플릿
const getOcrMarker = (pageNum: number) => `[📄 페이지 ${pageNum} - OCR 추출]`;
const getReviewedMarker = (pageNum: number) =>
  `[✓ 페이지 ${pageNum} - 검수완료]`;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (document: DocumentItem) => void;
}

interface QuestionAnswer {
  question: string;
  answer: string;
}

export default function DocumentCreateModal({
  open,
  onClose,
  onCreate,
}: Props) {
  const [documentType, setDocumentType] = useState<"COVER" | "PORTFOLIO">(
    "COVER",
  );
  const [title, setTitle] = useState("");
  const [questionAnswerList, setQuestionAnswerList] = useState<
    QuestionAnswer[]
  >([{ question: "", answer: "" }]);
  const [portfolioContent, setPortfolioContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [uploadProgress, setUploadProgress] =
    useState<IPdfExtractionProgress | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [ocrUsedPages, setOcrUsedPages] = useState<number[]>([]);
  const [showMarkerWarning, setShowMarkerWarning] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 포트폴리오 글자수 계산
  const portfolioLength = portfolioContent.length;
  const isPortfolioTooLong = portfolioLength > MAX_CONTENT_LENGTH;

  if (!open) return null;

  function markPageAsReviewed(pageNum: number) {
    setPortfolioContent((prev) =>
      prev.replace(getOcrMarker(pageNum), getReviewedMarker(pageNum)),
    );
    setShowMarkerWarning(false);
  }

  function scrollToPageMarker(pageNum: number) {
    const ocrMarker = getOcrMarker(pageNum);
    const reviewedMarker = getReviewedMarker(pageNum);

    let markerIndex = portfolioContent.indexOf(ocrMarker);
    let marker = ocrMarker;

    if (markerIndex === -1) {
      markerIndex = portfolioContent.indexOf(reviewedMarker);
      marker = reviewedMarker;
    }

    if (markerIndex !== -1 && textareaRef.current) {
      const textarea = textareaRef.current;

      // 브라우저의 자동 스크롤 기능 활용
      // 1. 일단 커서를 마커 시작 위치로 이동
      textarea.focus();
      textarea.setSelectionRange(markerIndex, markerIndex);

      // 2. blur/focus로 브라우저가 커서 위치로 스크롤하게 강제
      textarea.blur();
      textarea.focus();

      // 3. 마커 전체를 선택해서 하이라이트
      textarea.setSelectionRange(markerIndex, markerIndex + marker.length);
    }
  }

  function updateQuestionAnswer(
    targetIndex: number,
    field: keyof QuestionAnswer,
    value: string,
  ) {
    setQuestionAnswerList((previousList) => {
      const newList = [...previousList];
      newList[targetIndex] = { ...newList[targetIndex], [field]: value };
      return newList;
    });
  }

  function addQuestionAnswer() {
    setQuestionAnswerList((previousList) => [
      ...previousList,
      { question: "", answer: "" },
    ]);
  }

  function removeQuestionAnswer(targetIndex: number) {
    setQuestionAnswerList((previousList) =>
      previousList.filter((_, index) => index !== targetIndex),
    );
  }

  async function handlePdfUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("PDF 파일만 업로드 가능합니다.");
      return;
    }

    try {
      setIsExtracting(true);
      const result = await extractTextFromPdf(file, (progress) => {
        setUploadProgress(progress);
      });

      // 추출된 텍스트를 포트폴리오 내용에 설정
      setPortfolioContent(result.text);
      setUploadProgress(null);

      // OCR 사용 페이지 정보 저장
      setOcrUsedPages(result.ocrUsedPages);

      // 글자수 초과 경고
      if (result.totalCharacters > MAX_CONTENT_LENGTH) {
        alert(
          `추출된 텍스트가 ${result.totalCharacters.toLocaleString()}자로 최대 허용 글자수(${MAX_CONTENT_LENGTH.toLocaleString()}자)를 초과합니다. 텍스트를 줄여주세요.`,
        );
      }

      // 파일 이름을 제목으로 설정 (확장자 제거)
      if (!title) {
        setTitle(file.name.replace(".pdf", ""));
      }
    } catch (error) {
      console.error("PDF 추출 실패:", error);
      alert("PDF 텍스트 추출에 실패했습니다.");
      setUploadProgress(null);
    } finally {
      setIsExtracting(false);
      // input 초기화 (같은 파일 재선택 가능하도록)
      event.target.value = "";
    }
  }

  async function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();

    // 포트폴리오 타입일 때 OCR 마커 검사
    if (documentType === "PORTFOLIO") {
      const hasOcrMarker = /\[📄 페이지 \d+ - OCR 추출\]/g.test(
        portfolioContent,
      );
      if (hasOcrMarker) {
        setShowMarkerWarning(true);
        textareaRef.current?.focus();
        return;
      }
    }

    setIsLoading(true);

    try {
      let createdDocument: DocumentItem | { error: string } | undefined =
        undefined;
      if (documentType === "COVER") {
        const result = await createCoverLetter({
          title,
          qa: questionAnswerList,
        });

        createdDocument = result as DocumentItem;
      }

      if (documentType === "PORTFOLIO") {
        // 검수완료 마커는 제거하고 전송
        const cleanedContent = portfolioContent.replace(
          /\[✓ 페이지 \d+ - 검수완료\]\n/g,
          "",
        );

        createdDocument = await createPortfolio({
          title,
          content: cleanedContent,
        });
      }

      if (!createdDocument || "error" in createdDocument) {
        throw new Error("Document creation returned no data");
      }

      onCreate(createdDocument);
      onClose();
    } catch {
      alert("문서 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
      setTitle("");
      setQuestionAnswerList([{ question: "", answer: "" }]);
      setPortfolioContent("");
      setUploadProgress(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl"
      >
        <form
          className="max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
          onSubmit={handleSubmit}
        >
          <div className="sticky top-0 z-10 border-b bg-white px-8 py-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">새 서류 등록</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                variant={documentType === "COVER" ? "default" : "outline"}
                onClick={() => setDocumentType("COVER")}
                type="button"
                className="flex-1"
              >
                <FileText className="mr-2 h-4 w-4" />
                자기소개서
              </Button>
              <Button
                variant={documentType === "PORTFOLIO" ? "default" : "outline"}
                onClick={() => setDocumentType("PORTFOLIO")}
                type="button"
                className="flex-1"
              >
                <FileText className="mr-2 h-4 w-4" />
                포트폴리오
              </Button>
            </div>
          </div>

          <div className="space-y-6 p-8">
            {/* 제목 입력 */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                제목
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="서류 제목을 입력하세요"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            {/* 자기소개서 Q&A 카드 형식 */}
            {documentType === "COVER" ? (
              <CoverLetterForm
                questionAnswerList={questionAnswerList}
                onUpdate={updateQuestionAnswer}
                onAdd={addQuestionAnswer}
                onRemove={removeQuestionAnswer}
              />
            ) : (
              <PortfolioForm
                portfolioContent={portfolioContent}
                onContentChange={(content) => {
                  setPortfolioContent(content);
                  setShowMarkerWarning(false);
                }}
                textareaRef={textareaRef}
                isExtracting={isExtracting}
                uploadProgress={uploadProgress}
                ocrUsedPages={ocrUsedPages}
                showMarkerWarning={showMarkerWarning}
                onPdfUpload={handlePdfUpload}
                onMarkPageAsReviewed={markPageAsReviewed}
                onScrollToMarker={scrollToPageMarker}
              />
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="sticky bottom-0 border-t bg-gray-50 px-8 py-5">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={isLoading || isExtracting}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  isExtracting ||
                  (documentType === "PORTFOLIO" && isPortfolioTooLong)
                }
                className="min-w-24"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  "생성"
                )}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
