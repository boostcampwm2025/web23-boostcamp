import { X } from "lucide-react";

import { Button } from "@/app/components/ui/button";

interface IInterviewExitButton {
  onExit: () => void;
}

export const InterviewExitButton = ({ onExit }: IInterviewExitButton) => {
  return (
    <Button
      className="absolute top-6 right-6 cursor-pointer rounded-full px-5 shadow"
      onClick={onExit}
    >
      <span className="font-mono text-xs uppercase">Exit session</span>
      <X className="text-muted" />
    </Button>
  );
};
