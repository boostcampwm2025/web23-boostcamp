import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  generateQuestion,
  type IHistoryItem,
  sendAnswer,
  speakAnswer,
} from "./actions";

import { useAudioRecording } from "@/app/hooks/recording/use-audio-recording";
import { useMediaPermissions } from "@/app/hooks/use-media-permissions";
import useMediaRecorder from "@/app/hooks/use-media-recorder";
import type { IChatMessage } from "@/app/components/chat-history";

export type InputMode = "text" | "voice";
export type AiState = "idle" | "thinking" | "speaking";

interface UseInterviewControllerParams {
  history: IHistoryItem[];
  interviewId: string;
}

export const useInterviewController = ({
  history,
  interviewId,
}: UseInterviewControllerParams) => {
  const router = useRouter();

  const initialChats = useMemo<IChatMessage[]>(() => {
    return history.flatMap((item, index) => {
      const result: IChatMessage[] = [
        {
          id: `history-${index}-q-${item.question.createdAt}`,
          sender: "면접관",
          role: "ai",
          content: item.question.content,
          timestamp: item.question.createdAt,
        },
      ];

      if (item.answer?.content) {
        result.push({
          id: `history-${index}-a-${item.answer.createdAt}`,
          sender: "나",
          role: "user",
          content: item.answer.content,
          timestamp: item.answer.createdAt,
        });
      }

      return result;
    });
  }, [history]);

  const [textInput, setTextInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [aiState, setAiState] = useState<AiState>(
    initialChats.length > 0 ? "idle" : "thinking",
  );

  const [chats, setChats] = useState<IChatMessage[]>(initialChats);
  const [question, setQuestion] = useState(() => {
    const lastQuestion = history.at(-1)?.question?.content;
    return lastQuestion ?? "";
  });

  const initRef = useRef(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMediaPermissionPanelOpen, setIsMediaPermissionPanelOpen] =
    useState(false);

  const normalizeTimestamp = useCallback((value: unknown) => {
    if (typeof value === "string") return value;
    if (value instanceof Date) return value.toISOString();
    try {
      return new Date(value as never).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }, []);

  const appendMessage = useCallback(
    (message: Omit<IChatMessage, "id"> & { id?: string }) => {
      setChats((prev) => [
        ...prev,
        {
          id: message.id ?? crypto.randomUUID(),
          sender: message.sender,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp,
        },
      ]);
    },
    [],
  );

  const updateMessage = useCallback(
    (
      id: string,
      patch: Partial<Pick<IChatMessage, "content" | "timestamp">>,
    ) => {
      setChats((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      );
    },
    [],
  );

  const reportErrorToChat = useCallback(
    (title: string, error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : JSON.stringify(error);

      appendMessage({
        sender: "시스템",
        role: "feedback",
        content: `${title}: ${message}`,
        timestamp: new Date().toISOString(),
      });
    },
    [appendMessage],
  );

  const {
    videoStream,
    audioStream,
    requestPermissions,
    stopMediaStream,
    hasVideoPermission,
    hasAudioPermission,
    isVideoEnabled,
    isAudioEnabled,
  } = useMediaPermissions();

  const sessionStream = useMemo(() => {
    const videoTracks = videoStream?.getVideoTracks() ?? [];
    const audioTracks = audioStream?.getAudioTracks() ?? [];
    const tracks = [...videoTracks, ...audioTracks];
    if (tracks.length === 0) return null;
    return new MediaStream(tracks);
  }, [videoStream, audioStream]);

  const {
    isRecording: isSessionRecording,
    startVideoRecording: startSessionVideoRecording,
    stopVideoRecording: stopSessionVideoRecording,
  } = useMediaRecorder(sessionStream, { interviewId });

  const {
    isRecording: isVoiceRecording,
    startAudioRecording,
    stopAudioRecording,
  } = useMediaRecorder(audioStream);

  useAudioRecording();

  useEffect(() => {
    requestPermissions({ video: true, audio: true });
  }, [requestPermissions]);

  const sessionRecordingInitRef = useRef(false);

  useEffect(() => {
    if (sessionRecordingInitRef.current) return;
    if (!videoStream) return;
    if (!audioStream) return;
    if (!sessionStream) return;
    sessionRecordingInitRef.current = true;
    startSessionVideoRecording();
  }, [
    videoStream,
    audioStream,
    sessionStream,
    isSessionRecording,
    startSessionVideoRecording,
  ]);

  useEffect(() => {
    return () => {
      if (sessionRecordingInitRef.current) {
        void stopSessionVideoRecording();
      }
    };
  }, [stopSessionVideoRecording]);

  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, [stopMediaStream]);

  const voiceStartRafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (voiceStartRafRef.current != null) {
        cancelAnimationFrame(voiceStartRafRef.current);
        voiceStartRafRef.current = null;
      }
    };
  }, []);

  const enterVoiceMode = useCallback(() => {
    setInputMode("voice");

    if (aiState !== "idle") return;
    if (!audioStream) return;
    if (isVoiceRecording) return;
    if (voiceStartRafRef.current != null) return;

    voiceStartRafRef.current = requestAnimationFrame(() => {
      voiceStartRafRef.current = null;
      startAudioRecording();
    });
  }, [aiState, audioStream, isVoiceRecording, startAudioRecording]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (initialChats.length > 0) {
      return;
    }

    (async () => {
      try {
        setAiState("thinking");
        const next = await generateQuestion({ interviewId });
        if (!next?.question) {
          setAiState("idle");
          return;
        }

        setQuestion(next.question);
        appendMessage({
          id: `q-${next.questionId}`,
          sender: "면접관",
          role: "ai",
          content: next.question,
          timestamp: normalizeTimestamp(next.createdAt),
        });
      } catch (error) {
        console.error(error);
        reportErrorToChat("질문 생성 실패", error);
      } finally {
        setAiState("idle");
      }
    })();
  }, [
    appendMessage,
    initialChats.length,
    interviewId,
    normalizeTimestamp,
    reportErrorToChat,
  ]);

  const exitSession = useCallback(async () => {
    try {
      await stopSessionVideoRecording();
    } catch {
      // ignore
    } finally {
      stopMediaStream();
      router.push(`/interview/${interviewId}/result`);
    }
  }, [interviewId, router, stopMediaStream, stopSessionVideoRecording]);

  const handleSendText = useCallback(async () => {
    const answer = textInput.trim();
    if (!answer || aiState !== "idle") return;

    setTextInput("");
    appendMessage({
      sender: "나",
      role: "user",
      content: answer,
      timestamp: new Date().toISOString(),
    });

    setAiState("thinking");
    try {
      await sendAnswer({ interviewId, answer });
      await new Promise((r) => setTimeout(r, 150));

      const next = await generateQuestion({ interviewId });
      if (next?.question) {
        setQuestion(next.question);
        appendMessage({
          id: `q-${next.questionId}`,
          sender: "면접관",
          role: "ai",
          content: next.question,
          timestamp: normalizeTimestamp(next.createdAt),
        });
      }

      if (next?.isLast) {
        await exitSession();
      }
    } catch (error) {
      console.error(error);
      reportErrorToChat("답변 전송/질문 생성 실패", error);
    } finally {
      setAiState("idle");
    }
  }, [
    aiState,
    appendMessage,
    exitSession,
    interviewId,
    normalizeTimestamp,
    reportErrorToChat,
    textInput,
  ]);

  const handleSendVoice = useCallback(async () => {
    if (aiState !== "idle") return;
    if (!audioStream) return;

    if (!isVoiceRecording) {
      if (voiceStartRafRef.current != null) return;
      startAudioRecording();
      return;
    }

    setAiState("thinking");
    try {
      const blob = await stopAudioRecording();
      if (!blob || blob.size === 0) {
        console.warn("녹음된 오디오가 비어있습니다.");
        return;
      }

      const pendingId = `voice-pending-${crypto.randomUUID()}`;
      appendMessage({
        id: pendingId,
        sender: "나",
        role: "user",
        content: "(음성 전송 중…)",
        timestamp: new Date().toISOString(),
      });

      const stt = await speakAnswer({ interviewId, audio: blob });
      const answerText = stt?.answer?.trim();

      if (answerText) {
        updateMessage(pendingId, {
          content: answerText,
          timestamp: new Date().toISOString(),
        });
      } else {
        updateMessage(pendingId, {
          content: "(음성 인식 결과가 비어있습니다)",
          timestamp: new Date().toISOString(),
        });
      }

      const next = await generateQuestion({ interviewId });
      if (next?.question) {
        setQuestion(next.question);
        appendMessage({
          id: `q-${next.questionId}`,
          sender: "면접관",
          role: "ai",
          content: next.question,
          timestamp: normalizeTimestamp(next.createdAt),
        });
      }

      if (next?.isLast) {
        await exitSession();
        return;
      }

      setInputMode("text");
    } catch (error) {
      console.error(error);
      reportErrorToChat("음성 전송/질문 생성 실패", error);
    } finally {
      setAiState("idle");
    }
  }, [
    aiState,
    audioStream,
    appendMessage,
    exitSession,
    interviewId,
    isVoiceRecording,
    normalizeTimestamp,
    reportErrorToChat,
    startAudioRecording,
    stopAudioRecording,
    updateMessage,
  ]);

  const handleCancelVoice = useCallback(async () => {
    try {
      if (voiceStartRafRef.current != null) {
        cancelAnimationFrame(voiceStartRafRef.current);
        voiceStartRafRef.current = null;
      }
      if (isVoiceRecording) {
        await stopAudioRecording();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setInputMode("text");
    }
  }, [isVoiceRecording, stopAudioRecording]);

  const toggleHistoryOpen = useCallback(() => {
    setIsHistoryOpen((open) => !open);
  }, []);

  const closeHistory = useCallback(() => {
    setIsHistoryOpen(false);
  }, []);

  const toggleMediaPermissionPanelOpen = useCallback(() => {
    setIsMediaPermissionPanelOpen((open) => !open);
  }, []);

  const closeMediaPermissionPanel = useCallback(() => {
    setIsMediaPermissionPanelOpen(false);
  }, []);

  return {
    state: {
      question,
      chats,
      aiState,
      inputMode,
      textInput,
      isHistoryOpen,
      isMediaPermissionPanelOpen,
    },
    media: {
      audioStream,
      isVoiceRecording,
      videoStream,
      hasVideoPermission,
      hasAudioPermission,
      isVideoEnabled,
      isAudioEnabled,
    },
    actions: {
      setTextInput,
      setInputMode,
      enterVoiceMode,
      onSendText: handleSendText,
      onSendVoice: handleSendVoice,
      onCancelVoice: handleCancelVoice,
      toggleHistoryOpen,
      closeHistory,
      toggleMediaPermissionPanelOpen,
      closeMediaPermissionPanel,
      onExit: exitSession,
    },
  };
};

export type InterviewController = ReturnType<typeof useInterviewController>;
