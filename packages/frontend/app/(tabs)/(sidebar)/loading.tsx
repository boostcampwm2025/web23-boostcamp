import { Waypoints } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex w-full flex-1 animate-pulse items-center justify-center gap-2 py-24">
      <Waypoints className="size-8 text-primary" />
      <span className="text-4xl font-bold text-primary uppercase">Synapse</span>
    </div>
  );
}
