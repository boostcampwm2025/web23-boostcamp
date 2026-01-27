"use server";

export interface IInterview {
  interviewId: string;
  title: string;
  type: string;
  createdAt: string;
}

export async function getInterviews() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview?page=1&take=6`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch interviews");
  }

  const json = (await res.json()) as { interviews: IInterview[] };

  return json;
}
