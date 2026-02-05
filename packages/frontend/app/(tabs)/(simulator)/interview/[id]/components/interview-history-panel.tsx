import { History } from "lucide-react";
import { motion } from "motion/react";

import ChatHistory, { type IChatMessage } from "@/app/components/chat-history";

import DismissibleDraggablePanel from "./dismissible-draggable-panel";

interface IInterviewHistoryPanel {
  isOpen: boolean;
  chats: IChatMessage[];
  onToggle: () => void;
  onClose: () => void;
}

export const InterviewHistoryPanel = ({
  isOpen,
  chats,
  onToggle,
  onClose,
}: IInterviewHistoryPanel) => {
  if (isOpen) {
    return (
      <DismissibleDraggablePanel
        onDismiss={onClose}
        className="absolute top-6 left-6 h-96 w-full max-w-sm overflow-hidden rounded-xl bg-white/50 shadow-lg backdrop-blur-2xl"
        minVisibleRatio={0.3}
        layoutId="history-window"
        title="timeline"
        icon={<History className="size-4" />}
      >
        <ChatHistory chatMessages={chats} />
      </DismissibleDraggablePanel>
    );
  }

  return (
    <motion.div
      className="absolute top-6 left-6 cursor-pointer rounded-full bg-white/50 p-3 shadow-lg backdrop-blur-2xl transition-colors hover:bg-white"
      onClick={onToggle}
      layoutId="history-window"
    >
      <History className="size-6 text-primary" />
    </motion.div>
  );
};
