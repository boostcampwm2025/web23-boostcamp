"use client";

import { MessageSquare, X } from "lucide-react";

import { useInterviewControls } from "@/app/hooks/use-interview-controls";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

import { InterviewControls } from "../components/interview-controls";
import VideoGrid from "../components/video-grid";
import Chat from "../../components/chat";

import { IHistoryItem } from "./actions";

export default function InterviewClient({
  history,
  interviewId,
}: {
  history: IHistoryItem[];
  interviewId: string;
}) {
  const {
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
  } = useInterviewControls(interviewId, history);

  return (
    <div className="mt-5 flex h-full max-w-630 flex-col justify-center gap-5 py-2 xl:flex-row">
      <div className="relative w-full max-w-7xl xl:flex-2">
        <VideoGrid stream={stream} />
        <InterviewControls
          onToggleChat={() => toggleChat()}
          onExit={() => handleExit(`/interview/${interviewId}/result`)}
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          onToggleVideo={handleCamToggle}
          onToggleAudio={handleMicToggle}
        />
      </div>
      {isChatOpen && (
        <div className="flex-1">
          <Card className="flex h-full flex-col">
            <CardHeader className="flex items-center justify-between border-b pb-2">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="size-4" />
                <h3 className="text-sm font-semibold">채팅 기록</h3>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 cursor-pointer"
                onClick={() => toggleChat()}
              >
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-y-auto">
              <Chat
                initalChats={chats}
                setChats={setChats}
                stream={stream}
                interviewId={interviewId}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
