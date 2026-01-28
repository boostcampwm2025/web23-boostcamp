import { redirect } from "next/navigation";

import Header from "./components/header";
import { getUserSession } from "./lib/server/session";
import StatusBadge from "./components/ui/status-badge";
import { Button } from "./components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const userSession = await getUserSession();

  if (userSession.user) {
    redirect("/dashboard");
  }

  return (
    <div className="h-full">
      <Header />
      <div className="flex size-full flex-col items-center justify-center gap-6 px-12 py-36">
        <StatusBadge text="새로운 AI 인터뷰 엔진" />
        <h1 className="text-center text-5xl font-bold text-pretty">
          Recode your
          <br /> Interview.
        </h1>
        <p className="text-center text-lg text-pretty text-muted-foreground">
          단순한 연습을 넘어, AI 실시간 분석 엔진과 라이브 코딩 동기화 기술로
          <br />
          당신의 기술적 역량을 정밀하게 측정하고 개선하세요.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button>
            시뮬레이션 시작하기 <ArrowRight />
          </Button>
          <Button variant="outline">Watch_demo</Button>
        </div>
      </div>
    </div>
  );
}
