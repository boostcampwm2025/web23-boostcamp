"use server";

import { getUserSession } from "@/app/lib/server/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface IAnswerResponse {
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

interface IHistoryResponse {
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

interface IGenerateQuestion {
  questionId: string;
  question: string;
  createdAt: Date;
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
