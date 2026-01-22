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
        timestamp: new Date(item.question.createdAt),
      });
    }

    if (item.answer) {
      result.push({
        id: item.answer.createdAt,
        sender: "You",
        role: "user",
        content: item.answer.content,
        timestamp: new Date(item.answer.createdAt),
      });
    }

    return result;
  });
}
