import { Lightbulb } from "lucide-react";

export default function Tip() {
  return (
    <div className="flex items-center gap-5">
      <div className="rounded-lg bg-primary/20 p-3">
        <Lightbulb className="text-primary" />
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        <span className="text-xs font-semibold tracking-wide text-primary uppercase">
          Pro Performance Tip
        </span>
        <span className="text-xs">{`"When evaluating PM candidates, look for the 'STAR' method (Situation, Task, Action, Result) and specific metrics that demonstrate the impact of their decisions."`}</span>
      </div>
    </div>
  );
}
