import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

export default function InterviewStartBox({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex cursor-pointer flex-col gap-7 rounded-3xl bg-primary p-8"
    >
      <div className="w-fit rounded-3xl bg-neutral-800 p-4">
        <Plus className="size-8 text-white" />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white">
          새로운 AI 인터뷰 시작하기
        </h2>
        <span className="text-white/80">
          나만을 위한 맞춤형 면접 시뮬레이션.
        </span>
      </div>

      <div className="flex items-center text-white/80">
        <span>
          준비시간을 갖고, 실제 면접과 유사한 환경에서 답변을 연습해보세요.
        </span>
        <ArrowRight className="size-5" />
      </div>
    </Link>
  );
}
