import { useEffect, useRef, useState } from "react";

async function safeCloseAudioContext(audioContext: AudioContext | null) {
  if (!audioContext) return;

  // close()는 중복 호출 시 예외가 날 수 있어 방어
  if (audioContext.state === "closed") return;

  try {
    await audioContext.close();
  } catch {
    // 이미 닫힌 상태 등은 무시
  }
}

function calculateAudioLevel(data: Uint8Array) {
  let sum = 0;
  // time-domain 샘플(0..255) -> -1..1 정규화 후 RMS 계산
  for (let i = 0; i < data.length; i++) {
    const normalizedValue = (data[i] - 128) / 128;
    sum += normalizedValue * normalizedValue;
  }
  const avg = sum / data.length;
  const rmsLevel = Math.sqrt(avg);

  return rmsLevel; // 0..1 (상대적인 에너지)
}

interface IUseAudioViz {
  open: boolean;
  audioStream: MediaStream;
}

export function useAudioViz({ open, audioStream }: IUseAudioViz) {
  // 0..1 오디오 레벨(RMS 기반)
  const [audioLevel, setAudioLevel] = useState(0);
  // 시간 영역(파형) 데이터
  const timeDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  // 주파수 영역(스펙트럼) 데이터
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  // requestAnimationFrame id
  const animationFrameRef = useRef<number | null>(null);
  // WebAudio 참조
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // 출력 스무딩(간단한 EMA)
  const smoothedLevelRef = useRef(0);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const initializeAudioContext = async () => {
      // Safari 대응
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      try {
        // 브라우저 정책상 resume()이 필요할 수 있음
        await audioContext.resume();
      } catch (error) {
        setError(`AudioContext 초기화 실패 ${error}`);
        return;
      }

      if (cancelled) {
        // cleanup 되었으면 중단
        await safeCloseAudioContext(audioContext);
        return;
      }

      audioStreamRef.current = audioStream;

      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      source.connect(analyser);

      timeDataRef.current = new Uint8Array(analyser.fftSize);
      freqDataRef.current = new Uint8Array(analyser.frequencyBinCount);

      const updateAudioData = () => {
        if (cancelled || !analyserRef.current || !timeDataRef.current) {
          return;
        }

        analyserRef.current.getByteTimeDomainData(timeDataRef.current);
        const currentLevel = calculateAudioLevel(timeDataRef.current);

        const nextLevel = smoothedLevelRef.current * 0.85 + currentLevel * 0.15;
        smoothedLevelRef.current = nextLevel;
        setAudioLevel(nextLevel);

        animationFrameRef.current = requestAnimationFrame(updateAudioData);
      };

      updateAudioData();
    };

    initializeAudioContext();

    return () => {
      cancelled = true;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // StrictMode(개발)에서 cleanup이 중복 호출될 수 있음
      const contextToClose = audioContextRef.current;
      audioContextRef.current = null;
      void safeCloseAudioContext(contextToClose);
    };
  }, [open, audioStream]);

  return {
    audioLevel,
    timeDataRef,
    freqDataRef,
    error,
  };
}
