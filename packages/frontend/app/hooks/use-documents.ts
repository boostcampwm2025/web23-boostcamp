import { useState, useEffect } from "react";
import { DocumentItem } from "@/app/(tabs)/(simulator)/components/document-card";

// API 응답 타입 정의
interface ApiDocumentItem {
  documentId: string;
  type: "COVER" | "PORTFOLIO";
  title: string;
  createdAt: string;
}

interface DocumentResponse {
  documents: ApiDocumentItem[];
}

// 서버가 응답하지 않을 때 보여줄 임시 데이터
const FALLBACK_MOCK_DATA: DocumentItem[] = [
  {
    documentId: "mock-1",
    type: "COVER_LETTER",
    title: "[DEV] 2024 하반기 공통 자소서",
    createdAt: "2024.05.12",
    modifiedAt: "2024.05.12",
  },
  {
    documentId: "mock-2",
    type: "PORTFOLIO",
    title: "[DEV] FE 아키텍트 포트폴리오",
    createdAt: "2024.04.28",
    modifiedAt: "2024.04.28",
  },
];

export function useDocuments(userId: string) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const loadDocs = async () => {
      try {
        setIsLoading(true);
        // 개발 모드면 서버 호출을 생략
        if (process.env.NODE_ENV === "development") {
          setDocuments(FALLBACK_MOCK_DATA);
          setIsLoading(false);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/document?page=1&take=10`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!res.ok) throw new Error("서류 목록 조회 실패");

        const data: DocumentResponse = await res.json();
        const mapped: DocumentItem[] = data.documents.map((item) => ({
          documentId: item.documentId,
          type: item.type === "COVER" ? "COVER_LETTER" : "PORTFOLIO",
          title: item.title,
          createdAt: item.createdAt.split("T")[0].replace(/-/g, "."),
          modifiedAt: item.createdAt.split("T")[0].replace(/-/g, "."),
        }));
        setDocuments(mapped);
      } catch (err) {
        console.error(
          "API 호출 실패 또는 DEV 모드 — Mock 데이터로 대체합니다:",
          err,
        );
        setDocuments(FALLBACK_MOCK_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocs();
  }, [userId]);

  return { documents, isLoading };
}
