import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { IChatMessage } from "@/app/components/chat-history";
import { buildChatHistory } from "@/app/lib/client/chat";

import { useMediaPermissions } from "./use-media-permissions";
import useMediaRecorder from "./use-media-recorder";

import {
  generateQuestion,
  IHistoryItem,
} from "../(tabs)/(simulator)/interview/[id]/actions";

export const useInterviewControls = (history: IHistoryItem[] = []) => {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chats, setChats] = useState<IChatMessage[]>(buildChatHistory(history));
  const [isGenerating, setIsGenerating] = useState(false);

  // Media permissions and streams
  const {
    videoStream,
    audioStream,
    requestVideo,
    requestAudio,
    stopMediaStream,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
  } = useMediaPermissions();

  /**  video audio stream을 media stream 으로 변환하는 함수입니다. */
  const mediaStream = useMemo(() => {
    if (videoStream || audioStream) {
      return new MediaStream([
        ...(videoStream?.getTracks() ?? []),
        ...(audioStream?.getTracks() ?? []),
      ]);
    }
    return null;
  }, [videoStream, audioStream]);

  ////////// Media recording //////////
  const {
    startVideoRecording,
    stopVideoRecording,
    startAudioRecording,
    stopAudioRecording,
    isRecording,
  } = useMediaRecorder(mediaStream);

  // Initialize media permissions and start recording
  useEffect(() => {
    let mounted = true;

    const start = async () => {
      if (!videoStream && !audioStream) {
        const videoResult = await requestVideo();
        const audioResult = await requestAudio();

        if (!videoResult) {
          console.warn("Video permission failed or not available");
        }
        if (!audioResult) {
          console.warn("Audio permission failed or not available");
        }

        if (!videoResult && !audioResult) {
          console.error("Both video and audio permissions failed");
          return;
        }

        return;
      }

      if (mounted && mediaStream) {
        startVideoRecording();
        startAudioRecording();
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
    requestVideo,
    requestAudio,
    startVideoRecording,
    stopVideoRecording,
    startAudioRecording,
    stopAudioRecording,
    stopMediaStream,
  ]);

  ////////// Initialize chat with first question //////////
  useEffect(() => {
    const init = async () => {
      if (chats.length > 0 || isGenerating) return;

      setIsGenerating(true);
      try {
        const result = await generateQuestion({ interviewId: "1" });
        if (result) {
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

  ////////// Control functions //////////

  const handleMicToggle = useCallback(() => {
    const newState = !isAudioEnabled;
    toggleAudio(newState);
  }, [isAudioEnabled, toggleAudio]);

  const handleCamToggle = useCallback(() => {
    const newState = !isVideoEnabled;
    toggleVideo(newState);
  }, [isVideoEnabled, toggleVideo]);

  const handleExit = useCallback(
    async (path?: string) => {
      await Promise.all([stopVideoRecording(), stopAudioRecording()]);
      stopMediaStream();
      router.push(path ?? "/dashboard/result");
    },
    [stopVideoRecording, stopAudioRecording, stopMediaStream, router],
  );

  const toggleChat = useCallback((newState?: boolean) => {
    setIsChatOpen((prev) => (newState !== undefined ? newState : !prev));
  }, []);

  return {
    // Stream states
    mediaStream,
    isVideoEnabled,
    isAudioEnabled,
    isRecording,
    isChatOpen,

    // Chat state
    chats,
    setChats,
    isGenerating,

    // Control functions
    handleMicToggle,
    handleCamToggle,
    handleExit,
    toggleChat,

    // Raw toggle functions (for backward compatibility)
    toggleVideo,
    toggleAudio,

    // Recording controls
    startRecording: () => {
      startVideoRecording();
      startAudioRecording();
    },
    stopRecording: () => {
      stopVideoRecording();
      stopAudioRecording();
    },
  };
};
