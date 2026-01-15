"use client";

import { useState } from "react";

import { IChatMessage } from "@/app/components/chat_history";

import VideoGrid from "../components/video_grid";
import ChatPanel from "../../components/chat_panel";
import { InterviewControls } from "../components/interview_controls";

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

export default function Page() {
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="mt-5 flex h-full max-w-630 flex-col justify-center gap-5 py-2 xl:flex-row">
      <div className="relative w-full max-w-7xl xl:flex-2">
        <VideoGrid />
        {/* <InterviewControls /> */}
        {/* FIXME: 이 부분은 의논.. 그 채팅방 껏을 떄도 자막 보이게.. */}
        {/* <div className="absolute bottom-4 left-4">
          <div className="rounded-md bg-black/60 px-3 py-1 text-sm text-white">
            면접관: React의 Virtual DOM 작동 원리에 대해 설명해 주실 수 있나요?
          </div>
        </div> */}

        {/* control message show , mic on off, cam on off */}
        <InterviewControls
          onToggleChat={() => setIsChatOpen((prev) => !prev)}
        />
      </div>
      {isChatOpen && (
        <div className="flex-1">
          <ChatPanel
            message={initialMessages}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}
      {/* {!isChatOpen && (
        <Button
          className="fixed right-6 bottom-6 h-12 w-12 rounded-full shadow-lg"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageSquare className="size-6" />
        </Button>
      )} */}
    </div>
  );
}
