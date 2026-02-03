"use client";

import { useEffect, useRef } from "react";
import { Aperture, CircleAlert, CircleCheck } from "lucide-react";

import { useMediaPermissions } from "@/app/hooks/use-media-permissions";

export function VideoStatusPanel({
  videoStream,
  hasVideoPermission,
  isVideoEnabled,
  hasAudioPermission,
  isAudioEnabled,
}: {
  videoStream: MediaStream | null;
  hasVideoPermission: boolean;
  isVideoEnabled: boolean;
  hasAudioPermission: boolean;
  isAudioEnabled: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-3xl bg-primary/20">
        <div className="absolute top-5 left-5 flex items-center gap-2 rounded-2xl border bg-white/30 px-3 py-1 backdrop-blur-md">
          <Aperture className="size-3" />
          <span className="text-sm font-semibold uppercase">
            preview activate
          </span>
        </div>
        <video ref={videoRef} autoPlay muted playsInline />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex justify-between rounded-xl border p-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase">
            camera
          </p>
          {!hasVideoPermission ? (
            <CircleAlert className="size-5 text-red-500" />
          ) : isVideoEnabled ? (
            <CircleCheck className="size-5 text-primary" />
          ) : (
            <CircleAlert className="size-5 text-red-500" />
          )}
        </div>
        <div className="flex justify-between rounded-xl border p-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase">
            mic
          </p>
          {!hasAudioPermission ? (
            <CircleAlert className="size-5 text-red-500" />
          ) : isAudioEnabled ? (
            <CircleCheck className="size-5 text-primary" />
          ) : (
            <CircleAlert className="size-5 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideoStatus() {
  const {
    requestVideo,
    requestAudio,
    videoStream,
    audioStream,
    hasAudioPermission,
    isAudioEnabled,
    hasVideoPermission,
    isVideoEnabled,
  } = useMediaPermissions();

  useEffect(() => {
    if (requestAudio && requestVideo && !videoStream && !audioStream) {
      requestVideo();
      requestAudio();
    }
  }, [requestAudio, requestVideo, videoStream, audioStream]);

  return (
    <VideoStatusPanel
      videoStream={videoStream}
      hasVideoPermission={hasVideoPermission}
      isVideoEnabled={isVideoEnabled}
      hasAudioPermission={hasAudioPermission}
      isAudioEnabled={isAudioEnabled}
    />
  );
}
