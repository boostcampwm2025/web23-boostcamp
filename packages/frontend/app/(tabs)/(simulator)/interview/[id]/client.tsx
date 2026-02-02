"use client";

import { useEffect, useState } from "react";
import { Cpu, MessageSquareText, Snowflake } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { IHistoryItem } from "./actions";

import { useAudioRecording } from "@/app/hooks/recording/use-audio-recording";
import { useMediaPermissions } from "@/app/hooks/use-media-permissions";
import ChatHistory, { type IChatMessage } from "@/app/components/chat-history";

import VoiceInput from "./components/voice-input";
import ChatInput from "./components/chat-input";
import DismissibleDraggablePanel from "./components/dismissible-draggable-panel";
import VideoStatus from "./components/video-status";

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
  // TODO: 실제 인터뷰 로직 연결 시 사용 예정
  void interviewId;

  const chatMessages: IChatMessage[] = history.flatMap((item, index) => {
    const result: IChatMessage[] = [
      {
        id: `history-${index}-q`,
        sender: "면접관",
        role: "ai",
        content: item.question.content,
        timestamp: item.question.createdAt,
      },
    ];

    if (item.answer?.content) {
      result.push({
        id: `history-${index}-a`,
        sender: "나",
        role: "user",
        content: item.answer.content,
        timestamp: item.answer.createdAt,
      });
    }

    return result;
  });
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
  const [inputMode, setInputMode] = useState<"text" | "voice">("voice");
  const [aiState, setAiState] = useState<"idle" | "thinking" | "speaking">(
    "idle",
  );
  void setAiState;

  const [question, setQuestion] = useState(
    "말씀하신 경험들 중에서 가장 도전적이었던 경험에 대해 느껴졌던 순간은 언제였나요?",
  );

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMediaPermissionPanelOpen, setIsMediaPermissionPanelOpen] =
    useState(false);
  // 미디어 권한 및 스트림 관리
  const { audioStream, requestAudio } = useMediaPermissions();

  // 오디오 녹음 관리
  useAudioRecording();

  // 초기 오디오 권한 요청
  useEffect(() => {
    requestAudio();
  }, [requestAudio]);

  const changeToTextMode = (mode: "text" | "voice") => {
    setInputMode(mode);
  };

  const closeHistory = () => {
    setIsHistoryOpen(false);
  };

  const closeMediaPermissionPanel = () => {
    setIsMediaPermissionPanelOpen(false);
  };

  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden">
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
                />
              </motion.div>
            </div>
          )}

          {aiState === "idle" && inputMode === "voice" && (
            <div className="mb-4 flex justify-center">
              <motion.div layoutId="ai-input-slot" className="">
                <VoiceInput
                  changeToTextMode={changeToTextMode}
                  audioStream={audioStream}
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
            className="absolute top-6 right-6 h-96 w-105 max-w-md overflow-hidden rounded-lg bg-white/50 shadow-lg backdrop-blur-2xl"
            minVisibleRatio={0.3}
            layoutId="history-window"
          >
            <div className="h-full overflow-y-auto p-4">
              <ChatHistory chatMessages={chatMessages} />
            </div>
          </DismissibleDraggablePanel>
        ) : (
          <motion.div
            className="absolute top-6 left-6 cursor-pointer rounded-full bg-white/50 p-3 shadow-lg backdrop-blur-2xl transition-colors hover:bg-white"
            onClick={() => setIsHistoryOpen((open) => !open)}
            layoutId="history-window"
          >
            <MessageSquareText className="size-6 text-primary" />
          </motion.div>
        )}

        {isMediaPermissionPanelOpen ? (
          <DismissibleDraggablePanel
            className="absolute top-22 left-6 max-w-md cursor-pointer rounded-xl bg-white/50 p-3 shadow-lg backdrop-blur-2xl transition-colors hover:bg-white"
            onDismiss={closeMediaPermissionPanel}
            layoutId="media-permission-panel"
          >
            <VideoStatus />
          </DismissibleDraggablePanel>
        ) : (
          <motion.div
            className="absolute top-22 left-6 cursor-pointer rounded-full bg-white/50 p-3 shadow-lg backdrop-blur-2xl transition-colors hover:bg-white"
            onClick={() => setIsMediaPermissionPanelOpen((open) => !open)}
            layoutId="media-permission-panel"
          >
            <MessageSquareText className="size-6 text-primary" />
          </motion.div>
        )}

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
        <button
          onClick={() => {
            setQuestion(
              "새로운 질문으로 변경되었습니다. 이전 경험들 중에서 가장 자랑스러웠던 순간에 대해 말씀해 주세요.",
            );
          }}
        >
          test change question
        </button>
      </div>
    </div>
  );
}
