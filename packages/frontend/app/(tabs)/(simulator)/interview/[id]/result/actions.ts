"use server";

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

/* TODO: 백엔드 API 구현 후 활성화
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
*/

export async function deleteInterview({
  interviewId,
  userToken,
}: {
  interviewId: string;
  userToken: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/${interviewId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error("면접 삭제 실패");
  }
}
