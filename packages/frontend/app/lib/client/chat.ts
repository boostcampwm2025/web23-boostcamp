import { IHistoryItem } from "@/app/(tabs)/(simulator)/interview/[id]/actions";
import { IChatMessage } from "@/app/components/chat-history";

export function buildChatHistory(history: IHistoryItem[]) {
  return history.flatMap((item) => {
    const result: IChatMessage[] = [];

    if (item.question) {
      result.push({
        id: item.question.createdAt,
        sender: "Interviewer",
        role: "ai",
        content: item.question.content,
        // Server Component -> Client Component 경계를 넘어갈 수 있도록 문자열로 유지
        timestamp: item.question.createdAt,
      });
    }

    if (item.answer) {
      result.push({
        id: item.answer.createdAt,
        sender: "You",
        role: "user",
        content: item.answer.content,
        // Server Component -> Client Component 경계를 넘어갈 수 있도록 문자열로 유지
        timestamp: item.answer.createdAt,
      });
    }

    return result;
  });
}
