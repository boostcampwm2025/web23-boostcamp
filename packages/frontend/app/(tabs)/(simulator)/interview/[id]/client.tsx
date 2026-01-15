"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useMediaPermissions } from "@/app/hooks/use-media-permissions";
import useMediaRecorder from "@/app/hooks/use-media-recorder";

import VideoGrid from "../components/video-grid";
import ChatPanel from "../../components/chat-panel";
import { InterviewControls } from "../components/interview-controls";
import { IChatMessage } from "@/app/components/chat-history";

export default function InterviewClient({
  initialChats,
}: {
  initialChats: IChatMessage[];
}) {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
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

  // 입장 시 (컴포넌트 마운트) 녹화 시작, 나갈 때 녹화 종료
  useEffect(() => {
    let mounted = true;
    let started = false;

    const start = async () => {
      if (!stream) {
        await requestPermissions();
        return;
      }

      if (mounted && !started && stream) {
        // 하나의 MediaRecorder로 비디오(및 오디오)를 녹화합니다.
        startVideoRecording();
        setIsCamOn(true);
        setIsMicOn(true);
        started = true;
      }
    };

    start();

    return () => {
      mounted = false;
      // 녹화 중지 (비디오 recorder 하나로 처리)
      stopVideoRecording();
      // 미디어 스트림 정리
      stopMediaStream();
    };
  }, [
    stream,
    requestPermissions,
    startVideoRecording,
    stopVideoRecording,
    stopMediaStream,
  ]);

  return (
    <div className="mt-5 flex h-full max-w-630 flex-col justify-center gap-5 py-2 xl:flex-row">
      <div className="relative w-full max-w-7xl xl:flex-2">
        <VideoGrid stream={stream} isCamOn={isCamOn} />
        {/* <InterviewControls /> */}
        {/* FIXME: 이 부분은 의논.. 그 채팅방 껏을 떄도 자막 보이게.. */}
        {/* <div className="absolute bottom-4 left-4">
          <div className="rounded-md bg-black/60 px-3 py-1 text-sm text-white">
            면접관: React의 Virtual DOM 작동 원리에 대해 설명해 주실 수 있나요?
          </div>
        </div> */}

        {/* control message show , mic on off, cam on off */}
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
            // 녹화 중지 및 결과 페이지로 이동
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
            initialChats={initialChats}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}
      {/* {!isChatOpen && (
        <Button
          className="fixed right-6 bottom-6 h-12 w-12 rounded-full shadow-lg"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageSquare className="size-6" />
        </Button>
      )} */}
    </div>
  );
}
