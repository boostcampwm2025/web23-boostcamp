import { useState, useEffect } from "react";
import { DocumentItem } from "@/app/(tabs)/(simulator)/components/document-card";
import { FALLBACK_MOCK_DATA } from "@/app/lib/mock/documents";
import { formatIsoDateToDot } from "@/app/lib/utils";

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
          createdAt: formatIsoDateToDot(item.createdAt),
          modifiedAt: formatIsoDateToDot(item.createdAt),
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
