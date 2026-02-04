"use client";

import { useEffect, useRef } from "react";
import { Ghost } from "lucide-react";

import { cn } from "@/app/lib/utils";

interface IVideoTileProps {
  isSpeaker?: boolean;
  label?: string;
  isOn?: boolean;
  stream?: MediaStream | null;
}

export default function VideoTile({
  isSpeaker = false,
  label,
  isOn = true,
  stream = null,
}: IVideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-black",
        isSpeaker ? "shadow-lg ring-2 ring-primary" : "",
      )}
    >
      <video
        autoPlay
        playsInline
        muted
        className={cn(
          "aspect-video w-full bg-primary/20 object-cover",
          !isOn && "hidden",
        )}
        ref={videoRef}
      ></video>

      {/* 카메라 꺼진 상태 표시 */}
      {!isOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <Ghost className="mx-auto mb-2 size-12 text-gray-500" />
            <p className="text-sm text-gray-400">{label} is off</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 rounded-md bg-primary/20 px-2 py-1 text-xs text-white">
        <div className="flex items-center gap-1.5">
          <Ghost className="size-3" />
          <p>{label || (isSpeaker ? "Speaker" : "Anon")}</p>
        </div>
      </div>
    </div>
  );
}
