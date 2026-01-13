"use client";

import ChatHistory, { IChatMessage } from "@/app/components/chat_history";
import ChatInput from "@/app/(tabs)/(simulator)/components/chat_input";

export default function Chat({
  chatMessages,
}: {
  chatMessages: IChatMessage[];
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <ChatHistory chatMessages={chatMessages} />
      </div>
      <ChatInput placeholder="??" onSend={() => {}} />
    </div>
  );
}
