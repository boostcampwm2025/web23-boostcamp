"use client";

import { useState } from "react";
import { Heart, HeartOff, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { like, dislike } from "../actions";

export default function InterviewFeedbackButtons({
  interviewId,
  userToken,
}: {
  interviewId: string;
  userToken: string;
}) {
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLike = async () => {
    setError(null);
    try {
      await like({ interviewId, userToken });
      setFeedback("like");
    } catch (error) {
      console.error("좋아요 실패:", error);
      setError("피드백 전송에 실패했습니다. 다시 시도해주세요.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDislike = async () => {
    setError(null);
    try {
      await dislike({ interviewId, userToken });
      setFeedback("dislike");
    } catch (error) {
      console.error("싫어요 실패:", error);
      setError("피드백 전송에 실패했습니다. 다시 시도해주세요.");
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center justify-between">
        <span className="text-sm text-black/60">도움이 되었을까요?</span>
        <div className="flex gap-2">
          <Button
            className="cursor-pointer"
            onClick={handleLike}
            variant={feedback === "like" ? "default" : "outline"}
          >
            <Heart
              className={feedback === "like" ? "fill-current text-white" : ""}
            />
          </Button>
          <Button
            className="cursor-pointer"
            onClick={handleDislike}
            variant={feedback === "dislike" ? "default" : "outline"}
          >
            <HeartOff
              className={
                feedback === "dislike" ? "fill-current text-white" : ""
              }
            />
          </Button>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {feedback && !error && (
        <div className="flex items-center justify-end text-sm text-green-600">
          <span>피드백이 전송되었습니다. 감사합니다!</span>
        </div>
      )}
    </div>
  );
}
