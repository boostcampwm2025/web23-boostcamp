"use client";

import { useLayoutEffect, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useMediaPermissions } from "@/app/hooks/use-media-permissions";
import useMediaRecorder from "@/app/hooks/use-media-recorder";
import { IChatMessage } from "@/app/components/chat-history";
import { buildChatHistory } from "@/app/lib/client/chat";

import VideoGrid from "../components/video-grid";
import ChatPanel from "../../components/chat-panel";
import { InterviewControls } from "../components/interview-controls";

import { generateQuestion, IHistoryItem } from "./actions";

export default function InterviewClient({
  history,
}: {
  history: IHistoryItem[];
}) {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [chats, setChats] = useState<IChatMessage[]>(buildChatHistory(history));
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const {
    videoStream,
    audioStream,
    requestPermissions,
    stopMediaStream,
    toggleVideo,
    toggleAudio,
  } = useMediaPermissions();

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (videoStream || audioStream) {
      const combinedStream = new MediaStream([
        ...(videoStream?.getTracks() ?? []),
        ...(audioStream?.getTracks() ?? []),
      ]);
      setMediaStream(combinedStream);
    }
  }, [videoStream, audioStream]);

  const {
    startVideoRecording,
    stopVideoRecording,
    startAudioRecording,
    stopAudioRecording,
  } = useMediaRecorder(mediaStream);

  // FIXME: 이 부분은 이전 페이지에서
  useLayoutEffect(() => {
    let mounted = true;

    const start = async () => {
      if (!videoStream && !audioStream) {
        await requestPermissions({ video: true, audio: true });
        return;
      }

      if (mounted && mediaStream) {
        startVideoRecording();
        startAudioRecording();
        setIsCamOn(true);
        setIsMicOn(true);
      }
    };

    start();
    return () => {
      mounted = false;
      stopVideoRecording();
      stopAudioRecording();
      stopMediaStream();
    };
  }, [
    mediaStream,
    videoStream,
    audioStream,
    requestPermissions,
    startVideoRecording,
    stopVideoRecording,
    startAudioRecording,
    stopAudioRecording,
    stopMediaStream,
  ]);

  useLayoutEffect(() => {
    const init = async () => {
      // 1. 이미 데이터가 있거나 생성 중이면 절대 실행 안 함
      if (chats.length > 0 || isGenerating) return;

      setIsGenerating(true);
      try {
        const result = await generateQuestion({ interviewId: "1" });
        // 2. 방어 코드: 응답 데이터가 유효한지 꼼꼼하게 체크
        if (result) {
          // 3. 내용이 있을 때만 상태 업데이트
          if (result.question && typeof result.question === "string") {
            setChats([
              {
                id: result.questionId,
                content: result.question.trim(),
                role: "ai",
                sender: "Interviewer",
                timestamp: new Date(result.createdAt).toISOString(),
              },
            ]);
          }
        }
      } catch (error) {
        throw new Error(`초기 질문 생성중 에러 발생 ${error}`);
      } finally {
        setIsGenerating(false);
      }
    };
    init();
  }, [chats, isGenerating]);

  return (
    <div className="mt-5 flex h-full max-w-630 flex-col justify-center gap-5 py-2 xl:flex-row">
      <div className="relative w-full max-w-7xl xl:flex-2">
        <VideoGrid stream={mediaStream} isCamOn={isCamOn} />
        <InterviewControls
          onToggleChat={() => setIsChatOpen((prev) => !prev)}
          isCamOn={isCamOn}
          setIsCamOn={setIsCamOn}
          isMicOn={isMicOn}
          setIsMicOn={setIsMicOn}
          toggleVideo={toggleVideo}
          toggleAudio={toggleAudio}
          onExit={() => {
            Promise.all([stopVideoRecording(), stopAudioRecording()]).finally(
              () => {
                stopMediaStream();
                router.push("/dashboard/result");
              },
            );
          }}
        />
      </div>
      {isChatOpen && (
        <div className="flex-1">
          <ChatPanel
            initialChats={chats} // 실시간 업데이트되는 chats 상태 전달
            setChats={setChats}
            onClose={() => setIsChatOpen(false)}
            stream={mediaStream}
          />
        </div>
      )}
    </div>
  );
}
