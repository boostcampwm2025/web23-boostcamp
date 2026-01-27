"use client";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  LogOut,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";

interface InterviewControlsProps {
  onToggleChat: () => void;
  onExit: () => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
}

export function InterviewControls({
  onToggleChat,
  onExit,
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
}: InterviewControlsProps) {
  return (
    <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 backdrop-blur">
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleAudio}
          className={`text-white hover:bg-white/20 ${
            isAudioEnabled ? "" : "opacity-50"
          }`}
        >
          {isAudioEnabled ? <Mic /> : <MicOff />}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleVideo}
          className={`text-white hover:bg-white/20 ${
            isVideoEnabled ? "bg-red-500/30" : ""
          }`}
        >
          {isVideoEnabled ? <Video /> : <VideoOff />}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleChat}
          className="text-white hover:bg-white/20"
        >
          <MessageSquare />
        </Button>
        <span className="mx-1 h-6 w-px bg-white/20" />
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
