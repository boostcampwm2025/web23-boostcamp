import type { DocumentItem } from "@/app/(tabs)/(simulator)/components/document-card";

export const FALLBACK_MOCK_DATA: DocumentItem[] = [
  {
    documentId: "mock-1",
    type: "COVER",
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

export default FALLBACK_MOCK_DATA;
