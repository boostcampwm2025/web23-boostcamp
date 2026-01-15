"use client";

import { useState } from "react";
import { ArrowUp, AudioLines, Mic, StopCircle } from "lucide-react";
import clsx from "clsx";

import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";

interface IChatInputProps {
  onSend: (text: string) => void;
  onHandleVoiceToggle: () => void;
  placeholder?: string;
  isRecording: boolean;
}

export default function ChatInput({
  placeholder,
  onSend,
  onHandleVoiceToggle,
  isRecording,
}: IChatInputProps) {
  const [text, setText] = useState("");

  const onSubmit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="mx-auto w-full">
      <div className="flex items-end gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm">
        <Textarea
          value={text}
          placeholder={placeholder}
          className="resize-none border-0 p-2 text-sm shadow-none focus-visible:ring-0"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />

        <Button
          size="icon"
          onClick={onHandleVoiceToggle}
          className={clsx(
            "h-8 w-8 rounded-full",
            isRecording ? "bg-red-500/20" : "",
          )}
          title={isRecording ? "녹음 중지" : "녹음 시작"}
        >
          {isRecording ? <StopCircle size={16} /> : <Mic size={16} />}
        </Button>

        <Button
          size="icon"
          onClick={onSubmit}
          disabled={!text.trim()}
          className="h-8 w-8 rounded-full"
        >
          {text.trim() ? <ArrowUp size={16} /> : <AudioLines size={16} />}
        </Button>
      </div>
    </div>
  );
}
