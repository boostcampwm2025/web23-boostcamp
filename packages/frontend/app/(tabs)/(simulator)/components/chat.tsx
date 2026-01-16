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
  className,
}: {
  initalChats: IChatMessage[];
  setChats: Dispatch<SetStateAction<IChatMessage[]>>;
  stream: MediaStream | null;
  className?: string;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);

  const { startAudioRecording, stopAudioRecording } = useMediaRecorder(stream);

  const appendMessage = useCallback(
    (content: string, role: "user" | "ai", sender: string) => {
      if (!content.trim()) return;

      setChats((prev) => {
        // [중복 체크] 내용과 역할이 같으면 추가 안 함
        const isDuplicate = prev.some(
          (msg) => msg.content.trim() === content.trim() && msg.role === role,
        );
        if (isDuplicate) return prev;

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
        console.log("텍스트 답변 저장 중...");
        await sendAnswer({ interviewId: "1", answer: answerText });
      } else {
        console.log("음성 답변은 이미 서버(STT)에서 저장됨, 추가 저장 스킵");
      }

      // 서버가 DB 처리를 완료할 수 있도록 지연
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 다음 질문 생성 요청
      console.log("새 질문 생성 요청 중...");
      const nextQ = await generateQuestion({ interviewId: "1" });

      if (nextQ) {
        const qContent = nextQ.question || nextQ.content;
        if (qContent) {
          appendMessage(qContent, "ai", "Interviewer");
        }
      }
    } catch (e) {
      console.error("Chat Flow Error:", e);
      setError("메시지 처리 중 오류가 발생했습니다.");
    } finally {
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

        const response = await speakAnswer({ interviewId: "1", audio: blob });

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
      className={cn("flex h-full flex-col border-0 shadow-none", className)}
    >
      <div className="flex-1 overflow-y-auto">
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
        <ChatInput
          onSend={(text) => processAnswer(text, false)} // 텍스트 입력은 isVoice = false
          onHandleVoiceToggle={handleVoiceToggle}
          isRecording={isRecording}
          disabled={isProcessing}
        />
      </div>
    </Card>
  );
}
