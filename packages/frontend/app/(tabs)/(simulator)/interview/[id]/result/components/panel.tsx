import { ReactNode } from "react";
import clsx from "clsx";

interface IPanelProps {
  children: ReactNode;
  className?: string;
}

export default function Panel({ children, className }: IPanelProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
