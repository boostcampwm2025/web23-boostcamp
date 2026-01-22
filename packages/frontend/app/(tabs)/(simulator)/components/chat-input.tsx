"use client";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Mic, Send } from "lucide-react";

interface IChatInputProps {
  onSend: (text: string) => void;
  onHandleVoiceToggle: () => void;
  isRecording: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onHandleVoiceToggle,
  isRecording,
  disabled, // props 받기
}: IChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        onClick={onHandleVoiceToggle}
        disabled={disabled}
      >
        <Mic className={isRecording ? "animate-pulse" : ""} />
      </Button>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="메시지를 입력하세요..."
        disabled={disabled || isRecording}
      />
      <Button onClick={handleSend} disabled={disabled || !text.trim()}>
        <Send />
      </Button>
    </div>
  );
}