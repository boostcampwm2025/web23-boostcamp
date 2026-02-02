"use server";

import { isApiMockEnabled } from "@/app/lib/server/env";

interface IFeedback {
  score: string;
  feedback: string;
}

export async function getFeedback({
  interviewId,
  userToken,
}: {
  interviewId: string;
  userToken: string;
}) {
  if (isApiMockEnabled()) {
    return {
      score: "85",
      feedback:
        "[MOCK] 전반적으로 잘 수행하셨습니다. 기술적 이해도가 높으며, 답변이 명확했습니다.",
    };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/${interviewId}/feedback`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("피드백 조회 실패");
  }

  return (await res.json()) as IFeedback;
}

export async function startFeedback({
  interviewId,
  userToken,
}: {
  interviewId?: string;
  userToken: string;
}) {
  if (isApiMockEnabled()) {
    return {
      score: "82",
      feedback:
        "[MOCK] 새로 생성된 피드백입니다. 답변의 깊이를 더 추가하면 좋겠습니다.",
    };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/feedback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ interviewId }),
    },
  );

  if (!res.ok) {
    throw new Error("피드백 시작 실패");
  }

  return (await res.json()) as IFeedback;
}

export async function like({
  interviewId,
  userToken,
}: {
  interviewId: string;
  userToken: string;
}) {
  fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/${interviewId}/feedback/like`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    },
  );
}

export async function dislike({
  interviewId,
  userToken,
}: {
  interviewId: string;
  userToken: string;
}) {
  fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/${interviewId}/feedback/dislike`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    },
  );
}
