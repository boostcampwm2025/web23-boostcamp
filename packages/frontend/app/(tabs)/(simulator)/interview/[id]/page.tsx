"use server";

import { getHistory } from "./actions";
import InterviewClient from "./client";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: interviewId } = await params;

  const { history } = await getHistory({ interviewId });
  // sthrow new Error("인터뷰 목록을 가져오는데 실패하였습니다: 테스트 에러");

  return (
    <div className="mx-auto mt-8 flex max-w-360">
      <InterviewClient history={history} interviewId={interviewId} />
    </div>
  );
}
