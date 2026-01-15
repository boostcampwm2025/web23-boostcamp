"use client";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMediaPermissions } from "@/app/hooks/use-media-permissions";
import useMediaRecorder from "@/app/hooks/use-media-recorder";
import VideoGrid from "../components/video-grid";
import ChatPanel from "../../components/chat-panel";
import { InterviewControls } from "../components/interview-controls";
import { IChatMessage } from "@/app/components/chat-history";
import { generateQuestion } from "./actions";

export default function InterviewClient({
  initialChats,
}: {
  initialChats: IChatMessage[];
}) {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [chats, setChats] = useState<IChatMessage[]>(initialChats);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const {
    stream,
    requestPermissions,
    stopMediaStream,
    pauseVideoRecording,
    resumeVideoRecording,
    toggleMicTrack,
  } = useMediaPermissions();
  const { startVideoRecording, stopVideoRecording } = useMediaRecorder(stream);

  useEffect(() => {
    let mounted = true;
    let started = false;

    const start = async () => {
      if (!stream) {
        await requestPermissions();
        return;
      }
      if (mounted && !started && stream) {
        startVideoRecording();
        setIsCamOn(true);
        setIsMicOn(true);
        started = true;
      }
    };

    start();
    return () => {
      mounted = false;
      stopVideoRecording();
      stopMediaStream();
    };
  }, [stream, requestPermissions, startVideoRecording, stopVideoRecording, stopMediaStream]);

  useLayoutEffect(() => {
    const init = async () => {
      // 1. 이미 데이터가 있거나 생성 중이면 절대 실행 안 함
      if (chats.length > 0 || isGenerating) return;

      setIsGenerating(true);
      try {
        const firstQuestion = await generateQuestion({ interviewId: "1" });
        
        // 2. 방어 코드: 응답 데이터가 유효한지 꼼꼼하게 체크
        if (firstQuestion) {
          const qContent = firstQuestion.question || firstQuestion.content;
          
          // 3. 내용이 있을 때만 상태 업데이트
          if (qContent && typeof qContent === 'string') {
            const rawDate = firstQuestion.createdAt || new Date();
            const qCreatedAt = new Date(rawDate);
            
            // Invalid Date 체크 (날짜가 유효하지 않으면 현재 시간으로 대체)
            const finalDate = isNaN(qCreatedAt.getTime()) ? new Date() : qCreatedAt;

            setChats([{
              id: crypto.randomUUID(),
              content: qContent.trim(),
              role: "ai",
              sender: "Interviewer",
              timestamp: finalDate
            }]);
          }
        }
      } catch (e) {
        console.error("초기 질문 생성 중 에러 발생:", e);
      } finally {
        setIsGenerating(false);
      }
    };
    init();
  }, []);

  return (
    <div className="mt-5 flex h-full max-w-630 flex-col justify-center gap-5 py-2 xl:flex-row">
      <div className="relative w-full max-w-7xl xl:flex-2">
        <VideoGrid stream={stream} isCamOn={isCamOn} />
        <InterviewControls
          onToggleChat={() => setIsChatOpen((prev) => !prev)}
          isCamOn={isCamOn}
          setIsCamOn={setIsCamOn}
          isMicOn={isMicOn}
          setIsMicOn={setIsMicOn}
          pauseVideo={pauseVideoRecording}
          resumeVideo={resumeVideoRecording}
          toggleMic={toggleMicTrack}
          onExit={() => {
            stopVideoRecording().finally(() => {
              stopMediaStream();
              router.push("/dashboard/result");
            });
          }}
        />
      </div>
      {isChatOpen && (
        <div className="flex-1">
          <ChatPanel
            initialChats={chats} // 실시간 업데이트되는 chats 상태 전달
            setChats={setChats}
            onClose={() => setIsChatOpen(false)}
            stream={stream}
          />
        </div>
      )}
    </div>
  );
}