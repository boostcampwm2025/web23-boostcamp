import { Snowflake } from "lucide-react";
import { motion } from "motion/react";

import ChatInput from "./chat-input";
import VoiceInput from "./voice-input";
import type { AiState, InputMode } from "../use-interview-controller";

interface IInterviewInputSlot {
  aiState: AiState;
  inputMode: InputMode;
  textInput: string;
  setTextInput: (value: string) => void;
  setInputMode: (value: InputMode) => void;
  enterVoiceMode: () => void;
  onSendText: () => void;
  onSendVoice: () => void;
  onCancelVoice: () => void;
  audioStream: MediaStream | null;
  isVoiceRecording: boolean;
}

export const InterviewInputSlot = ({
  aiState,
  inputMode,
  textInput,
  setTextInput,
  setInputMode,
  enterVoiceMode,
  onSendText,
  onSendVoice,
  onCancelVoice,
  audioStream,
  isVoiceRecording,
}: IInterviewInputSlot) => {
  return (
    <motion.div className="absolute bottom-26 w-full max-w-md">
      {aiState === "idle" && inputMode === "text" && (
        <div className="mb-4 flex justify-center">
          <motion.div layoutId="ai-input-slot" className="w-full">
            <ChatInput
              setTextInput={setTextInput}
              textInput={textInput}
              setInputMode={setInputMode}
              onEnterVoice={enterVoiceMode}
              onSend={onSendText}
            />
          </motion.div>
        </div>
      )}

      {aiState === "idle" && inputMode === "voice" && (
        <div className="mb-4 flex justify-center">
          <motion.div layoutId="ai-input-slot" className="">
            <VoiceInput
              onCancel={onCancelVoice}
              audioStream={audioStream}
              isRecording={isVoiceRecording}
              onSend={onSendVoice}
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
  );
};
