"use client";

import React, { useState } from "react";
import { DocumentItem } from "@/app/(tabs)/(simulator)/components/document-card";
import {
  createCoverLetter,
  createPortfolio,
} from "../../../lib/client/document";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import {
  extractTextFromPdf,
  PdfExtractionProgress,
} from "@/app/lib/pdf-extractor";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  FileText,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";

const MAX_CONTENT_LENGTH = 30000; // 최대 3만자 제한

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
  const [documentType, setDocumentType] = useState<
    "COVER_LETTER" | "PORTFOLIO"
  >("COVER_LETTER");
  const [title, setTitle] = useState("");
  const [questionAnswerList, setQuestionAnswerList] = useState<
    QuestionAnswer[]
  >([{ question: "", answer: "" }]);
  const [portfolioContent, setPortfolioContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [uploadProgress, setUploadProgress] =
    useState<PdfExtractionProgress | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // 포트폴리오 글자수 계산
  const portfolioLength = portfolioContent.length;
  const isPortfolioTooLong = portfolioLength > MAX_CONTENT_LENGTH;

  if (!open) return null;

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

      // OCR 사용 경고
      if (result.ocrPagesCount > 0) {
        alert(
          `${result.ocrPagesCount}개 페이지에서 이미지 기반 OCR이 사용되었습니다.\n텍스트가 부정확할 수 있으니 반드시 확인 후 수정해주세요.`,
        );
      }

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
    setIsLoading(true);

    try {
      let createdDocument: DocumentItem;
      if (documentType === "COVER_LETTER") {
        createdDocument = await createCoverLetter({
          title,
          qa: questionAnswerList,
        });
      } else {
        createdDocument = await createPortfolio({
          title,
          content: portfolioContent,
        });
      }
      onCreate(createdDocument);
      onClose();
    } catch (error) {
      console.error("Document creation failed:", error);
      alert("문서 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
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
                variant={
                  documentType === "COVER_LETTER" ? "default" : "outline"
                }
                onClick={() => setDocumentType("COVER_LETTER")}
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
            {documentType === "COVER_LETTER" ? (
              <div className="space-y-4">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    질문 & 답변
                  </label>
                  <Button
                    type="button"
                    onClick={addQuestionAnswer}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    질문 추가
                  </Button>
                </div>

                <AnimatePresence mode="popLayout">
                  {questionAnswerList.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="relative overflow-hidden border-2 p-5 transition-shadow hover:shadow-md">
                        <div className="absolute top-0 left-0 h-full w-1 bg-blue-500" />

                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500">
                            질문 {index + 1}
                          </span>
                          {questionAnswerList.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => removeQuestionAnswer(index)}
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <input
                          placeholder="질문을 입력하세요"
                          className="mb-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/20 focus:outline-none"
                          value={item.question}
                          onChange={(event) =>
                            updateQuestionAnswer(
                              index,
                              "question",
                              event.target.value,
                            )
                          }
                          required
                        />

                        <textarea
                          placeholder="답변을 입력하세요"
                          className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none"
                          rows={4}
                          value={item.answer}
                          onChange={(event) =>
                            updateQuestionAnswer(
                              index,
                              "answer",
                              event.target.value,
                            )
                          }
                          required
                        />
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              // 포트폴리오 PDF 업로드 및 텍스트 편집
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    포트폴리오 내용
                  </label>
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                  >
                    <Upload className="mr-1.5 inline h-4 w-4" />
                    PDF 업로드
                  </label>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handlePdfUpload}
                    disabled={isExtracting}
                  />
                </div>

                {/* PDF 추출 진행률 */}
                {uploadProgress && (
                  <Card className="border-blue-200 bg-blue-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-blue-700">
                        {uploadProgress.message}
                      </span>
                      <span className="text-blue-600">
                        {uploadProgress.currentPage}/{uploadProgress.totalPages}
                      </span>
                    </div>
                    <Progress
                      value={
                        (uploadProgress.currentPage /
                          uploadProgress.totalPages) *
                        100
                      }
                      className="h-2"
                    />
                  </Card>
                )}

                <textarea
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm leading-relaxed transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  placeholder="포트폴리오 내용을 입력하거나 PDF를 업로드하세요"
                  rows={16}
                  value={portfolioContent}
                  onChange={(event) => setPortfolioContent(event.target.value)}
                  disabled={isExtracting}
                  required
                />

                {/* 글자수 카운터 */}
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-medium ${
                      isPortfolioTooLong ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    {portfolioLength.toLocaleString()} /{" "}
                    {MAX_CONTENT_LENGTH.toLocaleString()}자
                  </span>
                  {isPortfolioTooLong && (
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      최대 글자수를 초과했습니다
                    </span>
                  )}
                </div>
              </div>
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
