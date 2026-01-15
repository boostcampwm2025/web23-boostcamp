import { cn } from "@/app/lib/utils";

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
}

export default function ChatHistory({ chatMessages, className }: IChatHistory) {
  // 데이터가 없을 때 방어 로직
  if (!chatMessages || chatMessages.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-10 text-gray-400 text-xs", className)}>
        채팅 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className={className}>
      {chatMessages.map((message) => {
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
      })}
    </div>
  );
}