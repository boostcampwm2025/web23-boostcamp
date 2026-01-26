import { DocumentItem } from "@/app/(tabs)/(simulator)/components/document-card";

interface QuestionAnswer {
  question: string;
  answer: string;
}

interface CreateCoverLetterParameters {
  title: string;
  qa: QuestionAnswer[];
}

interface CreatePortfolioParameters {
  title: string;
  content: string;
}

/**
 * [임시 벌크] 클라이언트에서 개별 삭제 API를 반복 호출하여 일괄 삭제를 수행함.
 * 나중에 단일 API로 일괄 삭제하는 진짜 Bulk API가 나오기 전까지 사용.
 */
export async function deleteDocumentsClientSideBulk(
  documentIds: string[],
  documentsMap?: Record<string, DocumentItem>,
): Promise<{ successIds: string[]; failedIds: string[] }> {
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { successIds: documentIds, failedIds: [] };
  }

  const deletionPromises = documentIds.map(async (documentId) => {
    try {
      const document = documentsMap ? documentsMap[documentId] : undefined;
      const documentType = document?.type ?? "PORTFOLIO";

      const endpoint =
        documentType === "COVER_LETTER"
          ? `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/cover-letter`
          : `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/portfolio`;

      const response = await fetch(endpoint, { method: "DELETE" });

      if (!response.ok) {
        throw new Error(`Failed to delete document: ${documentId}`);
      }

      return { documentId, isSuccess: true };
    } catch (error) {
      console.error(`Error deleting document ${documentId}:`, error);
      return { documentId, isSuccess: false };
    }
  });

  const results = await Promise.all(deletionPromises);

  const successIds = results
    .filter((result) => result.isSuccess)
    .map((result) => result.documentId);

  const failedIds = results
    .filter((result) => !result.isSuccess)
    .map((result) => result.documentId);

  return { successIds, failedIds };
}

/**
 * 새 자기소개서를 생성하는 함수
 */
export async function createCoverLetter(
  parameters: CreateCoverLetterParameters,
): Promise<DocumentItem> {
  if (process.env.NODE_ENV === "development") {
    const currentTime = new Date().toISOString();
    return {
      documentId: `mock-cover-${Date.now()}`,
      type: "COVER_LETTER",
      title: parameters.title || "Untitled Cover Letter",
      createdAt: currentTime,
      modifiedAt: currentTime,
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document/cover-letter/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: parameters.title,
        content: parameters.qa,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create cover letter");
  }

  const responseData = await response.json();

  return {
    documentId: responseData.documentId,
    type: responseData.type,
    title: responseData.title,
    createdAt: responseData.createdAt,
    modifiedAt: responseData.modifiedAt,
  };
}

/**
 * 새 포트폴리오를 생성하는 함수
 */
export async function createPortfolio(
  parameters: CreatePortfolioParameters,
): Promise<DocumentItem> {
  if (process.env.NODE_ENV === "development") {
    const currentTime = new Date().toISOString();
    return {
      documentId: `mock-portfolio-${Date.now()}`,
      type: "PORTFOLIO",
      title: parameters.title || "Untitled Portfolio",
      createdAt: currentTime,
      modifiedAt: currentTime,
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document/portfolio/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: parameters.title,
        content: parameters.content,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create portfolio");
  }

  const responseData = await response.json();

  return {
    documentId: responseData.documentId,
    type: responseData.type,
    title: responseData.title,
    createdAt: responseData.createdAt,
    modifiedAt: responseData.modifiedAt,
  };
}
