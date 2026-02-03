import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";

import { useAudioViz } from "@/app/hooks/use-audio-viz";

import PinsCanvas from "./pins-canvas";
import ActionButton from "./action-button";

interface IVoiceInputProps {
  onCancel: () => void;
  audioStream: MediaStream | null;
  isRecording: boolean;
  onSend: () => void;
}

export default function VoiceInput({
  onCancel,
  audioStream,
  isRecording,
  onSend,
}: IVoiceInputProps) {
  const [vizOpen, setVizOpen] = useState(false);

  useEffect(() => {
    if (!audioStream || !isRecording) {
      setVizOpen(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setVizOpen(true);
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [audioStream, isRecording]);

  // 오디오 시각화 (테스트: 항상 표시 / 실제: aiState === "speaking"일 때만)
  const { audioLevel } = useAudioViz({
    // 녹음 중일 때만 WebAudio를 켜서 버벅임/잔상 방지
    open: !!audioStream && vizOpen,
    // open: !!audioStream && aiState === "speaking", // 실제 사용 시 주석 해제
    audioStream: audioStream!,
  });

  return (
    <div className="flex items-center gap-1 rounded-full bg-white px-6 py-2 shadow-lg">
      <PinsCanvas audioLevel={audioLevel} className="h-11 w-64" />
      <div className="flex gap-0.5">
        <ActionButton onClick={onCancel} icon={<X />} />
        <ActionButton
          icon={<Send className={isRecording ? "text-red-500" : undefined} />}
          onClick={onSend}
        />
      </div>
    </div>
  );
}
