import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

import IconBox from "@/app/components/ui/icon-box";
import { getUserSession } from "@/app/lib/server/session";
import { Button } from "@/app/components/ui/button";

import VideoStatus from "@/app/(tabs)/(simulator)/interview/[id]/components/video-status";

export default async function InterviewReadyPage() {
  const { user } = await getUserSession();

  if (!user) {
    return notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-360 flex-col gap-8 px-5 lg:flex-row">
      {/* <InterviewClient history={history} /> */}
      <div className="flex-1">
        <VideoStatus />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex w-fit items-center gap-2 rounded-sm bg-primary/20 px-2 py-1">
          <Sparkles className="size-3 text-primary" />
          <h5 className="text-xs font-semibold text-primary"> 준비 완료</h5>
        </div>
        <div className="mt-4 flex min-w-0 flex-col gap-1 text-4xl font-bold text-pretty">
          <span className="min-w-0 wrap-break-word">{user.email} 님,</span>
          <span>준비되셨나요?</span>
        </div>
        <span className="mt-4 block text-base font-semibold text-muted-foreground">
          선택하신 정보를 바탕으로 직무 시뮬레이션이 준비되었습니다. 실제 면접과
          유사한 답변을 연습해보세요.
        </span>

        <div className="mt-8 flex gap-3 rounded-lg border px-4 py-6 shadow-sm">
          <IconBox>
            <ShieldCheck className="size-5 text-primary" />
          </IconBox>
          <div>
            <h3 className="text-sm font-semibold">개인정보 및 보안 안내</h3>
            <span className="text-xs text-muted-foreground">
              세션 중 찰영되는 영상과 음성은 분석을 위해서만 사용되며, 종료 후
              안전하게 삭제됩니다.
            </span>
          </div>
        </div>
        <Link href={`./`}>
          <Button className="mt-4 w-full cursor-pointer py-7 font-semibold">
            <p>면접 시작하기 </p>
            <ArrowRight />
          </Button>
        </Link>
      </div>
    </div>
  );
}
