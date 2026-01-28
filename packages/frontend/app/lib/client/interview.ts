import type { IHistoryItem } from "@/app/(tabs)/(simulator)/interview/[id]/actions";

export interface ICreateInterviewResponse {
  interviewId: string;
}

export async function createInterviewClient(
  body: Record<string, unknown>,
): Promise<ICreateInterviewResponse> {
  if (process.env.NODE_ENV === "development" && false) {
    await new Promise((r) => setTimeout(r, 200));
    return { interviewId: `dev-${Date.now()}` };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/tech/create`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) throw new Error("API 요청 실패");
  return (await res.json()) as ICreateInterviewResponse;
}

export async function getHistoryClient(interviewId: string) {
  if (process.env.NODE_ENV === "development" && false) {
    return { history: [] as IHistoryItem[] };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/${interviewId}/chat/history`,
    { headers: { "Content-Type": "application/json" } },
  );

  if (!res.ok) throw new Error("API 요청 실패");
  return (await res.json()) as { history: IHistoryItem[] };
}

export async function sendAnswerClient(interviewId: string, answer: string) {
  if (process.env.NODE_ENV === "development" && false) {
    await new Promise((r) => setTimeout(r, 100));
    return { answer: "[DEV] 개발 모드 채팅 응답" };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/answer/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewId, answer }),
    },
  );
  if (!res.ok) throw new Error("API 요청 실패");
  return await res.json();
}

export async function speakAnswerClient(interviewId: string, audio: Blob) {
  if (process.env.NODE_ENV === "development" && false) {
    await new Promise((r) => setTimeout(r, 100));
    return { answer: "[DEV] 개발 모드 음성 응답" };
  }

  const fd = new FormData();
  fd.append("interviewId", interviewId);
  fd.append("file", audio, "answer.webm");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/answer/voice`,
    {
      method: "POST",
      body: fd,
    },
  );
  if (!res.ok) throw new Error("API 요청 실패");
  return await res.json();
}

export async function generateQuestionClient(interviewId: string) {
  if (process.env.NODE_ENV === "development" && false) {
    return {
      questionId: "sample-question-id",
      question: "[DEV] 이것은 샘플 질문입니다.",
      createdAt: new Date().toISOString(),
      isLast: false,
    };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/tech/question`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewId }),
    },
  );
  if (!res.ok) throw new Error("API 요청 실패");
  return await res.json();
}
