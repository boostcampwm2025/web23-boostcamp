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
  console.log(history);
  const filteredHistory = history.filter((item) => item.answer !== null);
  const initialChats = filteredHistory
    .map((item) => ({
      id: crypto.randomUUID(),
      sender: "ai",
      role: "ai",
      content: item.question.content,
      timestamp: new Date(item.question.createdAt),
    }))
    .concat(
      filteredHistory.map((item) => ({
        id: crypto.randomUUID(),
        sender: "user",
        role: "user",
        content: item.answer ? item.answer.content || "" : "",
        timestamp: new Date(item.answer ? item.answer.createdAt || "" : ""),
      })),
    ) as IChatMessage[];
  initialChats.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  return (
    <div>
      <InterviewClient initialChats={initialChats} />
    </div>
  );
}
