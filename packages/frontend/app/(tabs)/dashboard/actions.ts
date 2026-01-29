"use server";

import { getUserSession } from "@/app/lib/server/session";
import { redirect } from "next/navigation";

export interface IInterview {
  interviewId: string;
  title: string;
  type: string;
  createdAt: string;
}

export async function getInterviews() {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
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
