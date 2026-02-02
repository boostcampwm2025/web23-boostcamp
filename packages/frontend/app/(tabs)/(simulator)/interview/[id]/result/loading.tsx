import { Cpu, Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="animate-pulse rounded-3xl bg-primary p-5 shadow-2xl">
        <Sparkles className="size-10 text-white" />
      </div>

      <div className="mt-6 flex flex-col items-center">
        <h1 className="text-lg font-bold">AI 심층 분석 진행 중</h1>
        <span className="mt-1 text-sm text-muted-foreground">
          인터뷰 내용을 바탕으로 리포트를 구성하고 있습니다.
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-md bg-neutral-100/30 px-5 py-2 shadow-md">
        <Cpu className="size-4.5 text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">
          사용자의 응답 분석 중...
        </p>
      </div>
    </div>
  );
}
