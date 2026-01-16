"use server";

import { getHistory } from "./actions";
import InterviewClient from "./client";

export default async function Page() {
  const { history } = await getHistory({ interviewId: "1" });

  return (
    <div>
      <InterviewClient history={history} />
    </div>
  );
}
