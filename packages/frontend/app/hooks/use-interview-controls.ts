import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { IChatMessage } from "@/app/components/chat-history";
import { buildChatHistory } from "@/app/lib/client/chat";

import useMediaRecorder from "./use-media-recorder";
import {
  generateQuestion,
  IHistoryItem,
} from "../(tabs)/(simulator)/interview/[id]/actions";

export const useInterviewControls = (
  interviewId: string,
  history: IHistoryItem[] = [],
) => {
  const router = useRouter();
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const chatInitRef = useRef(false);

  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chats, setChats] = useState<IChatMessage[]>(buildChatHistory(history));
  const [isGenerating, setIsGenerating] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [log, setLog] = useState<string>("");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const {
    isRecording,
    startVideoRecording,
    stopVideoRecording,
    startAudioRecording,
    stopAudioRecording,
  } = useMediaRecorder(stream);

  const appendLog = useCallback((message: string) => {
    setLog(
      (prev) => `${new Date().toLocaleTimeString()} - ${message}\n${prev}`,
    );
  }, []);

  // 스트림 정지 유틸리티
  const stopAllTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        appendLog(`트랙 정지: ${track.kind}`);
      });
      setStream(null);
    }
  }, [stream, appendLog]);

  useEffect(() => {
    let isMounted = true;

    const initStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        if (!isMounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        setStream(mediaStream);
        appendLog("MediaStream 생성 성공");

        if (videoElRef.current) {
          videoElRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        appendLog(`getUserMedia 실패: ${error}`);
      }
    };

    initStream();

    return () => {
      isMounted = false;
    };
  }, [appendLog, interviewId]);

  useEffect(() => {
    if (
      stream &&
      videoElRef.current &&
      videoElRef.current.srcObject !== stream
    ) {
      videoElRef.current.srcObject = stream;
      appendLog("비디오 엘리먼트 스트림 재연결");
    }
  }, [stream, appendLog]);

  useEffect(() => {
    if (chatInitRef.current || chats.length > 0) {
      return;
    }

    const loadInitialQuestion = async () => {
      chatInitRef.current = true;
      setIsGenerating(true);
      try {
        const result = await generateQuestion({ interviewId });
        if (result?.question) {
          setChats([
            {
              id: result.questionId,
              content: result.question.trim(),
              role: "ai",
              sender: "Interviewer",
              timestamp: new Date(result.createdAt).toISOString(),
            },
          ]);
          appendLog("초기 질문 로드 완료");
        }
      } catch (error) {
        appendLog(`초기 질문 실패: ${error}`);
        chatInitRef.current = false; // 실패 시 재시도 가능하게
      } finally {
        setIsGenerating(false);
      }
    };

    loadInitialQuestion();
  }, [chats.length, appendLog, interviewId]);

  useEffect(() => {
    if (!stream) return;

    startVideoRecording();
    startAudioRecording();
    appendLog("자동 녹화 시작");

    return () => {
      stopVideoRecording();
      stopAudioRecording();
    };
  }, [
    stream,
    startVideoRecording,
    startAudioRecording,
    stopVideoRecording,
    stopAudioRecording,
    appendLog,
  ]);

  // 인터페이스 함수들
  const handleMicToggle = useCallback(() => {
    if (!stream) {
      return;
    }
    const newState = !isAudioEnabled;
    stream.getAudioTracks().forEach((t) => (t.enabled = newState));
    setIsAudioEnabled(newState);
  }, [stream, isAudioEnabled]);

  const handleCamToggle = useCallback(() => {
    if (!stream) {
      return;
    }
    const newState = !isVideoEnabled;
    stream.getVideoTracks().forEach((t) => (t.enabled = newState));
    setIsVideoEnabled(newState);
  }, [stream, isVideoEnabled]);

  const handleExit = useCallback(
    (href: string) => {
      stopAllTracks();
      router.push(href);
    },
    [stopAllTracks, router],
  );

  return {
    stream,
    isVideoEnabled,
    isAudioEnabled,
    isChatOpen,
    chats,
    setChats,
    isGenerating,
    isRecording,
    log,
    videoElRef,
    handleMicToggle,
    handleCamToggle,
    toggleChat: (state?: boolean) => setIsChatOpen((prev) => state ?? !prev),
    handleExit,
    appendLog,
  };
};
