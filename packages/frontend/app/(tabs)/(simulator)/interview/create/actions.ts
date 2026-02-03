"use server";

import { getUserSession } from "@/app/lib/server/session";
import { redirect } from "next/navigation";

export interface ICreateInterviewResponse {
  interviewId: string;
}

export async function createTechInterview({
  documentIds,
  simulationTitle,
}: {
  documentIds: string[];
  simulationTitle: string;
}) {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/interview/tech/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ documentIds, simulationTitle }),
    },
  );

  if (!res.ok) {
    throw new Error("Interview 생성 실패");
  }
  return (await res.json()) as ICreateInterviewResponse;
}
