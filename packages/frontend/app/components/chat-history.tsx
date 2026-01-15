import { cn } from "@/app/lib/utils";

export interface IChatMessage {
  id: string;
  sender: string;
  role: "user" | "ai" | "feedback"; // feedback은 현재 db에 없는 상태.
  content: string;
  timestamp: Date;
}

interface IChatHistory {
  chatMessages: IChatMessage[];
  className?: string;
}

export default function ChatHistory({ chatMessages, className }: IChatHistory) {
  return (
    <div className={className}>
      {chatMessages.map((message) => (
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
            {new Date(message.timestamp).toLocaleString("ko-KR")}
          </h6>
        </div>
      ))}
    </div>
  );
}
