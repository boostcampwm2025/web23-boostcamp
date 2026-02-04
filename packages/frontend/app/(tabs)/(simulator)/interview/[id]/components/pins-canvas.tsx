"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";

interface IPinsCanvasProps {
  audioLevel: number;
  /**
   * true면 캔버스의 픽셀 버퍼(canvas.width/height)를 레이아웃(CSS) 크기에 맞춥니다.
   * 보통은 className으로 크기(h-*, w-*)를 주면 됩니다.
   */
  fitParent?: boolean;
  /** fitParent가 false일 때만 의미가 있습니다. */
  width?: number;
  /** fitParent가 false일 때만 의미가 있습니다. */
  height?: number;
  className?: string;
  /** 값이 클수록 막대가 느리게 흐릅니다. */
  pushIntervalMs?: number;
  barWidth?: number;
  gap?: number;
  /** 막대(또는 점) 색상 */
  barColor?: string;
  /** 중앙 기준선 표시 여부 (기본: 표시 안 함) */
  showCenterLine?: boolean;
  /** 중앙 기준선 색상 (showCenterLine=true일 때만 사용) */
  centerLineColor?: string;
}

/**
 * 값을 0~1 범위로 클램프 고정 합니다. ( 값들을 보정, 등을 하기에 음수 혹은 1 초과 값이 올 수 있어서 사용합니다. )
 */
function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function snapToDevicePixel(value: number, dpr: number) {
  return Math.round(value * dpr) / dpr;
}

/**
 * 작은 입력이 더 잘 보이도록 지수형 압축(컴프레서 느낌)
 */
function compressLevel01(value01: number, strength = 7) {
  return 1 - Math.exp(-value01 * strength);
}

/**
 * 노이즈 플로어: 이 값 이하의 흔들림은 0으로 취급
 */
function applyNoiseFloor(rawLevel01: number, noiseFloor = 0.008) {
  if (rawLevel01 <= noiseFloor) return 0;
  return (rawLevel01 - noiseFloor) / (1 - noiseFloor);
}

/**
 * 무음일 때도 완전히 0으로 죽지 않도록, 약한 베이스 + 느린 흔들림
 */
function getIdleLevel(phaseRef: { current: number }) {
  phaseRef.current += 0.06;

  const base = 0.02;
  const jitter =
    0.007 * Math.sin(phaseRef.current) +
    0.003 * Math.sin(phaseRef.current * 0.5);

  return Math.max(0, base + jitter);
}

/**
 * Attack/Release 스무딩
 */
function applyEnvelope({
  current,
  target,
  attack,
  release,
}: {
  current: number;
  target: number;
  attack: number;
  release: number;
}) {
  if (target > current) {
    return current + (target - current) * attack;
  }
  return current + (target - current) * release;
}

function ensureHistoryFilled({
  history,
  barsOnScreen,
  fillValue,
}: {
  history: number[];
  barsOnScreen: number;
  fillValue: number;
}) {
  // 레이아웃 측정이 늦게 확장되더라도(폭이 커지는 경우)
  // 첫 화면이 비어 보이거나 한 칸씩 채워지는 느낌을 줄입니다.
  while (history.length < barsOnScreen) {
    history.unshift(fillValue);
  }
}

function trimHistoryToFit({
  history,
  barsOnScreen,
}: {
  history: number[];
  barsOnScreen: number;
}) {
  if (history.length > barsOnScreen) {
    history.splice(0, history.length - barsOnScreen);
  }
}

