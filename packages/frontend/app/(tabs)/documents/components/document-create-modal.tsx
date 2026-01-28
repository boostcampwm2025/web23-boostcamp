"use client";

import React, { useState } from "react";
import { DocumentItem } from "@/app/(tabs)/(simulator)/components/document-card";
import {
  createCoverLetter,
  createPortfolio,
} from "../../../lib/client/document";
import { Button } from "@/app/components/ui/button";

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
      <form
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg"
        onSubmit={handleSubmit}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">새 서류 등록</h3>
          <div className="flex gap-2">
            <Button
              variant={documentType === "COVER_LETTER" ? "default" : "ghost"}
              onClick={() => setDocumentType("COVER_LETTER")}
              type="button"
            >
              커버레터
            </Button>
            <Button
              variant={documentType === "PORTFOLIO" ? "default" : "ghost"}
              onClick={() => setDocumentType("PORTFOLIO")}
              type="button"
            >
              포트폴리오
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            제목
          </label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        {documentType === "COVER_LETTER" ? (
          <div className="space-y-3">
            {questionAnswerList.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  placeholder={`질문 ${index + 1}`}
                  className="flex-1 rounded border px-2 py-1"
                  value={item.question}
                  onChange={(event) =>
                    updateQuestionAnswer(index, "question", event.target.value)
                  }
                  required
                />
                <input
                  placeholder={`답변 ${index + 1}`}
                  className="flex-1 rounded border px-2 py-1"
                  value={item.answer}
                  onChange={(event) =>
                    updateQuestionAnswer(index, "answer", event.target.value)
                  }
                  required
                />
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => removeQuestionAnswer(index)}
                >
                  삭제
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addQuestionAnswer}>
              질문 추가
            </Button>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              포트폴리오 내용
            </label>
            <textarea
              className="mt-1 h-48 w-full rounded border px-3 py-2"
              value={portfolioContent}
              onChange={(event) => setPortfolioContent(event.target.value)}
              required
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "생성중..." : "생성"}
          </Button>
        </div>
      </form>
    </div>
  );
}
