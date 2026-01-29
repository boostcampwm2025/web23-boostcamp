"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import { getLatestAudio, getLatestVideo } from "@/app/lib/client/media-storage";
import useMediaRecorder from "@/app/hooks/use-media-recorder";

const getObjectUrl = (blob: Blob, prevUrl: string | null) => {
  if (prevUrl) URL.revokeObjectURL(prevUrl);
  return URL.createObjectURL(blob);
};

export default function RecordingTestPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [log, setLog] = useState<string>("");
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const {
    isRecording,
    startVideoRecording,
    stopVideoRecording,
    startAudioRecording,
    stopAudioRecording,
  } = useMediaRecorder(stream);

  const appendLog = useCallback((message: string) => {
    setLog(
      (prev) => `${new Date().toLocaleTimeString()} - ${message}\n${prev}`,
    );
  }, []);

  // Request media stream on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        if (!mounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(mediaStream);
        if (videoElRef.current) {
          videoElRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error(error);
        appendLog("getUserMedia 실패 - 권한을 확인하세요");
      }
    })();

    return () => {
      mounted = false;
      setStream((prev) => {
        if (prev) prev.getTracks().forEach((t) => t.stop());
        return null;
      });
    };
  }, [appendLog]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl, videoUrl]);

  const handleStartVideo = () => {
    appendLog("비디오 녹화 시작");
    startVideoRecording();
  };

  const handleStopVideo = async () => {
    const blob = await stopVideoRecording();
    if (blob) {
      setVideoUrl((prev) => getObjectUrl(blob, prev));
      appendLog(`비디오 저장 완료 (${(blob.size / 1024).toFixed(1)} KB)`);
    }
  };

  const handleStartAudio = () => {
    appendLog("오디오 녹음 시작");
    startAudioRecording();
  };

  const handleStopAudio = async () => {
    const blob = await stopAudioRecording();
    if (blob) {
      setAudioUrl((prev) => getObjectUrl(blob, prev));
      appendLog(`오디오 저장 완료 (${(blob.size / 1024).toFixed(1)} KB)`);
    }
  };

  const handleLoadLatest = async (type: "video" | "audio") => {
    const loader = type === "video" ? getLatestVideo : getLatestAudio;
    const blob = await loader();
    if (!blob) {
      appendLog(`${type} 기록 없음`);
      return;
    }
    if (type === "video") {
      setVideoUrl((prev) => getObjectUrl(blob, prev));
      appendLog("저장된 비디오 불러옴");
    } else {
      setAudioUrl((prev) => getObjectUrl(blob, prev));
      appendLog("저장된 오디오 불러옴");
    }
  };

  const videoDisabled = !stream;

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-slate-50 p-6 text-slate-900">
      <h1 className="text-2xl font-bold">Recording Test Page</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Controls</h2>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded bg-emerald-600 px-3 py-2 text-white disabled:bg-slate-300"
              onClick={handleStartVideo}
              disabled={videoDisabled || isRecording}
            >
              비디오 녹화 시작
            </button>
            <button
              className="rounded bg-emerald-700 px-3 py-2 text-white disabled:bg-slate-300"
              onClick={handleStopVideo}
              disabled={videoDisabled || !isRecording}
            >
              비디오 녹화 종료
            </button>
            <button
              className="rounded bg-indigo-600 px-3 py-2 text-white disabled:bg-slate-300"
              onClick={handleStartAudio}
              disabled={videoDisabled || isRecording}
            >
              오디오 녹음 시작
            </button>
            <button
              className="rounded bg-indigo-700 px-3 py-2 text-white disabled:bg-slate-300"
              onClick={handleStopAudio}
              disabled={videoDisabled || !isRecording}
            >
              오디오 녹음 종료
            </button>
            <button
              className="rounded bg-slate-700 px-3 py-2 text-white disabled:bg-slate-300"
              onClick={() => handleLoadLatest("video")}
              disabled={videoDisabled}
            >
              저장된 비디오 불러오기
            </button>
            <button
              className="rounded bg-slate-800 px-3 py-2 text-white disabled:bg-slate-300"
              onClick={() => handleLoadLatest("audio")}
              disabled={videoDisabled}
            >
              저장된 오디오 불러오기
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            녹화/저장 시 IndexedDB에 저장되고, 불러오기로 확인할 수 있습니다.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Live Stream Preview</h2>
          <video
            ref={videoElRef}
            className="aspect-video w-full rounded border border-slate-200 bg-black"
            autoPlay
            muted
            playsInline
          />
          <p className="mt-2 text-sm text-slate-600">
            브라우저 권한 허용이 필요합니다.
          </p>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Latest Video</h2>
          {videoUrl ? (
            <video
              src={videoUrl}
              className="aspect-video w-full rounded border border-slate-200 bg-black"
              controls
              playsInline
            />
          ) : (
            <div className="rounded border border-dashed border-slate-300 p-6 text-center text-slate-500">
              비디오 없음
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Latest Audio</h2>
          {audioUrl ? (
            <audio src={audioUrl} controls className="w-full" />
          ) : (
            <div className="rounded border border-dashed border-slate-300 p-6 text-center text-slate-500">
              오디오 없음
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold">Log</h2>
        <pre className="h-48 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {log || "로그가 여기에 표시됩니다"}
        </pre>
      </section>
    </div>
  );
}
