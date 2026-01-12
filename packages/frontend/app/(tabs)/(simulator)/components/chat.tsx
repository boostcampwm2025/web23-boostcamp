"use client";

import ChatHistory, { IChatMessage } from "@/app/components/chat_history";
import ChatInput from "@/app/(tabs)/(simulator)/components/chat_input";

export default function Chat({
  chatMessages,
}: {
  chatMessages: IChatMessage[];
}) {
  return (
    <div>
      <div className="px-6">
        <ChatHistory chatMessages={chatMessages} />
        <ChatInput onSend={()=>{}} />
      </div>
    </div>
  );
}
