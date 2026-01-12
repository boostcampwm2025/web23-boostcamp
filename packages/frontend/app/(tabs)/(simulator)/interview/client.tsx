"use client";
import { useState } from "react";

export default function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="fixed bottom-0 left-0 w-full border-t bg-white p-4">
      <div className="mx-auto max-w-2xl flex gap-2">
        <input
          className="flex-1 border rounded-md p-2 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={submit} className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">
          전송
        </button>
      </div>
    </div>
  );
}