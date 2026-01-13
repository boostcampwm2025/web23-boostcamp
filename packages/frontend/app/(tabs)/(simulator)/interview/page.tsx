"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";

import Chat from "@/app/(tabs)/(simulator)/components/chat";
import VideoTile from "@/app/(tabs)/(simulator)/interview/components/video_tile";

import { IChatMessage } from "@/app/components/chat_history";
import { Button } from "@/app/components/ui/button";

import { cn } from "@/app/lib/utils";

const initialMessages: IChatMessage[] = [
  {
    id: "msg-001",
    sender: "AI Interviewer",
    role: "ai",
    content:
      "안녕하세요. React의 Virtual DOM 작동 원리에 대해 설명해 주실 수 있나요?",
    timestamp: new Date("2026-01-12T10:00:00"),
  },
  {
    id: "msg-002",
    sender: "Me (Candidate)",
    role: "user",
    content:
      "Virtual DOM은 실제 DOM의 가벼운 사본입니다. 상태가 변경되면 새로운 Virtual DOM을 생성하고, 이전 버전과 비교(Diffing)하여 변경된 부분만 실제 DOM에 반영합니다.",
    timestamp: new Date("2026-01-12T10:01:00"),
  },
  {
    id: "msg-003",
    sender: "AI Interviewer",
    role: "ai",
    content:
      "네, 정확합니다. 그렇다면 Diffing 알고리즘의 시간 복잡도를 줄이기 위해 리액트는 어떤 휴리스틱을 사용하나요?",
    timestamp: new Date("2026-01-12T10:01:30"),
  },
  {
    id: "msg-004",
    sender: "Me (Candidate)",
    role: "user",
    content:
      "리액트는 O(n^3)의 복잡도를 O(n)으로 줄이기 위해 두 가지 가정을 사용함. 첫째는 서로 다른 타입의 두 엘리먼트는 서로 다른 트리를 생성한다는 것이고, 둘째는 key 프로퍼티를 통해 자식 엘리먼트의 변경을 효율적으로 알아낸다는 점임.",
    timestamp: new Date("2026-01-12T10:02:15"),
  },
];

// FIXME: 여기는 디테일이 아직 필요.. 아이디어 많..
export default function Page() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="mx-auto grid grid-cols-1 gap-4 md:max-w-2xl lg:max-w-7xl lg:grid-cols-12 2xl:max-w-428">
      <div
        className={cn(
          "grid max-w-2xl auto-rows-auto grid-cols-3 gap-1.5 lg:max-w-7xl",
          isChatOpen ? "lg:col-span-9" : "lg:col-span-12",
        )}
      >
        <VideoTile />
        <VideoTile />
        <VideoTile />
        <div className="col-span-3">
          <VideoTile isSpeaker />
        </div>
      </div>
      {isChatOpen && (
        <div className="flex max-w-2xl flex-col rounded-2xl border bg-white p-3 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4" />
              <h3 className="text-sm font-semibold"> 채팅 기록</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsChatOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="min-h-0 flex-1">
            <Chat chatMessages={initialMessages} />
          </div>
        </div>
      )}
      {!isChatOpen && (
        <Button
          className="fixed right-6 bottom-6 h-12 w-12 rounded-full shadow-lg"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageSquare className="size-6" />
        </Button>
      )}
    </div>
  );
}
