"use server";

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
  // 개발 환경에서는 서버 호출을 생략하고 모의 응답을 반환합니다.
  if (process.env.NODE_ENV === "development") {
    await new Promise((r) => setTimeout(r, 100));
    return { answer: "[DEV] 개발 모드 음성 변환 샘플 응답" } as IAnswerResponse;
  }

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
  if (process.env.NODE_ENV === "development") {
    await new Promise((r) => setTimeout(r, 100));
    const mock = { answer: "[DEV] 개발 모드 채팅 응답" } as IAnswerResponse;
    console.log("DEV mock sendAnswer ->", mock);
    return mock;
  }

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
  if (process.env.NODE_ENV === "development") {
    await new Promise((r) => setTimeout(r, 100));
    return { interviewId: `dev-${Date.now()}` };
  }

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
  // 개발 환경에서는 빈 히스토리(또는 샘플)를 반환합니다.
  if (process.env.NODE_ENV === "development") {
    const now = new Date();
    const h1 = new Date(now.getTime() - 1000 * 60 * 60 * 3);
    const h2 = new Date(now.getTime() - 1000 * 60 * 60 * 2);
    const h3 = new Date(now.getTime() - 1000 * 60 * 60 * 1);

    const h1q = h1.toISOString();
    const h1a = new Date(h1.getTime() + 1000).toISOString();
    const h2q = h2.toISOString();
    const h2a = new Date(h2.getTime() + 1000).toISOString();
    const h3q = h3.toISOString();
    const h3a = new Date(h3.getTime() + 1000).toISOString();

    return {
      history: [
        {
          question: {
            content: "[DEV] 질문 1: 최근 진행한 프로젝트를 설명해 주세요.",
            createdAt: h1q,
          },
          answer: {
            content:
              "[DEV] 답변 1: 팀 리드로서 기능 설계와 성능 개선을 담당했습니다.",
            createdAt: h1a,
          },
        },
        {
          question: {
            content:
              "[DEV] 질문 2: 어려웠던 기술적 문제와 해결 방법은 무엇인가요?",
            createdAt: h2q,
          },
          answer: {
            content:
              "[DEV] 답변 2: 메모리 누수 문제를 프로파일링으로 찾아 GC 설정을 조정했습니다.",
            createdAt: h2a,
          },
        },
        {
          question: {
            content:
              "[DEV] 질문 3: 협업 과정에서 중요하게 생각하는 점은 무엇인가요?",
            createdAt: h3q,
          },
          answer: {
            content:
              "[DEV] 답변 3: 명확한 커뮤니케이션과 코드 리뷰로 품질을 유지합니다.",
            createdAt: h3a,
          },
        },
      ] as IHistoryItem[],
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/${interviewId}/chat/history`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("API 요청 실패");
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
  if (process.env.NODE_ENV === "development") {
    return {
      questionId: "sample-question-id",
      question: "[DEV] 이것은 샘플 질문입니다.",
      createdAt: new Date(),
      isLast: false,
    };
  }

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

  const data = (await response.json()) as IGenerateQuestion;
  return data;
}
