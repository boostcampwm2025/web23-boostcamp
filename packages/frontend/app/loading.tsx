import { Waypoints } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-dvh w-full animate-pulse items-center justify-center gap-2">
      <Waypoints className="size-8 text-primary" />

      <span className="text-4xl font-bold text-primary uppercase">Synapse</span>
    </div>
  );
}
