"use server";

interface IFeedback {
  score: string | number;
  content: string;
}

export async function getFeedback({
  interviewId,
}: {
  interviewId: string;
}): Promise<IFeedback> {
  if (process.env.NODE_ENV === "development") {
    return {
      score: 84,
      content:
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
