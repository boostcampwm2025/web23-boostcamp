import { cn } from "@/app/lib/utils";
import { Ghost } from "lucide-react";

export default function VideoTile({
  isSpeaker = false,
}: {
  isSpeaker?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-lg bg-black",
        isSpeaker ? "shadow-lg ring-2 ring-primary" : "",
      )}
    >
      <video src=".." className="size-full object-cover"></video>
      <div className="absolute bottom-2 left-2 rounded-md bg-primary/20 px-2 py-1 text-xs text-white">
        {isSpeaker ? (
          <div className="flex items-center gap-1.5">
            <Ghost className="size-3" />
            <p>Speaker</p>
          </div>
        ) : (
          "User Name"
        )}
      </div>
    </div>
  );
}
