"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, type MotionProps } from "motion/react";
import { cn } from "@/app/lib/utils";
import { X } from "lucide-react";

interface IDismissibleDraggablePanel extends MotionProps {
  onDismiss: () => void;
  className?: string;
  minVisibleRatio?: number;
  children: ReactNode;
  title?: string;
  keepInViewport?: boolean;
  viewportPadding?: number;
}

export default function DismissibleDraggablePanel({
  onDismiss,
  className,
  minVisibleRatio = 0.3,
  keepInViewport = true,
  viewportPadding = 16,
  children,
  onUpdate,
  title,
  ...motionProps
}: IDismissibleDraggablePanel) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRafRef = useRef<number | null>(null);
  const clampRafRef = useRef<number | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    return () => {
      if (closeRafRef.current != null) {
        window.cancelAnimationFrame(closeRafRef.current);
        closeRafRef.current = null;
      }
      if (clampRafRef.current != null) {
        window.cancelAnimationFrame(clampRafRef.current);
        clampRafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!keepInViewport) return;

    const clampIntoViewport = () => {
      const element = panelRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let dx = 0;
      let dy = 0;

      if (rect.left < viewportPadding) {
        dx = viewportPadding - rect.left;
      } else if (rect.right > vw - viewportPadding) {
        dx = vw - viewportPadding - rect.right;
      }

      if (rect.top < viewportPadding) {
        dy = viewportPadding - rect.top;
      } else if (rect.bottom > vh - viewportPadding) {
        dy = vh - viewportPadding - rect.bottom;
      }

      if (dx !== 0) x.set(x.get() + dx);
      if (dy !== 0) y.set(y.get() + dy);
    };

    const scheduleClamp = () => {
      if (clampRafRef.current != null) return;
      clampRafRef.current = window.requestAnimationFrame(() => {
        clampRafRef.current = null;
        clampIntoViewport();
      });
    };

    // 최초 1회도 정리(리로드/레이아웃 변경 직후)
    scheduleClamp();

    window.addEventListener("resize", scheduleClamp);
    return () => {
      window.removeEventListener("resize", scheduleClamp);
    };
  }, [keepInViewport, viewportPadding, x, y]);

  return (
    <motion.div
      {...motionProps}
      ref={panelRef}
      className={cn(className, "cursor-pointer p-3")}
      style={{ ...(motionProps.style ?? {}), x, y }}
      drag
      dragMomentum={false}
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
      <div
        className={cn(
          "mb-3 flex items-center",
          title ? "justify-between" : "justify-end",
        )}
      >
        {title && <div className="text-sm text-gray-700">{title}</div>}
        <div
          className="w-fit cursor-pointer rounded-full bg-red-500 p-1.5 text-white shadow-md"
          onClick={onDismiss}
        >
          <X className="size-4" />
        </div>
      </div>
      {children}
    </motion.div>
  );
}
