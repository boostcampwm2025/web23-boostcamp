"use server";

interface IFeedback {
  score: string;
  feedback: string;
}

export async function getFeedback({
  interviewId,
}: {
  interviewId: string;
}): Promise<IFeedback> {
  if (process.env.NODE_ENV === "development") {
    return {
      score: "84",
      feedback:
        "[DEV] The candidate gave concise answers with clear impact. Focus on adding more metrics and structure (STAR).",
    };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/${interviewId}/feedback`,
    { headers: { "Content-Type": "application/json" }, cache: "no-store" },
  );
  if (!res.ok) throw new Error("피드백 조회 실패");

  return (await res.json()) as IFeedback;
}

// 현재 사용하고 있지 않아 lint 에러가 나긴 하나, 나중에 추가될 것 같아서 놔둡니다.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function startFeedback({ interviewId }: { interviewId?: string }) {
  if (process.env.NODE_ENV === "development") {
    await new Promise((r) => setTimeout(r, 200));
    return {
      score: "84",
      feedback:
        "[DEV] The candidate gave concise answers with clear impact. Focus on adding more metrics and structure (STAR).",
    };
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("피드백 시작 실패");
  return (await res.json()) as IFeedback;
}
