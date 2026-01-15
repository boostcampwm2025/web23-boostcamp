"use client";

import { useState } from "react";

import ChatInput from "@/app/(tabs)/(simulator)/components/chat_input";
import ChatHistory, { IChatMessage } from "@/app/components/chat_history";

import { useMediaPermissions } from "@/app/hooks/use-media-permissions";
import useMediaRecorder from "@/app/hooks/use-media-recorder";

import { speakAnswer, sendAnswer } from "../interview/[id]/actions";

export default function Chat() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<IChatMessage[]>([]);

  const { stream: mediaStream, requestPermissions: requestMediaPermissions } =
    useMediaPermissions();
  const { startAudioRecording, stopAudioRecording } =
    useMediaRecorder(mediaStream);

  async function handleVoiceToggle() {
    if (!isRecording) {
      if (!mediaStream) {
        const audioPermissions = await requestMediaPermissions({audio: true});
        if (!audioPermissions) {
          setError("오디오에 대한 권한이 거부되었습니다.");
          return;
        }
      }

      try {
        startAudioRecording();
        setIsRecording(true);
      } catch (error) {
        setError(`오디오 녹음 시작에 실패했습니다. : ${error}`);
      }
      return;
    }

    try {
      const blob = await stopAudioRecording();
      setIsRecording(false);
      if (!blob) {
        // TODO: ERROR 처리
        return;
      }
      const { answer } = await speakAnswer({
        interviewId: "simulator",
        audio: blob,
      });
      if (answer) {
        // TODO: 답변 처리
      }
    } catch (error) {
      setError(`오디오 녹음 중지에 실패했습니다. : ${error}`);
      setIsRecording(false);
    }
  }

  /* audio stream */
  /* useEffect(() => {
    if (mediaStream) {
      try {
        startAudioRecording();
        setIsRecording(true);
      } catch (err) {
        console.error("권한 후 오디오 녹음 시작 실패:", err);
      } finally {
      }
    }
  }, [startAudioRecording, mediaStream]); */

  function onSendMessage(text: string) {
    const newMessage: IChatMessage = {
      id: Date.now().toString(),
      content: text,
      role: "user",
      sender: "You",
      timestamp: new Date(),
    };
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);
    sendAnswer({
      interviewId: "simulator",
      answer: text,
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <ChatHistory chatMessages={chatMessages} />
      </div>
      <ChatInput
        placeholder="message..."
        onSend={onSendMessage}
        onHandleVoiceToggle={handleVoiceToggle}
        isRecording={isRecording}
      />
    </div>
  );
}
