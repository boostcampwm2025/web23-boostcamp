"use server";

import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { getHistory } from "./actions";
import VideoStatus from "./components/video-status";

export default async function Page() {
  const { history } = await getHistory({ interviewId: "1" });

  return (
    <div className="flex max-w-360 gap-8">
      {/* <InterviewClient history={history} /> */}
      <div className="flex-1">
        <VideoStatus />
      </div>
      <div className="flex-1">
        <div className="flex w-fit items-center gap-2 rounded-sm bg-primary/20 px-2 py-1">
          <Sparkles className="size-3 text-primary" />
          <h5 className="text-xs font-semibold text-primary"> 준비 완료</h5>
        </div>
        <div className="mt-4 flex flex-col gap-1 text-4xl font-bold text-pretty">
          <h3>준호 님,</h3>
          <h3>준비되셨나요?</h3>
        </div>
        <span className="mt-4 block text-base font-semibold text-muted-foreground">
          선택하신 정보를 바탕으로 직무 시뮬레이션이 준비되었습니다. 실제 면접과
          유사한 답변을 연습해보세요.
        </span>

        <div className="mt-8 flex gap-3 rounded-lg border px-4 py-6 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">개인정보 및 보안 안내</h3>
            <span className="text-xs text-muted-foreground">
              세션 중 찰영되는 영상과 음성은 분석을 위해서만 사용되며, 종료 후
              안전하게 삭제됩니다.
            </span>
          </div>
        </div>
        <Button className="mt-4 w-full py-7 font-semibold">
          <p>면접 시작하기 </p>
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
