"use client";

import { useMediaPermissions } from "@/app/hooks/use-media-permissions";
import { Aperture, CircleCheck } from "lucide-react";
import { useEffect, useRef } from "react";

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

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (requestAudio && requestVideo && !videoStream && !audioStream) {
      requestVideo();
      requestAudio();
    }
  }, [requestAudio, requestVideo, videoStream, audioStream]);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute top-5 left-5 flex items-center gap-2 rounded-2xl border bg-white/30 px-3 py-1 backdrop-blur-md">
          <Aperture className="size-3" />
          <span className="text-sm font-semibold uppercase">
            preview activate
          </span>
        </div>
        <div className="video flex justify-center bg-primary/20">
          <video ref={videoRef} autoPlay muted />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex justify-between rounded-xl border p-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase">
            camera
          </p>
          {!hasVideoPermission ? (
            <span className="text-sm font-semibold text-red-500">off</span>
          ) : isVideoEnabled ? (
            <CircleCheck className="size-5 text-primary" />
          ) : (
            <span className="text-sm font-semibold text-red-500">off</span>
          )}
        </div>
        <div className="flex justify-between rounded-xl border p-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase">
            mic
          </p>
          {!hasAudioPermission ? (
            <span className="text-sm font-semibold text-red-500">off</span>
          ) : isAudioEnabled ? (
            <CircleCheck className="size-5 text-primary" />
          ) : (
            <span className="text-sm font-semibold text-red-500">off</span>
          )}
        </div>
      </div>
    </div>
  );
}
