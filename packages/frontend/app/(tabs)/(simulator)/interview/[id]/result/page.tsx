import { Heart, HeartOff } from "lucide-react";
import { unstable_cache as nextCache } from "next/cache";

import ChatHistory from "@/app/components/chat-history";
import { Button } from "@/app/components/ui/button";
import { buildChatHistory } from "@/app/lib/client/chat";

import { getFeedback, startFeedback } from "./actions";
import { getHistory } from "../actions";
import RecentRecording from "./components/recent-recording";
import Panel from "./components/panel";
import Score from "./components/score";
import AISummary from "./components/ai-summary";
import Tip from "./components/tip";

const getCachedHistory = nextCache(getHistory);
const getCachedFeedback = nextCache(getFeedback);

export default async function InterviewResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: interviewId } = await params;
  const { history } = await getCachedHistory({ interviewId });

  let feedbackResult = { score: "0", feedback: "" };
  feedbackResult = await getCachedFeedback({ interviewId });

  if (!feedbackResult.score || !feedbackResult.feedback) {
    feedbackResult = await startFeedback({ interviewId });
  }

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
          <Panel className="flex-1 p-5">
            <Score score={+feedbackResult.score} />
          </Panel>
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
          <Panel className="flex-1 p-5">
            <AISummary summary={feedbackResult.feedback} />
          </Panel>
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
