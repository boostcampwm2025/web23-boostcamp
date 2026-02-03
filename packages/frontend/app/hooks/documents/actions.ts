"use server";

import { getUserSession } from "@/app/lib/server/session";
import { redirect } from "next/navigation";

// API 응답 타입 정의
interface IApiDocumentItem {
  documentId: string;
  type: "COVER" | "PORTFOLIO";
  title: string;
  createdAt: string;
}

interface IDocumentResponse {
  documents: IApiDocumentItem[];
}

export async function getDocuments() {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/document?page=1&take=10`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
    },
  );

  if (!res.ok) throw new Error("서류 목록 조회 실패");

  return (await res.json()) as IDocumentResponse;
}
