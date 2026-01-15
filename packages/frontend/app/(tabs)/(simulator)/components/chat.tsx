"use client";

import { useState } from "react";

import ChatInput from "@/app/(tabs)/(simulator)/components/chat-input";
import ChatHistory, { IChatMessage } from "@/app/components/chat-history";

import { useMediaPermissions } from "@/app/hooks/use-media-permissions";
import useMediaRecorder from "@/app/hooks/use-media-recorder";

import {
  speakAnswer,
  sendAnswer,
  generateQuestion,
} from "../interview/[id]/actions";

export default function Chat({ initalChats }: { initalChats: IChatMessage[] }) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<IChatMessage[]>(initalChats);

  const { stream: mediaStream, requestPermissions: requestMediaPermissions } =
    useMediaPermissions();
  const { startAudioRecording, stopAudioRecording } =
    useMediaRecorder(mediaStream);

  async function handleVoiceToggle() {
    if (!isRecording) {
      if (!mediaStream) {
        const audioPermissions = await requestMediaPermissions({
          audio: true,
          video: true,
        });
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
        interviewId: "1",
        audio: blob,
      });

      if (answer) {
        // FIXME: 임시로 작성해두었습니다.
        await sendAnswer({
          interviewId: "1",
          answer: answer,
        });
        // TODO: 답변 처리 추가로 해야함.
        await generateQuestion({
          interviewId: "1",
        });
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

  async function onSendMessage(text: string) {
    const newMessage: IChatMessage = {
      id: Date.now().toString(),
      content: text,
      role: "user",
      sender: "You",
      timestamp: new Date(),
    };
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);
    await sendAnswer({
      interviewId: "1",
      answer: text,
    });
    await generateQuestion({
      interviewId: "1",
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
