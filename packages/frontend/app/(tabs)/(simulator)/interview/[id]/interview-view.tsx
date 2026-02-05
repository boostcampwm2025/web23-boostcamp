import type { InterviewController } from "./use-interview-controller";
import { InterviewExitButton } from "./components/interview-exit-button";
import { InterviewHistoryPanel } from "./components/interview-history-panel";
import { InterviewInputSlot } from "./components/interview-input-slot";
import { InterviewMediaPermissionPanel } from "./components/interview-media-permission-panel";
import { InterviewQuestion } from "./components/interview-question";

interface IInterviewView {
  controller: InterviewController;
}

export const InterviewView = ({ controller }: IInterviewView) => {
  const { state, media, actions } = controller;

  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden px-3.5">
      <div className="flex flex-col items-center gap-6">
        <InterviewQuestion question={state.question} />

        <InterviewInputSlot
          aiState={state.aiState}
          inputMode={state.inputMode}
          textInput={state.textInput}
          setTextInput={actions.setTextInput}
          setInputMode={actions.setInputMode}
          enterVoiceMode={actions.enterVoiceMode}
          onSendText={actions.onSendText}
          onSendVoice={actions.onSendVoice}
          onCancelVoice={actions.onCancelVoice}
          audioStream={media.audioStream}
          isVoiceRecording={media.isVoiceRecording}
        />

        <InterviewHistoryPanel
          isOpen={state.isHistoryOpen}
          chats={state.chats}
          onToggle={actions.toggleHistoryOpen}
          onClose={actions.closeHistory}
        />

        <InterviewMediaPermissionPanel
          isOpen={state.isMediaPermissionPanelOpen}
          onToggle={actions.toggleMediaPermissionPanelOpen}
          onClose={actions.closeMediaPermissionPanel}
          videoStream={media.videoStream}
          hasVideoPermission={media.hasVideoPermission}
          isVideoEnabled={media.isVideoEnabled}
          hasAudioPermission={media.hasAudioPermission}
          isAudioEnabled={media.isAudioEnabled}
        />

        <InterviewExitButton onExit={actions.onExit} />
      </div>
    </div>
  );
};
