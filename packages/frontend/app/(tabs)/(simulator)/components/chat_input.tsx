"use client";

import { useState } from "react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

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
    <div className="fixed bottom-0 left-0 w-full border-t bg-white p-4 shadow-sm">
      <div className="mx-auto flex max-w-2xl gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="메시지를 입력하세요..."
          className="flex-1"
        />
        <Button onClick={submit} disabled={!text.trim()}>
          전송
        </Button>
      </div>
    </div>
  );
}
