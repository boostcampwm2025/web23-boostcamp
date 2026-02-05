"use server";

import { redirect } from "next/navigation";
import { getHistory } from "../actions";
import InterviewClient from "../client";
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

  return (
    <div className="mx-auto flex size-full">
      <InterviewClient history={history} interviewId={interviewId} />
    </div>
  );
}
