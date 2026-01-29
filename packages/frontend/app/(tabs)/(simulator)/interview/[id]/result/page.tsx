import { Heart, HeartOff } from "lucide-react";

import { redirect } from "next/navigation";
/* import { unstable_cache as nextCache } from "next/cache";
 */
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
import { getUserSession } from "@/app/lib/server/session";
import { timeAgo } from "@/app/lib/utils";

export default async function InterviewResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await getUserSession();

  if (!user) {
    return redirect("/");
  }

  const { id: interviewId } = await params;
  const { history } = await getHistory({
    interviewId,
    userToken: user.token,
  });

  let feedbackResult = { score: "0", feedback: "" };
  feedbackResult = await getFeedback({
    interviewId,
    userToken: user.token,
  });

  if (!feedbackResult.score || !feedbackResult.feedback) {
    feedbackResult = await startFeedback({
      interviewId,
      userToken: user.token,
    });
  }

  const lastCreatedAt = new Date(
    history[history.length - 1].question.createdAt,
  );

  if (!history) {
    throw new Error(`인터뷰 ID:${interviewId}의 기록이 없습니다.`);
  }

  return (
    <div className="mt-5 w-full pb-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h3>인터뷰 결과</h3>
            <span className="text-sm text-black/60">
              인터뷰 결과에 대한 피드백입니다.
            </span>
          </div>
          <div>
            <h6 className="text-sm">{timeAgo(lastCreatedAt)}</h6>
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
          <Panel className="flex flex-1 flex-col overflow-y-scroll p-5">
            <ChatHistory
              chatMessages={buildChatHistory(history)}
              className="max-h-120"
            />
          </Panel>
          <Panel className="flex-1 p-5">
            <AISummary summary={feedbackResult.feedback} />
          </Panel>
        </div>
        <div className="flex">
          <Panel className="flex-1 flex-row justify-start bg-primary/5 p-5">
            <Tip />
          </Panel>
        </div>
        {/*  <div className="mt-12 flex w-full items-center justify-between">
          <span className="text-sm text-black/60">도움이 되었을까요?</span>
          <div className="flex gap-2">
            <Button className="cursor-pointer">
              <Heart className="text-white" />
            </Button>
            <Button className="cursor-pointer">
              <HeartOff className="text-white" />
            </Button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
