"use client";

import { useState } from "react";

import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowUp, AudioLines } from "lucide-react";

interface IChatInputProps {
  placeholder?: string;
  onSend: (text: string) => void;
}

export default function ChatInput({ placeholder, onSend }: IChatInputProps) {
  const [text, setText] = useState("");

  const submit = () => {
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
              submit();
            }
          }}
        />

        <Button
          size="icon"
          onClick={submit}
          disabled={!text.trim()}
          className="h-8 w-8 rounded-full"
        >
          {text.trim() ? <ArrowUp size={16} /> : <AudioLines size={16} />}
        </Button>
      </div>
    </div>
  );
}
