import type { IHistoryItem } from "@/app/(tabs)/(simulator)/interview/[id]/actions";

export interface ICreateInterviewResponse {
  interviewId: string;
}

export async function createInterviewClient(
  body: Record<string, unknown>,
): Promise<ICreateInterviewResponse> {
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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/${interviewId}/chat/history`,
    { headers: { "Content-Type": "application/json" } },
  );

  if (!res.ok) throw new Error("API 요청 실패");
  return (await res.json()) as { history: IHistoryItem[] };
}

export async function sendAnswerClient(interviewId: string, answer: string) {
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
