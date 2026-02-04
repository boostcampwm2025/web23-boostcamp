import { Camera } from "lucide-react";
import { motion } from "motion/react";

import { VideoStatusPanel } from "./video-status";
import DismissibleDraggablePanel from "./dismissible-draggable-panel";

interface IInterviewMediaPermissionPanel {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  videoStream: MediaStream | null;
  hasVideoPermission: boolean;
  isVideoEnabled: boolean;
  hasAudioPermission: boolean;
  isAudioEnabled: boolean;
}

export const InterviewMediaPermissionPanel = ({
  isOpen,
  onToggle,
  onClose,
  videoStream,
  hasVideoPermission,
  isVideoEnabled,
  hasAudioPermission,
  isAudioEnabled,
}: IInterviewMediaPermissionPanel) => {
  if (isOpen) {
    return (
      <DismissibleDraggablePanel
        className="absolute top-22 left-6 max-w-xs cursor-pointer rounded-xl bg-white/50 p-3 shadow-lg backdrop-blur-2xl transition-colors hover:bg-white"
        layoutId="media-permission-panel"
        showHeader={false}
        onDismiss={onClose}
      >
        <VideoStatusPanel
          videoStream={videoStream}
          hasVideoPermission={hasVideoPermission}
          isVideoEnabled={isVideoEnabled}
          hasAudioPermission={hasAudioPermission}
          isAudioEnabled={isAudioEnabled}
        />
      </DismissibleDraggablePanel>
    );
  }

  return (
    <motion.div
      className="absolute top-22 left-6 cursor-pointer rounded-full bg-white/50 p-3 shadow-lg backdrop-blur-2xl transition-colors hover:bg-white"
      onClick={onToggle}
      layoutId="media-permission-panel"
    >
      <Camera className="size-6 text-primary" />
    </motion.div>
  );
};
