"use server";

import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { getHistory } from "./actions";
import VideoStatus from "./components/video-status";
import Link from "next/link";
import InterviewClient from "./client";

export default async function Page() {
  /* const { history } = await getHistory({ interviewId: "1" }); */

  return (
    <div className="mx-auto mt-8 flex max-w-360">
      <InterviewClient history={[]} />
    </div>
  );
}
