"use client";
import { Dispatch, SetStateAction, useState, useCallback, useRef } from "react";
import ChatInput from "@/app/(tabs)/(simulator)/components/chat-input";
import ChatHistory, { IChatMessage } from "@/app/components/chat-history";
import useMediaRecorder from "@/app/hooks/use-media-recorder";
import {
  speakAnswer,
  sendAnswer,
  generateQuestion,
} from "../interview/[id]/actions";
import { Card } from "@/app/components/ui/card";
import { cn } from "@/app/lib/utils";

export default function Chat({
  initalChats,
  setChats,
  stream,
  interviewId,
  className,
}: {
  initalChats: IChatMessage[];
  setChats: Dispatch<SetStateAction<IChatMessage[]>>;
  stream: MediaStream | null;
  interviewId: string;
  className?: string;
}) {
  const [restartCount, setRestartCount] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDone, setIsDone] = useState(false);

  const processingRef = useRef(false);

  const { startAudioRecording, stopAudioRecording } = useMediaRecorder(stream);

  const appendMessage = useCallback(
    (content: string, role: "user" | "ai", sender: string) => {
      if (!content.trim()) return;

      setChats((prev) => {
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            content: content.trim(),
            role,
            sender,
            timestamp: new Date().toISOString(),
          },
        ];
      });
    },
    [setChats],
  );

  // isVoice 파라미터 추가: 음성 녹음 결과인지 텍스트 입력인지 구분
  const processAnswer = async (answerText: string, isVoice = false) => {
    if (processingRef.current || !answerText.trim()) return;

    processingRef.current = true;
    setIsProcessing(true);
    setError(null);

    try {
      // 화면에 사용자 메시지 즉시 표시
      appendMessage(answerText, "user", "You");

      // 답변 전송 (텍스트 입력일 때만 실행)
      if (!isVoice) {
        await sendAnswer({ interviewId, answer: answerText });
      }

      // 서버가 DB 처리를 완료할 수 있도록 지연
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 다음 질문 생성 요청
      const nextQ = await generateQuestion({ interviewId });

      if (nextQ) {
        const qContent = nextQ.question;

        if (qContent) {
          appendMessage(qContent, "ai", "Interviewer");
        }

        if (nextQ.isLast) {
          setIsDone(true);
          return;
        }
      }
    } catch (error) {
      if (restartCount < 3) {
        setRestartCount(restartCount + 1);
        processAnswer(answerText, isVoice); // 재시도
      } else {
        setError("메시지 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setRestartCount(0);
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const handleVoiceToggle = async () => {
    if (!isRecording) {
      if (!stream) return;
      try {
        startAudioRecording();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        const blob = await stopAudioRecording();
        setIsRecording(false);
        if (!blob) return;

        const response = await speakAnswer({ interviewId, audio: blob });

        if (response?.answer) {
          await processAnswer(response.answer, true);
        }
      } catch (e) {
        console.error(e);
        setIsRecording(false);
        setError("음성 인식 처리 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <Card
      className={cn(
        "flex h-full flex-col border-none shadow-none ring-0",
        className,
      )}
    >
      <div className="min-h-0 flex-1">
        <ChatHistory chatMessages={initalChats} />
      </div>

      <div className="flex flex-col gap-2 p-4">
        {isProcessing && (
          <p className="animate-pulse px-1 text-xs text-blue-500">
            면접관이 생각 중입니다...
          </p>
        )}
        {error && (
          <p className="px-1 text-xs font-medium text-red-500">{error}</p>
        )}
        {isDone ? (
          <p className="px-1 text-xs font-medium text-green-600">
            모든 질문이 완료되었습니다. 수고하셨습니다!
          </p>
        ) : (
          <ChatInput
            onSend={(text) => processAnswer(text, false)} // 텍스트 입력은 isVoice = false
            onHandleVoiceToggle={handleVoiceToggle}
            isRecording={isRecording}
            disabled={isProcessing}
          />
        )}
      </div>
    </Card>
  );
}
