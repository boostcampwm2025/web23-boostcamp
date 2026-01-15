"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import VideoTile from "./video_tile";

interface VideoGridProps {
  className?: string;
  isCamOn: boolean;
  stream?: MediaStream | null;
}

export default function VideoGrid({
  className,
  isCamOn,
  stream,
}: VideoGridProps) {
  const userVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (userVideoRef.current && stream) {
      userVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={clsx(
        "grid size-full auto-rows-auto grid-cols-3 gap-1.5",
        className,
      )}
    >
      <VideoTile label="You" ref={userVideoRef} isOn={isCamOn} />
      <VideoTile label="Interviewer 1" />
      <VideoTile label="Interviewer 2" />
      <div className="col-span-3">
        <VideoTile isSpeaker label="Speaker" />
      </div>
    </div>
  );
}
