"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, type MotionProps } from "motion/react";

interface IDismissibleDraggablePanel extends MotionProps {
  onDismiss: () => void;
  className?: string;
  minVisibleRatio?: number;
  children: ReactNode;
}

export default function DismissibleDraggablePanel({
  onDismiss,
  className,
  minVisibleRatio = 0.3,
  children,
  onUpdate,
  ...motionProps
}: IDismissibleDraggablePanel) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (closeRafRef.current != null) {
        window.cancelAnimationFrame(closeRafRef.current);
        closeRafRef.current = null;
      }
    };
  }, []);

  return (
    <motion.div
      {...motionProps}
      ref={panelRef}
      className={className}
      drag
      onUpdate={(latest) => {
        if (closeRafRef.current != null) return;

        closeRafRef.current = window.requestAnimationFrame(() => {
          closeRafRef.current = null;

          const element = panelRef.current;
          if (!element) return;

          const rect = element.getBoundingClientRect();
          const vw = window.innerWidth;
          const vh = window.innerHeight;

          const rectW = Math.max(0, rect.width);
          const rectH = Math.max(0, rect.height);
          const rectArea = rectW * rectH;

          // 혹시나..
          if (rectArea === 0) {
            return;
          }

          const intersectionLeft = Math.max(0, rect.left);
          const intersectionTop = Math.max(0, rect.top);
          const intersectionRight = Math.min(vw, rect.right);
          const intersectionBottom = Math.min(vh, rect.bottom);

          const intersectionW = Math.max(
            0,
            intersectionRight - intersectionLeft,
          );
          const intersectionH = Math.max(
            0,
            intersectionBottom - intersectionTop,
          );
          const visibleArea = intersectionW * intersectionH;
          const visibleRatio = visibleArea / rectArea;

          if (visibleRatio < minVisibleRatio) {
            onDismiss();
          }
        });

        if (onUpdate) {
          onUpdate(latest);
        }
      }}
    >
      {children}
    </motion.div>
  );
}
