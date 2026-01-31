"use server";

import { getUserSession } from "@/app/lib/server/session";
import { isApiMockEnabled } from "@/app/lib/server/env";
import { redirect } from "next/navigation";

export interface IInterview {
  interviewId: string;
  title: string;
  type: string;
  createdAt: string;
  score: string;
}

export async function getInterviews() {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }

  if (isApiMockEnabled()) {
    return {
      interviews: [
        {
          interviewId: "mock-1",
          title: "모의 인터뷰 #1",
          type: "tech",
          createdAt: new Date().toISOString(),
          score: "50",
        },
      ],
    } as { interviews: IInterview[] };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview?page=1&take=6`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch interviews");
  }

  const json = (await res.json()) as { interviews: IInterview[] };

  return json;
}
