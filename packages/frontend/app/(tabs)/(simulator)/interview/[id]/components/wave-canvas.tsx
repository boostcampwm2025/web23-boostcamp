"use client";

import { useEffect, useRef } from "react";

interface IWaveCanvas {
  timeDataRef: { current: Uint8Array<ArrayBuffer> | null };
  audioLevel: number;
  width?: number;
  height?: number;
}

export default function WaveCanvas({
  timeDataRef,
  audioLevel,
  width = 300,
  height = 100,
}: IWaveCanvas) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // device per pixel ratio
    const dpr = Math.max(window.devicePixelRatio || 1);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // effect 재실행 시 scale 누적 방지
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;

    const draw = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const data = timeDataRef.current;
      if (!data) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const sliceWidth = canvasWidth / data.length;
      let x = 0;

      ctx.lineWidth = 2;
      ctx.strokeStyle = "white";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();

      // 기존 구현이 baseline을 이동시키는 방식이라 어색해 보여서,
      // 파형 자체는 -1~1 정규화 후 중심선을 기준으로 그립니다.
      const centerY = canvasHeight / 2;
      const baseAmp = canvasHeight * 0.35;
      const amp = baseAmp * Math.max(0.25, audioLevel * 3);

      for (let i = 0; i < data.length; i++) {
        const normalized = (data[i] - 128) / 128; // -1 ~ 1
        const y = centerY + normalized * amp;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [timeDataRef, audioLevel, width, height]);

  return (
    <canvas ref={canvasRef} className="h-24 w-full rounded-lg bg-black/20" />
  );
}
