"use client";

import { useState, useEffect } from "react";
import { DocumentItem } from "@/app/(tabs)/(simulator)/components/document-card";
import {
  getCoverLetterDetail,
  getPortfolioDetail,
  updateCoverLetter,
  updatePortfolio,
  ICoverLetterDetailResponse,
  IPortfolioDetailResponse,
} from "@/app/lib/actions/document";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Trash2, AlertCircle, Save, X } from "lucide-react";
import { formatIsoDateToDot } from "@/app/lib/utils";

const MAX_CONTENT_LENGTH = 8000;

interface IProps {
  documentId: string | null;
  documentType: "COVER" | "PORTFOLIO";
  onClose: () => void;
  onUpdate: (document: DocumentItem) => void;
}

interface IQuestionAnswer {
  question: string;
  answer: string;
}

export default function DocumentDetailModal({
  documentId,
  documentType,
  onClose,
  onUpdate,
}: IProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [questionAnswerList, setQuestionAnswerList] = useState<
    IQuestionAnswer[]
  >([]);

  const [portfolioContent, setPortfolioContent] = useState("");

  const portfolioLength = portfolioContent.length;
  const isPortfolioTooLong = portfolioLength > MAX_CONTENT_LENGTH;

  useEffect(() => {
    if (!documentId) return;

    async function loadDocument() {
      if (!documentId) return;

      setIsLoading(true);
      try {
        if (documentType === "COVER") {
          const data: ICoverLetterDetailResponse =
            await getCoverLetterDetail(documentId);
          setTitle(data.title);
          setQuestionAnswerList(data.content);
        } else {
          const data: IPortfolioDetailResponse =
            await getPortfolioDetail(documentId);
          setTitle(data.title);
          setPortfolioContent(data.content);
        }
      } catch (error) {
        console.error("문서 조회 실패:", error);
        alert("문서를 불러오는데 실패했습니다.");
        onClose();
      } finally {
        setIsLoading(false);
      }
    }

    loadDocument();
  }, [documentId, documentType, onClose]);

  function updateQuestionAnswer(
    targetIndex: number,
    field: keyof IQuestionAnswer,
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

  async function handleSave() {
    if (!documentId) return;

    setIsSaving(true);
    try {
      if (documentType === "COVER") {
        const updatedData = await updateCoverLetter(documentId, {
          title,
          content: questionAnswerList,
        });
        onUpdate({
          documentId: updatedData.documentId,
          type: updatedData.type,
          title: updatedData.title,
          createdAt: formatIsoDateToDot(updatedData.createdAt),
          modifiedAt: formatIsoDateToDot(updatedData.modifiedAt),
        });
      } else {
        const updatedData = await updatePortfolio(documentId, {
          title,
          content: portfolioContent,
        });
        onUpdate({
          documentId: updatedData.documentId,
          type: updatedData.type,
          title: updatedData.title,
          createdAt: formatIsoDateToDot(updatedData.createdAt),
          modifiedAt: formatIsoDateToDot(updatedData.modifiedAt),
        });
      }
      onClose();
    } catch (error) {
      console.error("문서 수정 실패:", error);
      alert("문서 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!documentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl"
      >
        <div className="max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
          <div className="sticky top-0 z-10 border-b bg-white px-8 py-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {documentType === "COVER" ? "자기소개서" : "포트폴리오"}{" "}
                상세보기
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
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

                  <AnimatePresence mode="wait">
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
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700">
                    포트폴리오 내용
                  </label>

                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm leading-relaxed transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    placeholder="포트폴리오 내용을 입력하세요"
                    rows={16}
                    value={portfolioContent}
                    onChange={(event) =>
                      setPortfolioContent(event.target.value)
                    }
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

              {/* 하단 버튼 */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={onClose} disabled={isSaving}>
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    isSaving ||
                    (documentType === "PORTFOLIO" && isPortfolioTooLong)
                  }
                  className="min-w-24"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      저장
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
