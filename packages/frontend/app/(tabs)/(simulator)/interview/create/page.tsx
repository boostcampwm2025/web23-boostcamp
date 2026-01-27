"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/app/lib/utils";
import { createInterviewClient } from "@/app/lib/client/interview";

import {
  DocumentCard,
  type DocType,
} from "@/app/(tabs)/(simulator)/components/document-card";
import { useDocuments } from "@/app/hooks/use-documents";

type InterviewMode = "live" | "tech";

interface SelectedDocs {
  COVER_LETTER: string | null;
  PORTFOLIO: string | null;
}

export default function InterviewCreatePage() {
  const router = useRouter();

  const userId = "1";
  const { documents, isLoading } = useDocuments(userId);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [mode, setMode] = useState<InterviewMode>("tech");

  const [selectedDocs, setSelectedDocs] = useState<SelectedDocs>({
    COVER_LETTER: null,
    PORTFOLIO: null,
  });

  const sortedDocs = useMemo(() => {
    return [...documents].sort(
      (a, b) =>
        new Date(b.createdAt.replace(/\./g, "-")).getTime() -
        new Date(a.createdAt.replace(/\./g, "-")).getTime(),
    );
  }, [documents]);

  const handleSelect = (id: string, type: DocType) => {
    setSelectedDocs((prev) => ({
      ...prev,
      [type]: prev[type] === id ? null : id,
    }));
  };

  const handleStartSimulation = async (): Promise<void> => {
    if (!title || (!selectedDocs.COVER_LETTER && !selectedDocs.PORTFOLIO))
      return;

    setIsSubmitting(true);

    try {
      const isTech = mode === "tech";

      const requestBody = isTech
        ? {
            documentIds: [
              selectedDocs.COVER_LETTER,
              selectedDocs.PORTFOLIO,
            ].filter((id): id is string => Boolean(id)),
          }
        : {
            simulationTitle: title,
            language: "javascript",
          };

      // 개발 모드면 서버 호출을 생략
      if (process.env.NODE_ENV === "development") {
        await new Promise((r) => setTimeout(r, 300));
        const interviewId = "1";
        router.push(`/interview/${interviewId}/ready`);
      } else {
        // 클라이언트 API 사용
        const data = await createInterviewClient(
          requestBody as Record<string, unknown>,
        );
        const interviewId = data.interviewId;
        router.push(`/interview/${interviewId}/ready`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-10 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          인터뷰 시뮬레이션 생성
        </h1>
        <p className="text-sm text-muted-foreground">
          시뮬레이션 정보를 입력하고 인터뷰에 활용할 서류를 지정하세요.
        </p>
      </header>

      <div className="space-y-12">
        {/* 1. 시뮬레이션 제목 */}
        <section className="flex flex-col items-start gap-3">
          <label className="block text-sm font-semibold text-foreground/80">
            시뮬레이션 제목
          </label>
          <Input
            placeholder="인터뷰를 식별할 수 있는 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 w-full max-w-xl text-base shadow-sm focus-visible:ring-primary"
          />
        </section>

        {/* 2. 인터뷰 종류 */}
        <section className="flex flex-col items-start gap-3">
          <label className="block text-sm font-semibold text-foreground/80">
            인터뷰 종류
          </label>
          <div className="relative flex w-fit overflow-hidden rounded-xl border bg-muted p-1">
            {(["tech", "live"] as InterviewMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "relative z-10 rounded-lg px-8 py-2.5 text-sm font-medium transition-colors outline-none",
                  mode === m
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {mode === m && (
                  <motion.div
                    layoutId="active-mode-tab"
                    className="absolute inset-0 z-[-1] rounded-md bg-white shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                {m === "tech" ? "기술 면접" : "라이브 코딩"}
              </button>
            ))}
          </div>
        </section>

        {/* 3. 서류 선택 섹션 */}
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b pb-2">
            <label className="text-sm font-semibold text-foreground/80">
              참고 서류 선택 (최대 각 1개)
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("미구현 기능입니다.")}
              className="h-9 gap-2 rounded-lg border-dashed border-muted-foreground/50 text-xs text-muted-foreground transition-all hover:border-primary hover:text-primary"
            >
              <Plus className="h-4 w-4" />새 서류 업로드
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4">
            {sortedDocs.length > 0 ? (
              sortedDocs.map((doc) => (
                <DocumentCard
                  key={doc.documentId}
                  doc={doc}
                  isSelected={selectedDocs[doc.type] === doc.documentId}
                  onSelect={(id) => handleSelect(id, doc.type)}
                />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border-2 border-dashed py-20 text-center text-sm text-muted-foreground">
                등록된 서류가 없습니다.
              </div>
            )}
          </div>
        </section>

        <footer className="flex justify-end border-t pt-8">
          <Button
            size="lg"
            className="h-14 px-12 text-base font-bold shadow-md transition-all active:scale-95"
            disabled={
              !title ||
              (!selectedDocs.COVER_LETTER && !selectedDocs.PORTFOLIO) ||
              isSubmitting
            }
            onClick={handleStartSimulation}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                처리 중...
              </>
            ) : (
              "면접 준비 페이지로 이동"
            )}
          </Button>
        </footer>
      </div>
    </div>
  );
}