function drawCenterLine(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
) {
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawRoundedBar(
  ctx: CanvasRenderingContext2D,
  {
    x,
    y,
    w,
    h,
    r,
  }: {
    x: number;
    y: number;
    w: number;
    h: number;
    r: number;
  },
) {
  const ctxWithRoundRect = ctx as CanvasRenderingContext2D & {
    roundRect?: (
      x: number,
      y: number,
      w: number,
      h: number,
      radii?: number | number[],
    ) => void;
  };

  ctx.beginPath();
  if (typeof ctxWithRoundRect.roundRect === "function") {
    ctxWithRoundRect.roundRect(x, y, w, h, r);
  } else {
    const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    const right = x + w;
    const bottom = y + h;

    ctx.moveTo(x + radius, y);
    ctx.lineTo(right - radius, y);
    ctx.quadraticCurveTo(right, y, right, y + radius);
    ctx.lineTo(right, bottom - radius);
    ctx.quadraticCurveTo(right, bottom, right - radius, bottom);
    ctx.lineTo(x + radius, bottom);
    ctx.quadraticCurveTo(x, bottom, x, bottom - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
  ctx.fill();
}

export default function PinsCanvas({
  audioLevel,
  fitParent = true,
  width = 360,
  height = 42,
  className,
  pushIntervalMs = 70,
  barWidth = 3,
  gap = 2,
  barColor = "#111827",
  showCenterLine = false,
  centerLineColor = "#111827",
}: IPinsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const canvasSizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  const historyRef = useRef<number[]>([]);
  const lastPushAtRef = useRef(0);
  const audioLevelRef = useRef(0);
  const envelopeRef = useRef(0);
  const idlePhaseRef = useRef(0);

  // 렌더를 자주 타지 않도록 최신값만 ref로 보관
  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 레이아웃 크기는 CSS(className 등)에 맡기고,
    // 여기서는 측정값 기준으로 픽셀 버퍼(canvas.width/height)만 맞춥니다.
    if (fitParent) canvas.style.display = "block";

    const resizeCanvas = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);

      // 레이아웃(CSS) 크기 기준
      const rect = canvas.getBoundingClientRect();
      const cssWidth = fitParent ? rect.width : width;
      const cssHeight = fitParent ? rect.height : height;

      // 레이아웃이 아직 잡히지 않았으면 대기
      if (fitParent && (cssWidth <= 0 || cssHeight <= 0)) return;

      const nextWidth = cssWidth > 0 ? cssWidth : width;
      const nextHeight = cssHeight > 0 ? cssHeight : height;

      // 픽셀 버퍼 크기 설정(dpr 반영)
      canvas.width = Math.floor(nextWidth * dpr);
      canvas.height = Math.floor(nextHeight * dpr);

      // fixed 모드에서는 CSS 크기도 고정
      if (!fitParent) {
        canvas.style.width = `${nextWidth}px`;
        canvas.style.height = `${nextHeight}px`;
      }

      // transform 누적 방지 + dpr 스케일 적용
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      canvasSizeRef.current = {
        width: canvas.width / dpr,
        height: canvas.height / dpr,
        dpr,
      };
    };

    resizeCanvas();

    // 레이아웃 변경에 맞춰 픽셀 버퍼도 재설정
    let resizeObserver: ResizeObserver | null = null;
    if (fitParent && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
      });
      resizeObserver.observe(canvas);
    }

    const draw = () => {
      const now = performance.now();

      const canvasWidth = canvasSizeRef.current.width;
      const canvasHeight = canvasSizeRef.current.height;
      if (canvasWidth <= 0 || canvasHeight <= 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // 입력 레벨 -> 노이즈 플로어 -> 압축
      const rawLevel01 = clamp01(audioLevelRef.current);
      // 작은 높이에서도 움직임이 보이도록 저레벨을 조금 더 키움
      const noisedReduced01 = applyNoiseFloor(rawLevel01, 0.004);
      const compressed01 = compressLevel01(noisedReduced01, 10);
      const voiceTarget01 = clamp01(Math.pow(compressed01, 0.75) * 1.4);

      // 무음에서도 최소 흔들림 유지
      const idleTarget01 = getIdleLevel(idlePhaseRef);
      const displayTarget01 = Math.max(voiceTarget01, idleTarget01);

      // 스무딩(attack/release)
      const nextEnvelope01 = applyEnvelope({
        current: envelopeRef.current,
        target: displayTarget01,
        attack: 0.35,
        release: 0.06,
      });
      envelopeRef.current = nextEnvelope01;

      // 일정 간격으로 히스토리 업데이트
      if (now - lastPushAtRef.current >= pushIntervalMs) {
        lastPushAtRef.current = now;
        historyRef.current.push(nextEnvelope01);
      }

      const barsOnScreen = Math.max(
        1,
        Math.floor(canvasWidth / (barWidth + gap)),
      );

      // 초기 진입 시 화면을 꽉 채움
      const history = historyRef.current;
      ensureHistoryFilled({
        history,
        barsOnScreen,
        fillValue: 0.02,
      });
      trimHistoryToFit({ history, barsOnScreen });

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // 배경 중앙선
      if (showCenterLine) {
        drawCenterLine(ctx, canvasWidth, canvasHeight, centerLineColor);
      }

      const dpr = canvasSizeRef.current.dpr;
      const centerY = snapToDevicePixel(canvasHeight / 2, dpr);
      const maxHalfH = canvasHeight * 0.42;

      ctx.globalAlpha = 1;
      ctx.fillStyle = barColor;

      const startX = snapToDevicePixel(
        canvasWidth - history.length * (barWidth + gap),
        dpr,
      );

      for (let i = 0; i < history.length; i++) {
        const x = snapToDevicePixel(startX + i * (barWidth + gap), dpr);
        const value = history[i]; // 0..1

        // 아주 작은 값은 점으로 표시
        const rawHalfH = value * maxHalfH;
        if (rawHalfH < 0.9) {
          // 작은 원은 환경에 따라 깨져 보일 수 있어 캡슐로 렌더
          const dotSize = Math.max(2, barWidth);
          const dotTop = snapToDevicePixel(centerY - dotSize / 2, dpr);
          drawRoundedBar(ctx, {
            x,
            y: dotTop,
            w: barWidth,
            h: dotSize,
            r: Math.min(barWidth, dotSize) / 2,
          });
          continue;
        }

        // 최소 높이를 낮춰서 기본 막대가 너무 두껍게 보이지 않게
        const halfH = Math.max(1.0, rawHalfH);

        const top = snapToDevicePixel(centerY - halfH, dpr);
        const barH = halfH * 2;
        const r = Math.min(2, barWidth / 2);

        drawRoundedBar(ctx, {
          x,
          y: top,
          w: barWidth,
          h: barH,
          r,
        });
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    lastPushAtRef.current = performance.now();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      historyRef.current = [];
      lastPushAtRef.current = 0;
      envelopeRef.current = 0;
      idlePhaseRef.current = 0;

      if (resizeObserver) resizeObserver.disconnect();
      resizeObserver = null;
    };
  }, [
    fitParent,
    width,
    height,
    pushIntervalMs,
    barWidth,
    gap,
    barColor,
    showCenterLine,
    centerLineColor,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={clsx(className ?? "block h-full w-full")}
    />
  );
}
