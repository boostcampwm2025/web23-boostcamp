"use client";

import { Button } from "@/app/components/ui/button";
import { Mic, MicOff, Video, VideoOff, MessageSquare, LogOut } from "lucide-react";

interface InterviewControlsProps {
  onToggleChat: () => void;
  isCamOn: boolean;
  setIsCamOn: (val: boolean) => void;
  isMicOn: boolean;
  setIsMicOn: (val: boolean) => void;
  pauseVideo: () => void;
  resumeVideo: () => void;
  toggleMic: (enabled: boolean) => void;
  onExit: () => void;
}

export function InterviewControls({
  onToggleChat,
  isCamOn,
  setIsCamOn,
  isMicOn,
  setIsMicOn,
  pauseVideo,
  resumeVideo,
  toggleMic,
  onExit,
}: InterviewControlsProps) {
  // 마이크 토글 (녹화 중 음소거/활성화)
  const handleMicToggle = () => {
    const newMicState = !isMicOn;
    setIsMicOn(newMicState);
    toggleMic(newMicState);
  };

  // 카메라 토글 (트랙만 끄고 켜기)
  const handleCamToggle = async () => {
    if (isCamOn) {
      // 카메라만 일시 중지
      pauseVideo();
      setIsCamOn(false);
    } else {
      // 카메라 재개
      resumeVideo();
      setIsCamOn(true);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 backdrop-blur">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleMicToggle}
          className={`text-white hover:bg-white/20 ${
            isMicOn ? "" : "opacity-50"
          }`}
        >
          {isMicOn ? <Mic /> : <MicOff />}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={handleCamToggle}
          className={`text-white hover:bg-white/20 ${
            isCamOn ? "bg-red-500/30" : ""
          }`}
        >
          {isCamOn ? <Video /> : <VideoOff />}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleChat}
          className="text-white hover:bg-white/20"
        >
          <MessageSquare />
        </Button>
        <span className="h-6 w-px bg-white/20 mx-1" />
        <Button
          size="icon"
          variant="ghost"
          onClick={onExit}
          className="text-white hover:bg-white/20"
          title="Exit interview"
        >
          <LogOut />
        </Button>
      </div>
    </div>
  );
}
