"use server";

import { getUserSession } from "@/app/lib/server/session";
import { isApiMockEnabled } from "@/app/lib/server/env";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface IAnswerResponse {
  answer: string;
}

export interface IHistoryItem {
  question: {
    content: string;
    createdAt: string;
  };
  answer?: {
    content: string;
    createdAt: string;
  } | null;
}

export interface IHistoryResponse {
  history: IHistoryItem[];
}

export async function speakAnswer({
  interviewId,
  audio,
}: {
  interviewId: string;
  audio: Blob;
}) {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }

  const formData = new FormData();
  formData.append("interviewId", interviewId);
  formData.append("file", audio, "answer.webm");

  if (isApiMockEnabled()) {
    await new Promise((r) => setTimeout(r, 120));
    return { answer: "[MOCK] 음성 응답(서버사이드)" } as IAnswerResponse;
  }

  const reponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/answer/voice`,
    {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    },
  );

  if (!reponse.ok) {
    throw new Error("API 요청 실패");
  }

  const data = (await reponse.json()) as IAnswerResponse;
  return data;
}

export async function sendAnswer({
  interviewId,
  answer,
}: {
  interviewId: string;
  answer: string;
}) {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }

  if (isApiMockEnabled()) {
    await new Promise((r) => setTimeout(r, 60));
    revalidatePath(`/interview/${interviewId}/result`);
    return { answer: "[MOCK] 채팅 응답(서버사이드)" } as IAnswerResponse;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/answer/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ interviewId, answer }),
    },
  );

  if (!response.ok) {
    throw new Error("API 요청 실패");
  }

  const data = (await response.json()) as IAnswerResponse;
  revalidatePath(`/interview/${interviewId}/result`);
  return data;
}

export async function getHistory({
  interviewId,
  userToken,
}: {
  interviewId: string;
  userToken: string;
}) {
  if (isApiMockEnabled()) {
    return {
      history: [
        {
          question: {
            content: "[MOCK] JavaScript의 이벤트 루프에 대해 설명해주세요.",
            createdAt: new Date(Date.now() - 300000).toISOString(),
          },
          answer: {
            content:
              "[MOCK] 이벤트 루프는 콜스택과 태스크큐를 관리하며 비동기 작업을 처리합니다.",
            createdAt: new Date(Date.now() - 240000).toISOString(),
          },
        },
        {
          question: {
            content: "[MOCK] React의 Virtual DOM에 대해 설명해주세요.",
            createdAt: new Date(Date.now() - 120000).toISOString(),
          },
          answer: {
            content:
              "[MOCK] Virtual DOM은 실제 DOM의 가벼운 복사본으로, 효율적인 렌더링을 가능하게 합니다.",
            createdAt: new Date(Date.now() - 60000).toISOString(),
          },
        },
        {
          question: {
            content: "[MOCK] 클로저란 무엇인가요?",
            createdAt: new Date().toISOString(),
          },
          answer: null,
        },
      ],
    } as IHistoryResponse & { history: IHistoryItem[] };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/${interviewId}/chat/history`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("API 요청에 실패하였습니다.");
  }

  const { history } = (await response.json()) as IHistoryResponse;
  return { history };
}

export interface IGenerateQuestion {
  questionId: string;
  question: string;
  createdAt: string;
  isLast: boolean;
}
export async function generateQuestion({
  interviewId,
}: {
  interviewId: string;
}) {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }

  if (isApiMockEnabled()) {
    return {
      questionId: `mock-${Date.now()}`,
      question: "[MOCK] 예시 질문입니다.",
      createdAt: new Date().toISOString(),
      isLast: false,
    } as IGenerateQuestion;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/tech/question`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ interviewId }),
    },
  );

  if (!response.ok) {
    throw new Error("API 요청 실패");
  }

  const data = (await response.json()) as IGenerateQuestion;
  return data;
}
