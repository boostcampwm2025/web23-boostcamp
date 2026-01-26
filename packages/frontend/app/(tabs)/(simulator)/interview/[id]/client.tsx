"use client";

import { useInterviewControls } from "@/app/hooks/use-interview-controls";
import VideoGrid from "../components/video-grid";
import { IHistoryItem } from "./actions";

export default function InterviewClient({
  history,
}: {
  history: IHistoryItem[];
}) {
  const { handleExit, stream } = useInterviewControls("1", history);
  return (
    <div className="mt-5 flex h-full max-w-630 flex-col justify-center gap-5 py-2 xl:flex-row">
      <div className="relative w-full max-w-7xl xl:flex-2">
        <VideoGrid stream={stream} />
        {/*   <InterviewControls
          onToggleChat={interviewControls.toggleChat}
          onExit={interviewControls.handleExit}
          isVideoEnabled={interviewControls.isVideoEnabled}
          isAudioEnabled={interviewControls.isAudioEnabled}
          onToggleVideo={interviewControls.handleCamToggle}
          onToggleAudio={interviewControls.handleMicToggle}
        /> */}
      </div>
      {/*  {interviewControls.isChatOpen && (
        <div className="flex-1">
          <ChatPanel
            {...interviewControls}
            initialChats={interviewControls.chats}
            setChats={interviewControls.setChats}
            onClose={() => interviewControls.toggleChat(false)}
            stream={interviewControls.mediaStream}
          />
        </div>
      )} */}
      <button onClick={() => handleExit("/interview/1/result")}>button</button>
    </div>
  );
}
