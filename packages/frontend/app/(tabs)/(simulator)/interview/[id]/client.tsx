"use client";

import type { IHistoryItem } from "./actions";
import { InterviewView } from "./interview-view";
import { useInterviewController } from "./use-interview-controller";

export default function InterviewClient({
  history,
  interviewId,
}: {
  history: IHistoryItem[];
  interviewId: string;
}) {
  const controller = useInterviewController({ history, interviewId });
  return <InterviewView controller={controller} />;
}
