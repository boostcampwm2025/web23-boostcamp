"use server";

import { getUserSession } from "@/app/lib/server/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function readResponsePayload(response: Response) {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return JSON.stringify(await response.json());
    }
    return await response.text();
  } catch {
    return "<failed to read response body>";
  }
}

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

  const mime = audio.type || "application/octet-stream";
  const ext = mime.includes("ogg")
    ? "ogg"
    : mime.includes("webm")
      ? "webm"
      : mime.includes("wav")
        ? "wav"
        : mime.includes("mp4")
          ? "m4a"
          : "bin";
  formData.append("file", audio, `answer.${ext}`);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/answer/voice`,
    {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    },
  );

  if (!response.ok) {
    // 백엔드가 내려주는 에러 메시지를 최대한 노출해 디버깅 가능하게
    const payload = await readResponsePayload(response);
    throw new Error(
      `API 요청 실패 (${response.status} ${response.statusText}) - ${payload}`,
    );
  }

  const data = (await response.json()) as IAnswerResponse;
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
    const payload = await readResponsePayload(response);
    throw new Error(
      `API 요청 실패 (${response.status} ${response.statusText}) - ${payload}`,
    );
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
    const payload = await readResponsePayload(response);
    throw new Error(
      `API 요청 실패 (${response.status} ${response.statusText}) - ${payload}`,
    );
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
    const payload = await readResponsePayload(response);
    throw new Error(
      `API 요청 실패 (${response.status} ${response.statusText}) - ${payload}`,
    );
  }

  const data = (await response.json()) as IGenerateQuestion;
  return data;
}
