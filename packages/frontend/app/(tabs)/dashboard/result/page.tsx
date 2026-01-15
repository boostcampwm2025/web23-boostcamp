import ChatHistory, { IChatMessage } from "@/app/components/chat_history";

import Panel from "./components/panel";
import Score from "./components/score";
import RecentRecording from "./components/recent_recording";
import { Bot, Heart, HeartOff } from "lucide-react";
import Tip from "./components/tip";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";

const initialMessages = [
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
] as IChatMessage[];

export default function InterviewResultPage() {
  return (
    <div className="mt-9 w-full">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h3>Interview Results</h3>
            <span className="text-sm text-black/60">
              Summary of your recent interview performance
            </span>
          </div>
          <div>
            <h6 className="text-sm">6일전</h6>
          </div>
        </div>
        <div className="flex flex-col gap-6 md:flex-row">
          <Skeleton className="flex flex-1 items-center justify-center gap-4 rounded-2xl border p-5 shadow">
            <Bot />
          </Skeleton>

          {/* <Panel className="flex-1 p-5">
            <Score />
          </Panel> */}
          <Panel className="flex-2 p-5">
            <RecentRecording />
          </Panel>
        </div>
        <div className="flex flex-col gap-6 md:flex-row">
          <Panel className="flex-2 p-5">
            <ChatHistory chatMessages={initialMessages} />
          </Panel>
          <Skeleton className="flex flex-1 items-center justify-center gap-4 rounded-2xl border p-5 shadow">
            <Bot />
          </Skeleton>
          {/* <Panel className="flex-1 p-5">
            <AISummary />
          </Panel> */}
        </div>
        <div className="flex flex-col gap-6 md:flex-row">
          <Panel className="flex-1 bg-primary/5 p-5">
            <Tip />
          </Panel>
        </div>
        <div className="mt-12 flex w-full justify-between">
          <span className="text-sm text-black/60">
            Did you find this feedback helpful?
          </span>
          <div className="flex gap-2">
            <Button className="cursor-pointer">
              <Heart className="text-white" />
            </Button>
            <Button className="cursor-pointer">
              <HeartOff className="text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
