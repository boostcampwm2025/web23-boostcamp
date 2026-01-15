"use server";

import { IChatMessage } from "@/app/components/chat-history";

interface IAnswerResponse {
  answer: string;
}

export async function speakAnswer({
  interviewId,
  audio,
}: {
  interviewId: string;
  audio: Blob;
}) {
  const formData = new FormData();
  formData.append("interviewId", interviewId);
  formData.append("file", audio, "answer.webm");
  const reponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/answer/voice`,
    {
      method: "POST",
      body: formData,
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
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/answer/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ interviewId, answer }),
    },
  );

  if (!response.ok) {
    throw new Error("API 요청 실패");
  }

  const data = (await response.json()) as IAnswerResponse;
  console.log(data);
  return data;
}

export async function createInterview() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/tech/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error("API 요청 실패");
  }
  return await response.json();
}

export async function getHistory({ interviewId }: { interviewId: string }) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/${interviewId}/chat/history`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error("API 요청 실패");
  }
  const history = (await response.json()) as {
    history: {
      question: { content: string; createdAt: string };
      answer: { content: string; createdAt: string };
    }[];
  };

  const filteredHistory = history.history.filter(
    (item) => item.answer !== null,
  );
  const initialChats = filteredHistory
    .map((item) => ({
      id: crypto.randomUUID(),
      sender: "ai",
      role: "ai",
      content: item.question.content,
      timestamp: new Date(item.question.createdAt),
    }))
    .concat(
      filteredHistory.map((item) => ({
        id: crypto.randomUUID(),
        sender: "user",
        role: "user",
        content: item.answer ? item.answer.content || "" : "",
        timestamp: new Date(item.answer ? item.answer.createdAt || "" : ""),
      })),
    ) as IChatMessage[];
  initialChats.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  return { history: initialChats };
}

export async function generateQuestion({
  interviewId,
}: {
  interviewId: string;
}) {
  /* id=1&date=2024-10-20  */
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/tech/question`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ interviewId }),
    },
  );
  if (!response.ok) {
    throw new Error("API 요청 실패");
  }

  const data = await response.json();
  return data;
}
