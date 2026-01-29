"use server";

import { redirect } from "next/navigation";
import { getHistory } from "./actions";
import InterviewClient from "./client";
import { getUserSession } from "@/app/lib/server/session";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: interviewId } = await params;

  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }

  const { history } = await getHistory({ interviewId, userToken: user.token });
  // sthrow new Error("인터뷰 목록을 가져오는데 실패하였습니다: 테스트 에러");

  return (
    <div className="mx-auto mt-8 flex max-w-360">
      <InterviewClient history={history} interviewId={interviewId} />
    </div>
  );
}
