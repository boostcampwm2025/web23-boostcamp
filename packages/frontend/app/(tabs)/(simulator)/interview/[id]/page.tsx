"use server";

import InterviewClient from "./client";

export default async function Page() {
  /* const { history } = await getHistory({ interviewId: "1" }); */

  return (
    <div className="mx-auto mt-8 flex max-w-360">
      <InterviewClient history={[]} />
    </div>
  );
}
