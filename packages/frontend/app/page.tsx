import { redirect } from "next/navigation";

import Header from "./components/header";
import { getUserSession } from "./lib/server/session";
import StatusBadge from "./components/ui/status-badge";
import GoogleLoginButton from "./(auth)/components/google-login-button";

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
          Record your
          <br /> Interview.
        </h1>
        <p className="text-center text-lg text-pretty text-muted-foreground">
          단순한 연습을 넘어, AI 실시간 분석과 맞춤형 질문으로
          <br />
          당신의 기술 면접 역량을 정확히 진단하고 빠르게 개선하세요.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <GoogleLoginButton />
          {/*           <Button variant="outline">Watch_demo</Button>
           */}{" "}
        </div>
      </div>
    </div>
  );
}
