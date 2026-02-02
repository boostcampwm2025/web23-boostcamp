import { cn } from "@/app/lib/utils";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "./ui/conversation";
import { Monitor, X } from "lucide-react";
import { Message, MessageContent } from "./ui/message";

export interface IChatMessage {
  id: string;
  sender: string;
  role: "user" | "ai" | "feedback";
  content: string;
  timestamp: Date | string; // 문자열로 들어올 경우를 대비
}

interface IChatHistory {
  chatMessages: IChatMessage[];
  className?: string;
  emptyMessage?: string;
  emptyDescription?: string;
}

export default function ChatHistory({
  chatMessages,

  className,
  emptyMessage,
  emptyDescription,
}: IChatHistory) {
  return (
    <div>
      <Conversation className={className}>
        {/*     {chatMessages.map((message) => {
        // 날짜 객체 안전하게 생성
        const date = new Date(message.timestamp);
        const isValidDate = !isNaN(date.getTime());

        return (
          <div
            key={message.id}
            className={cn(
              "mb-4 flex w-full flex-col gap-1.5",
              message.role === "ai" ? "items-start" : "items-end",
            )}
          >
            <h5 className="text-xs font-semibold">{message.sender}</h5>
            <span
              className={cn(
                "w-fit max-w-3/4 rounded-2xl border bg-white p-2 text-xs text-pretty",
                message.role === "ai"
                  ? "rounded-bl-none"
                  : "rounded-br-none border-primary bg-primary/10",
              )}
            >
              {message.content}
            </span>
            <h6 className="text-xs text-black/60">
              {isValidDate ? date.toLocaleString("ko-KR") : "시간 정보 없음"}
            </h6>
          </div>
        );
      })} */}
        <ConversationContent>
          {chatMessages.length === 0 ? (
            <ConversationEmptyState
              title={emptyMessage || "대화 내역이 없습니다"}
              description={
                emptyDescription || "아직 대화가 시작되지 않았습니다."
              }
            />
          ) : (
            <>
              {chatMessages.map((message) => (
                <Message
                  from={message.role === "user" ? "user" : "assistant"}
                  key={message.id}
                >
                  <MessageContent>{message.content}</MessageContent>
                </Message>
              ))}
            </>
          )}
        </ConversationContent>
      </Conversation>
    </div>
  );
}
