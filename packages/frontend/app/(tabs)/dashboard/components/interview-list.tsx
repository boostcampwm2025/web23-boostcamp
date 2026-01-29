import { ChevronRight, ClipboardList, Clock, Sparkle } from "lucide-react";
import { IInterview } from "../actions";
import IconBox from "@/app/components/ui/icon-box";
import Link from "next/link";

export default function InterviewList({
  interviews,
}: {
  interviews: IInterview[];
}) {
  return (
    <>
      <div className="flex justify-between">
        <div className="flex items-center gap-1 md:gap-2">
          <Clock className="size-5 text-muted-foreground md:size-5.5" />
          <p className="text-base font-semibold md:text-xl">최근 인터뷰 기록</p>
        </div>
        <div>
          <p className="cursor-pointer text-sm font-semibold text-muted-foreground md:text-base">
            더보기
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-5">
        {interviews.map((interview) => (
          <Link
            href={`/interview/${interview.interviewId}/result`}
            className="group flex cursor-pointer flex-row items-center justify-center rounded-3xl border px-7 py-6 shadow-md"
            key={interview.createdAt}
          >
            <IconBox>
              <ClipboardList className="size-6 text-primary" />
            </IconBox>
            <div className="flex w-full items-center justify-between">
              <div className="ml-4 flex flex-col gap-1">
                <h3 className="text-sm font-bold md:text-lg">
                  {interview.title}
                </h3>
                <span className="text-xs text-muted-foreground md:font-semibold">
                  {interview.type} ·{" "}
                  {new Date(interview.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-end">
                  <div className="flex gap-1">
                    <Sparkle className="size-3 text-yellow-400" />
                    <span className="text-xs font-bold text-primary uppercase md:text-sm">
                      score
                    </span>
                  </div>
                  <p className="text-sm font-bold md:text-base">82</p>
                </div>

                <IconBox className="hidden opacity-0 transition-opacity group-hover:flex group-hover:opacity-100">
                  <ChevronRight className="size-6 text-primary" />
                </IconBox>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
