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

export interface PortfolioDetailResponse {
  documentId: string;
  type: "PORTFOLIO";
  portfolioId: string;
  title: string;
  content: string;
  createdAt: string;
  modifiedAt: string;
}

export interface CoverLetterDetailResponse {
  documentId: string;
  coverLetterId: string;
  type: "COVER";
  title: string;
  content: QuestionAnswer[];
  createdAt: string;
  modifiedAt: string;
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
        documentType === "COVER"
          ? `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/cover-letter`
          : `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/portfolio`;

      const response = await fetch(endpoint, { method: "DELETE" });

      if (!response.ok) {
        console.error(
          `문서 삭제 실패 (${documentId}):`,
          response.status,
          response.statusText,
        );
        throw new Error(`문서 삭제에 실패했습니다: ${documentId}`);
      }

      return { documentId, isSuccess: true };
    } catch (error) {
      console.error(`문서 삭제 중 오류 발생 (${documentId}):`, error);
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
      type: "COVER",
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
    console.error(
      "자기소개서 생성 실패:",
      response.status,
      response.statusText,
    );
    throw new Error("자기소개서 생성에 실패했습니다");
  }

  const responseData = await response.json();

  return {
    documentId: responseData.documentId,
    type: responseData.type,
    title: responseData.title,
    createdAt: responseData.createdAt,
    modifiedAt: responseData.createdAt,
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
    console.error(
      "포트폴리오 생성 실패:",
      response.status,
      response.statusText,
    );
    throw new Error("포트폴리오 생성에 실패했습니다");
  }

  const responseData = await response.json();

  return {
    documentId: responseData.documentId,
    type: responseData.type,
    title: responseData.title,
    createdAt: responseData.createdAt,
    modifiedAt: responseData.createdAt,
  };
}

/**
 * 포트폴리오 상세 조회
 */
export async function getPortfolioDetail(
  documentId: string,
): Promise<PortfolioDetailResponse> {
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      documentId,
      type: "PORTFOLIO",
      portfolioId: `portfolio-${documentId}`,
      title: "Sample Portfolio",
      content: "This is a sample portfolio content for development mode.",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/portfolio`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    console.error(
      "포트폴리오 조회 실패:",
      response.status,
      response.statusText,
    );
    throw new Error("포트폴리오를 불러오는데 실패했습니다");
  }

  return await response.json();
}

/**
 * 자기소개서 상세 조회
 */
export async function getCoverLetterDetail(
  documentId: string,
): Promise<CoverLetterDetailResponse> {
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      documentId,
      coverLetterId: `cover-${documentId}`,
      type: "COVER",
      title: "Sample Cover Letter",
      content: [
        { question: "질문 1", answer: "답변 1" },
        { question: "질문 2", answer: "답변 2" },
      ],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/cover-letter`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    console.error(
      "자기소개서 조회 실패:",
      response.status,
      response.statusText,
    );
    throw new Error("자기소개서를 불러오는데 실패했습니다");
  }

  return await response.json();
}

/**
 * 포트폴리오 수정
 */
export async function updatePortfolio(
  documentId: string,
  params: { title: string; content: string },
): Promise<PortfolioDetailResponse> {
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      documentId,
      type: "PORTFOLIO",
      portfolioId: `portfolio-${documentId}`,
      title: params.title,
      content: params.content,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/portfolio`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    },
  );

  if (!response.ok) {
    console.error(
      "포트폴리오 수정 실패:",
      response.status,
      response.statusText,
    );
    throw new Error("포트폴리오 수정에 실패했습니다");
  }

  return await response.json();
}

/**
 * 자기소개서 수정
 */
export async function updateCoverLetter(
  documentId: string,
  params: { title: string; content: QuestionAnswer[] },
): Promise<CoverLetterDetailResponse> {
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      documentId,
      coverLetterId: `cover-${documentId}`,
      type: "COVER",
      title: params.title,
      content: params.content,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/cover-letter`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    },
  );

  if (!response.ok) {
    console.error(
      "자기소개서 수정 실패:",
      response.status,
      response.statusText,
    );
    throw new Error("자기소개서 수정에 실패했습니다");
  }

  return await response.json();
}
