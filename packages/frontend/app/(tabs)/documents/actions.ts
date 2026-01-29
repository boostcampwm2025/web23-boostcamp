"use server";

import { getUserSession } from "@/app/lib/server/session";
import { redirect } from "next/navigation";
import { z } from "zod";

const coverLetterSchema = z.object({
  title: z.string().min(1).max(100),
  qa: z
    .array(
      z.object({
        question: z.string().min(1).max(500),
        answer: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

export async function createCoverLetter(params: {
  title: string;
  qa: { question: string; answer: string }[];
}) {
  const parseResult = coverLetterSchema.safeParse({
    title: params.title,
    qa: params.qa,
  });

  if (!parseResult.success) {
    return {
      error: "INVALID_PARAMETERS",
    };
  }

  const { user } = await getUserSession();
  if (!user) {
    return redirect("/");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document/cover-letter/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({
        title: parseResult.data.title,
        content: parseResult.data.qa,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("자기소개서 생성에 실패했습니다");
  }

  const responseData = await response.json();

  return {
    documentId: responseData.documentId,
    type: responseData.type,
    title: responseData.title,
    createdAt: responseData.createdAt,
    modifiedAt: responseData.createdAt,
  };
}
