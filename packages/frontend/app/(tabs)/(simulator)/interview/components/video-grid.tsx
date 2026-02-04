"use client";

import clsx from "clsx";

import VideoTile from "./video-tile";

interface IVideoGridProps {
  className?: string;
  stream?: MediaStream | null;
}

export default function VideoGrid({ className, stream }: IVideoGridProps) {
  return (
    <div
      className={clsx(
        "grid size-full auto-rows-auto grid-cols-3 gap-1.5",
        className,
      )}
    >
      <VideoTile label="You" isOn={true} stream={stream} />
      <VideoTile label="Interviewer 1" />
      <VideoTile label="Interviewer 2" />
      <div className="col-span-3">
        <VideoTile isSpeaker label="Speaker"></VideoTile>
      </div>
    </div>
  );
}
