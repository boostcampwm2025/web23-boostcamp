"use client";

import { Mic, Send } from "lucide-react";

import ActionButton from "./action-button";

interface IChatInputProps {
  setTextInput: (text: string) => void;
  setInputMode: (mode: "text" | "voice") => void;
  textInput: string;
  onSend: () => void;
}

export default function ChatInput({
  setTextInput,
  setInputMode,
  textInput,
  onSend,
}: IChatInputProps) {
  return (
    <div className="flex gap-1 rounded-full bg-white px-6 py-4 shadow-lg">
      <input
        className="w-full bg-transparent font-semibold outline-none"
        placeholder="답변을 입력하거나 마이크 아이콘을 누르세요"
        onChange={(e) => setTextInput(e.target.value)}
        value={textInput}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSend();
          }
        }}
      />

      {textInput.length > 0 ? (
        <ActionButton
          key="send"
          icon={<Send className="size-5" />}
          onClick={onSend}
        />
      ) : (
        <ActionButton
          key="mic"
          icon={<Mic className="size-5" />}
          onClick={() => setInputMode("voice")}
        />
      )}
    </div>
  );
}
