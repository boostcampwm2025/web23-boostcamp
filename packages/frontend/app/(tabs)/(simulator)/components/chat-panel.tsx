"use client";

import { MessageSquare, X } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { cn } from "@/app/lib/utils";

import Chat from "./chat";
import { IChatMessage } from "@/app/components/chat-history";
import { Dispatch, SetStateAction } from "react";

interface IChatPanel {
  onClose: () => void;
  className?: string;
  initialChats: IChatMessage[];
  setChats: Dispatch<SetStateAction<IChatMessage[]>>;
  stream: MediaStream | null;
}

export default function ChatPanel({
  onClose,
  className,
  initialChats,
  setChats,
  stream,
}: IChatPanel) {
  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="flex items-center justify-between border-b pb-2">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-4" />
          <h3 className="text-sm font-semibold">채팅 기록</h3>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 cursor-pointer"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        <Chat initalChats={initialChats} setChats={setChats} stream={stream} />
      </CardContent>
    </Card>
  );
}