"use server";

interface IAnswerResponse {
  answer: string;
}

interface IHistoryItem {
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
    { method: "GET", headers: { "Content-Type": "application/json" }, cache: 'no-store' },
  );

  if (!response.ok) throw new Error("API 요청 실패");
  const data = (await response.json()) as IHistoryResponse;
  
  // Set이나 Map을 써서 중복을 물리적으로 제거
  const uniqueMessages = new Map();

  console.log("--- [Server Raw Data History] ---");
  console.log(JSON.stringify(data.history, null, 2));
  data.history.forEach((item: IHistoryItem) => {
    // 1. 질문 처리
    if (item.question) {
      const qKey = `q-${item.question.createdAt}-${item.question.content.substring(0, 10)}`;
      uniqueMessages.set(qKey, {
        id: qKey,
        sender: "Interviewer",
        role: "ai",
        content: item.question.content,
        timestamp: new Date(item.question.createdAt).toISOString(),
      });
    }
    // 2. 답변 처리
    if (item.answer) {
      const aKey = `a-${item.answer.createdAt}-${item.answer.content.substring(0, 10)}`;
      uniqueMessages.set(aKey, {
        id: aKey,
        sender: "You",
        role: "user",
        content: item.answer.content,
        timestamp: new Date(item.answer.createdAt).toISOString(),
      });
    }
  });

  // 시간순 정렬
  const history = Array.from(uniqueMessages.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return { history };
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
