"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Mic, MicOff, Video, VideoOff, MessageSquare } from "lucide-react";

interface InterviewControlsProps {
  onToggleChat: () => void;
}

export function InterviewControls({ onToggleChat }: InterviewControlsProps) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 backdrop-blur">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setMicOn((v) => !v)}
          className="text-white hover:bg-white/20"
        >
          {micOn ? <Mic /> : <MicOff />}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setCamOn((v) => !v)}
          className="text-white hover:bg-white/20"
        >
          {camOn ? <Video /> : <VideoOff />}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleChat}
          className="text-white hover:bg-white/20"
        >
          <MessageSquare />
        </Button>
      </div>
    </div>
  );
}
