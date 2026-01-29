import { Sparkles } from "lucide-react";

export default function StatusBadge({ text }: { text: string }) {
  return (
    <div className="flex w-fit items-center gap-2 rounded-sm bg-primary/20 px-2 py-1">
      <Sparkles className="size-3 text-primary" />
      <h5 className="text-xs font-semibold text-primary">{text}</h5>
    </div>
  );
}
