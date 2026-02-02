"use client";

import { Cpu, Snowflake } from "lucide-react";

import { IHistoryItem } from "./actions";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import ChatInput from "./components/chat-input";
import { useAudioRecording } from "@/app/hooks/recording/use-audio-recording";
import { useMediaPermissions } from "@/app/hooks/use-media-permissions";
import VoiceInput from "./components/voice-input";

export default function InterviewClient({
  history,
  interviewId,
}: {
  history: IHistoryItem[];
  interviewId: string;
}) {
  // TODO: 실제 인터뷰 로직 연결 시 사용 예정
  void history;
  void interviewId;
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

  return (
    <div className="flex size-full items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-fit rounded-3xl bg-primary p-5 shadow-2xl">
          <Cpu className="size-8 text-white" />
        </div>
        <div className="max-w-lg text-center text-3xl font-extrabold text-pretty">
          말씀하신 경험들 중에서 가장 도전적이었던 경험에 대해 느껴졌던 순간은
          언제였나요?
        </div>

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
      </div>
    </div>
  );
}
