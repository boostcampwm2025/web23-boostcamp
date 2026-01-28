"use server";

interface IFeedback {
  score: string;
  feedback: string;
}

export async function getFeedback({ interviewId }: { interviewId: string }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/${interviewId}/feedback`,
  );

  if (!res.ok) throw new Error("피드백 조회 실패");

  return (await res.json()) as IFeedback;
}

export async function startFeedback({ interviewId }: { interviewId?: string }) {
  /* if (process.env.NODE_ENV === "development" && false) {
    await new Promise((r) => setTimeout(r, 200));
    return {
      score: "84",
      feedback:
        "[DEV] The candidate gave concise answers with clear impact. Focus on adding more metrics and structure (STAR).",
    };
  } */
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/feedback`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewId }),
    },
  );

  if (!res.ok) throw new Error("피드백 시작 실패");
  return (await res.json()) as IFeedback;
}
