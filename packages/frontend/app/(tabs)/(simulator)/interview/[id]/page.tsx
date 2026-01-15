"use server";
import { IChatMessage } from "@/app/components/chat-history";
import { generateQuestion, getHistory } from "./actions";
import InterviewClient from "./client";
import { timeStamp } from "console";

export default async function Page() {
  // const newInterview = await createInterview();
  /* const question = await generateQuestion({
    interviewId: "1",
  }); */

  const { history } = await getHistory({ interviewId: "1" });

  return (
    <div>
      <InterviewClient initialChats={history} />
    </div>
  );
}
