"use client";
import { useRef, useEffect, useState } from "react";
import { PauseIcon, PlayIcon } from "lucide-react";
import Image from "next/image";

import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";
import { Slider } from "@/app/components/ui/slider";
import { steps } from "motion";

export default function AIChromaKey({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segmenterRef = useRef<ImageSegmenter | null>(null);

  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 모델 로딩
  useEffect(() => {
    const initModel = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        const segmenter = await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });

        segmenterRef.current = segmenter;
        setIsModelLoaded(true);
        console.log("모델 로딩 완료");
      } catch (e) {
        console.error("모델 로딩 에러", e);
      }
    };
    initModel();
  }, []);

  useEffect(() => {
    if (!isModelLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;

    const render = async () => {
      if (video.readyState >= 2 && segmenterRef.current) {
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const startTimeMs = performance.now();

        segmenterRef.current.segmentForVideo(video, startTimeMs, (result) => {
          const mask = result.confidenceMasks
            ? result.confidenceMasks[0]
            : null;
          if (!mask) return;

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;

          const maskValues = mask.getAsFloat32Array();

          for (let i = 0; i < maskValues.length; i++) {
            const confidence = maskValues[i];

            if (confidence > 0.5) {
              pixels[i * 4 + 3] = 255;
            } else {
              pixels[i * 4 + 3] = 0;
            }
          }

          ctx.putImageData(imageData, 0, 0);
        });
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isModelLoaded]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(event.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="group relative aspect-video w-full overflow-hidden border border-gray-700 bg-gray-900">
      <Image
        width={420}
        height={320}
        src="https://picsum.photos/800/600"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        playsInline
        crossOrigin="anonymous"
        onTimeUpdate={onTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={onTimeUpdate}
        className="invisible absolute"
      />

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain"
      />

      <div className="absolute right-0 bottom-0 left-0 z-20 flex flex-col gap-2 bg-linear-to-b from-black/80 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {/* 프로그래스 바 (Slider) */}
        <Slider
          value={[currentTime]}
          max={duration || 0}
          step={0.1}
          onChange={handleSeek}
        />

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            {/* 재생/일시정지 버튼 */}
            <button onClick={togglePlay} className="hover:opacity-80">
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            {/* 시간 표시 */}
            <span className="text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {!isModelLoaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 text-white">
          AI 모델 로딩 중...
        </div>
      )}
    </div>
  );
}
