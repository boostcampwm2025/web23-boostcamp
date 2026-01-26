"use server";

interface IInterview {
  interviewId: string;
  title: string;
  type: string;
  createdAt: string;
}

export async function getInterviews() {
  const json = (await (
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interview?page=1&take=6`, {
      method: "GET",
      cache: "no-store",
    })
  ).json()) as { interviews: IInterview[]; totalPages: number };
  return json;
}
