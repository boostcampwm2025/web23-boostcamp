"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Cpu, History, Snowflake, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
  generateQuestion,
  type IHistoryItem,
  sendAnswer,
  speakAnswer,
} from "./actions";

import { useAudioRecording } from "@/app/hooks/recording/use-audio-recording";
import { useMediaPermissions } from "@/app/hooks/use-media-permissions";
import useMediaRecorder from "@/app/hooks/use-media-recorder";
import ChatHistory, { type IChatMessage } from "@/app/components/chat-history";

import VoiceInput from "./components/voice-input";
import ChatInput from "./components/chat-input";
import DismissibleDraggablePanel from "./components/dismissible-draggable-panel";
import { VideoStatusPanel } from "./components/video-status";
import { Button } from "@/app/components/ui/button";

const questionVariants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
} as const;

export default function InterviewClient({
  history,
  interviewId,
}: {
  history: IHistoryItem[];
  interviewId: string;
}) {
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
  /*  const {
    handleExit,
    stream,
    isChatOpen,
    chats,
    toggleChat,
    setChats,
    isVideoEnabled,
    isAudioEnabled,
    handleCamToggle,
    handleMicToggle,
  } = useInterviewControls(interviewId, history); */
  const [textInput, setTextInput] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [aiState, setAiState] = useState<"idle" | "thinking" | "speaking">(
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
  // 미디어 권한 및 스트림 관리
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

  // 오디오 녹음 관리
  useAudioRecording();

  // 초기 카메라/마이크 권한 요청
  useEffect(() => {
    requestPermissions({ video: true, audio: true });
  }, [requestPermissions]);

  // 인터뷰 시작 시: interviewId 기준으로 비디오 녹화 자동 시작
  const sessionRecordingInitRef = useRef(false);
  useEffect(() => {
    if (sessionRecordingInitRef.current) return;
    if (!videoStream) return;
    if (!sessionStream) return;
    if (isSessionRecording) return;

    sessionRecordingInitRef.current = true;
    startSessionVideoRecording();

    return () => {
      void stopSessionVideoRecording();
    };
  }, [
    isSessionRecording,
    sessionStream,
    startSessionVideoRecording,
    stopSessionVideoRecording,
    videoStream,
  ]);

  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, [stopMediaStream]);

  // 보이스 모드 진입 시: 화면 전환(애니메이션/레이아웃) 이후에 녹음을 시작해
  // 클릭 시 버벅임과 "더블 start" 가능성을 줄인다.
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

  const normalizeTimestamp = useCallback((value: unknown) => {
    if (typeof value === "string") return value;
    if (value instanceof Date) return value.toISOString();
    try {
      return new Date(value as never).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }, []);

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

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // 히스토리가 없으면 첫 질문 생성
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
        try {
          await stopSessionVideoRecording();
        } catch {
          // ignore
        }
        stopMediaStream();
        router.push(`/interview/${interviewId}/result`);
        return;
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
    interviewId,
    normalizeTimestamp,
    reportErrorToChat,
    router,
    stopMediaStream,
    stopSessionVideoRecording,
    textInput,
  ]);

  const handleSendVoice = useCallback(async () => {
    if (aiState !== "idle") return;
    if (!audioStream) return;

    // 1) 첫 클릭: 녹음 시작
    if (!isVoiceRecording) {
      if (voiceStartRafRef.current != null) return;
      startAudioRecording();
      return;
    }

    // 2) 두번째 클릭: 녹음 종료 -> 서버 전송
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
        try {
          await stopSessionVideoRecording();
        } catch {
          // ignore
        }
        stopMediaStream();
        router.push(`/interview/${interviewId}/result`);
        return;
      }

      // 전송 완료 후에는 기본 입력을 텍스트로 돌려 UX를 안정화
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
    interviewId,
    isVoiceRecording,
    appendMessage,
    normalizeTimestamp,
    reportErrorToChat,
    router,
    startAudioRecording,
    stopAudioRecording,
    stopMediaStream,
    stopSessionVideoRecording,
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

  const closeHistory = () => {
    setIsHistoryOpen(false);
  };

  const closeMediaPermissionPanel = () => {
    setIsMediaPermissionPanelOpen(false);
  };

  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden px-3.5">
      <div className="flex flex-col items-center gap-6">
        <div className="w-fit rounded-3xl bg-primary p-5 shadow-2xl">
          <Cpu className="size-8 text-white" />
        </div>
        <motion.div
          layout
          className="max-w-lg text-center text-3xl font-extrabold text-pretty"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={question}
              initial="enter"
              animate="center"
              exit="exit"
              variants={questionVariants}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {question}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div className="absolute bottom-26 w-full max-w-md">
          {aiState === "idle" && inputMode === "text" && (
            <div className="mb-4 flex justify-center">
              <motion.div layoutId="ai-input-slot" className="w-full">
                <ChatInput
                  setTextInput={setTextInput}
                  textInput={textInput}
                  setInputMode={setInputMode}
                  onSend={handleSendText}
                />
              </motion.div>
            </div>
          )}

          {aiState === "idle" && inputMode === "voice" && (
            <div className="mb-4 flex justify-center">
              <motion.div layoutId="ai-input-slot" className="">
                <VoiceInput
                  onCancel={handleCancelVoice}
                  audioStream={audioStream}
                  isRecording={isVoiceRecording}
                  onSend={handleSendVoice}
                />
              </motion.div>
            </div>
          )}

          {aiState === "thinking" && (
            <div className="flex justify-center">
              <motion.div layoutId="ai-input-slot">
                <span>
                  면접관이 생각 중입니다
                  <Snowflake className="ml-2 inline-block size-5 animate-spin text-primary" />
                </span>
              </motion.div>
            </div>
          )}
        </motion.div>

        {isHistoryOpen ? (
          <DismissibleDraggablePanel
            onDismiss={closeHistory}
            className="absolute top-6 left-6 h-96 max-w-sm overflow-hidden rounded-lg bg-white/50 shadow-lg backdrop-blur-2xl"
            minVisibleRatio={0.3}
            layoutId="history-window"
            title="timeline"
            icon={<History className="size-4" />}
          >
            <ChatHistory chatMessages={chats} />
          </DismissibleDraggablePanel>
        ) : (
          <motion.div
            className="absolute top-6 left-6 cursor-pointer rounded-full bg-white/50 p-3 shadow-lg backdrop-blur-2xl transition-colors hover:bg-white"
            onClick={() => setIsHistoryOpen((open) => !open)}
            layoutId="history-window"
          >
            <History className="size-6 text-primary" />
          </motion.div>
        )}

        {isMediaPermissionPanelOpen ? (
          <DismissibleDraggablePanel
            className="absolute top-22 left-6 max-w-xs cursor-pointer rounded-xl bg-white/50 p-3 shadow-lg backdrop-blur-2xl transition-colors hover:bg-white"
            layoutId="media-permission-panel"
            showHeader={false}
            onDismiss={closeMediaPermissionPanel}
          >
            <VideoStatusPanel
              videoStream={videoStream}
              hasVideoPermission={hasVideoPermission}
              isVideoEnabled={isVideoEnabled}
              hasAudioPermission={hasAudioPermission}
              isAudioEnabled={isAudioEnabled}
            />
          </DismissibleDraggablePanel>
        ) : (
          <motion.div
            className="absolute top-22 left-6 cursor-pointer rounded-full bg-white/50 p-3 shadow-lg backdrop-blur-2xl transition-colors hover:bg-white"
            onClick={() => setIsMediaPermissionPanelOpen((open) => !open)}
            layoutId="media-permission-panel"
          >
            <Camera className="size-6 text-primary" />
          </motion.div>
        )}

        <Button
          className="absolute top-6 right-6 cursor-pointer rounded-full px-5 shadow"
          onClick={async () => {
            try {
              await stopSessionVideoRecording();
            } catch {
              // ignore
            } finally {
              stopMediaStream();
              router.push(`/interview/${interviewId}/result`);
            }
          }}
        >
          <span className="font-mono text-xs uppercase">Exit session</span>
          <X className="text-muted" />
        </Button>

        {/* <button
          onClick={() => {
            setAiState("idle");
            setInputMode("text");
          }}
        >
          test state change ( idle )
        </button>
        <button
          onClick={() => {
            setAiState("thinking");
          }}
        >
          test state change ( thinking )
        </button>
        <button
          onClick={() => {
            setAiState("speaking");
          }}
        >
          test state change ( speaking )
        </button> */}
        {/* <button
          onClick={() => {
            setQuestion(
              "새로운 질문으로 변경되었습니다. 이전 경험들 중에서 가장 자랑스러웠던 순간에 대해 말씀해 주세요.",
            );
          }}
        >
          test change question
        </button> */}
      </div>
    </div>
  );
}
