"use server";
import { DocumentItem } from "@/app/(tabs)/(simulator)/components/document-card";
import { getUserSession } from "../server/session";

import { z } from "zod";
import { redirect } from "next/navigation";
import { formatIsoDateToDot } from "../utils";

interface IQuestionAnswer {
  question: string;
  answer: string;
}

interface ICreatePortfolioParameters {
  title: string;
  content: string;
}

export interface IPortfolioDetailResponse {
  documentId: string;
  type: "PORTFOLIO";
  portfolioId: string;
  title: string;
  content: string;
  createdAt: string;
  modifiedAt: string;
}

export interface ICoverLetterDetailResponse {
  documentId: string;
  coverLetterId: string;
  type: "COVER";
  title: string;
  content: IQuestionAnswer[];
  createdAt: string;
  modifiedAt: string;
}

interface IDeleteDocumentResult {
  documentId: string;
  isSuccess: boolean;
}

export interface IDeleteDocumentsResponse {
  successIds: string[];
  failedIds: string[];
}

/**
 * [임시 벌크] 클라이언트에서 개별 삭제 API를 반복 호출하여 일괄 삭제를 수행함.
 * 나중에 단일 API로 일괄 삭제하는 진짜 Bulk API가 나오기 전까지 사용.
 */
export async function deleteDocumentsClientSideBulk(
  documentIds: string[],
  documentsMap?: Record<string, DocumentItem>,
) {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }

  const deletionPromises = documentIds.map(async (documentId) => {
    try {
      const document = documentsMap ? documentsMap[documentId] : undefined;
      const documentType = document?.type ?? "PORTFOLIO";

      const endpoint =
        documentType === "COVER"
          ? `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/cover-letter`
          : `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/portfolio`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        console.error(
          `문서 삭제 실패 (${documentId}):`,
          response.status,
          response.statusText,
        );
        throw new Error(`문서 삭제에 실패했습니다: ${documentId}`);
      }

      return { documentId, isSuccess: true } as IDeleteDocumentResult;
    } catch (error) {
      console.error(`문서 삭제 중 오류 발생 (${documentId}):`, error);
      return { documentId, isSuccess: false } as IDeleteDocumentResult;
    }
  });

  const results = await Promise.all(deletionPromises);

  const successIds = results
    .filter((result) => result.isSuccess)
    .map((result) => result.documentId);

  const failedIds = results
    .filter((result) => !result.isSuccess)
    .map((result) => result.documentId);

  return { successIds, failedIds } as IDeleteDocumentsResponse;
}

/**
 * 새 포트폴리오를 생성하는 함수
 */
export async function createPortfolio(parameters: ICreatePortfolioParameters) {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/document/portfolio/create`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user?.token}`,
    },
    body: JSON.stringify({
      title: parameters.title,
      content: parameters.content,
    }),
  });

  if (!response.ok) {
    throw new Error("포트폴리오 생성에 실패했습니다");
  }

  const responseData = await response.json();

  return {
    documentId: responseData.documentId,
    type: responseData.type,
    title: responseData.title,
    createdAt: formatIsoDateToDot(responseData.createdAt),
    modifiedAt: formatIsoDateToDot(responseData.createdAt),
  } as DocumentItem;
}

/**
 * 포트폴리오 상세 조회
 */
export async function getPortfolioDetail(documentId: string) {
  const { user } = await getUserSession();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/portfolio`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("포트폴리오를 불러오는데 실패했습니다");
  }

  return (await response.json()) as IPortfolioDetailResponse;
}

/**
 * 자기소개서 상세 조회
 */
export async function getCoverLetterDetail(documentId: string) {
  const { user } = await getUserSession();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/cover-letter`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("자기소개서를 불러오는데 실패했습니다");
  }

  return (await response.json()) as ICoverLetterDetailResponse;
}

/**
 * 포트폴리오 수정
 */
export async function updatePortfolio(
  documentId: string,
  params: { title: string; content: string },
) {
  const { user } = await getUserSession();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/portfolio`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify(params),
    },
  );

  if (!response.ok) {
    throw new Error("포트폴리오 수정에 실패했습니다");
  }

  return (await response.json()) as IPortfolioDetailResponse;
}

/**
 * 자기소개서 수정
 */
export async function updateCoverLetter(
  documentId: string,
  params: { title: string; content: IQuestionAnswer[] },
) {
  const { user } = await getUserSession();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document/${documentId}/cover-letter`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify(params),
    },
  );

  if (!response.ok) {
    throw new Error("자기소개서 수정에 실패했습니다");
  }

  return (await response.json()) as ICoverLetterDetailResponse;
}

const coverLetterSchema = z.object({
  title: z.string().min(1).max(100),
  qa: z
    .array(
      z.object({
        question: z.string().min(1).max(500),
        answer: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

export async function createCoverLetter(params: {
  title: string;
  qa: { question: string; answer: string }[];
}) {
  const parseResult = coverLetterSchema.safeParse({
    title: params.title,
    qa: params.qa,
  });

  if (!parseResult.success) {
    return {
      error: "INVALID_PARAMETERS",
    } as { error: string };
  }

  const { user } = await getUserSession();
  if (!user) {
    return redirect("/");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document/cover-letter/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({
        title: parseResult.data.title,
        content: parseResult.data.qa,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("자기소개서 생성에 실패했습니다");
  }

  const responseData = await response.json();

  return {
    documentId: responseData.documentId,
    type: responseData.type,
    title: responseData.title,
    createdAt: formatIsoDateToDot(responseData.createdAt),
    modifiedAt: formatIsoDateToDot(responseData.createdAt),
  } as ICoverLetterDetailResponse;
}

export interface IDocumentsResponse {
  documents: DocumentItem[];
}

export async function getDocuments({
  page,
  take,
}: { page?: number; take?: number } = {}) {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document?page=${page ?? 1}&take=${take ?? 20}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error("문서 조회 실패");
  }

  return (await res.json()) as IDocumentsResponse;
}
