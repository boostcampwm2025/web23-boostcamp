import { Bot, Heart, HeartOff } from "lucide-react";

import ChatHistory from "@/app/components/chat-history";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Button } from "@/app/components/ui/button";
import { buildChatHistory } from "@/app/lib/client/chat";

import RecentRecording from "./components/recent-recording";
import Panel from "./components/panel";
import Tip from "./components/tip";
import { getHistory } from "../../(simulator)/interview/[id]/actions";


export default async function InterviewResultPage() {
  const { history } = await getHistory({ interviewId: "1" });

  return (
    <div className="mt-5 w-full pb-5">
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
          <Panel className="flex flex-2 flex-col overflow-y-scroll p-5">
            <ChatHistory
              chatMessages={buildChatHistory(history)}
              className="max-h-120"
            />
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
        <div className="mt-12 flex w-full items-center justify-between">
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
