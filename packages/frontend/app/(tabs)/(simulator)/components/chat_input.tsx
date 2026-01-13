"use client";

import { useState } from "react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ArrowRight } from "lucide-react";

export default function ChatInput({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) {
      return;
    }
    onSend(text);
    setText("");
  };

  return (
    <div className="fixed bottom-0 left-0 w-full">
      <div className="relative">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="메시지를 입력하세요... "
          className=""
        />
        <Button
          onClick={submit}
          disabled={!text.trim()}
          className="absolute right-4 bottom-0 rounded-full"
        >
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
