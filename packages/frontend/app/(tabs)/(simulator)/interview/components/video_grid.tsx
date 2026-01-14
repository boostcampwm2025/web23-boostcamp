import clsx from "clsx";
import VideoTile from "./video_tile";

export default function VideoGrid({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "grid size-full auto-rows-auto grid-cols-3 gap-1.5",
        className,
      )}
    >
      <VideoTile />
      <VideoTile />
      <VideoTile />
      <div className="col-span-3">
        <VideoTile isSpeaker />
      </div>
    </div>
  );
}
