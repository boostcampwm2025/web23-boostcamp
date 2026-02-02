import { Send, X } from "lucide-react";
import { motion } from "motion/react";

import { useAudioViz } from "@/app/hooks/use-audio-viz";

import PinsCanvas from "./pins-canvas";
import ActionButton from "./action-button";

interface IVoiceInputProps {
  changeToTextMode: (mode: "text" | "voice") => void;
  audioStream: MediaStream | null;
}

export default function VoiceInput({
  changeToTextMode,
  audioStream,
}: IVoiceInputProps) {
  // 오디오 시각화 (테스트: 항상 표시 / 실제: aiState === "speaking"일 때만)
  const { audioLevel, timeDataRef } = useAudioViz({
    open: !!audioStream, // 테스트용: 항상 작동
    // open: !!audioStream && aiState === "speaking", // 실제 사용 시 주석 해제
    audioStream: audioStream!,
  });

  return (
    <div className="flex items-center gap-1 rounded-full bg-white px-6 py-2 shadow-lg">
      <PinsCanvas audioLevel={audioLevel} className="h-11 w-64" />
      <div className="flex gap-0.5">
        <ActionButton onClick={() => changeToTextMode("text")} icon={<X />} />
        <ActionButton icon={<Send />} />
      </div>
    </div>
  );
}
