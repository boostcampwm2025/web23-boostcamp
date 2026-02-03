"use client";

import { useEffect, useState } from "react";

import {
  getLatestVideo,
  getVideoByInterviewId,
} from "@/app/lib/client/media-storage";

export default function RecentRecording({
  interviewId,
}: {
  interviewId: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playError, setPlayError] = useState<string | null>(null);
  const [debug, setDebug] = useState<null | {
    source: "interview" | "latest";
    blobType: string;
    blobSize: number;
  }>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    (async () => {
      try {
        const byInterview = await getVideoByInterviewId(interviewId);
        const blob = byInterview ?? (await getLatestVideo());
        if (!blob) return;

        setDebug({
          source: byInterview ? "interview" : "latest",
          blobType: blob.type || "(unknown)",
          blobSize: blob.size,
        });

        if (blob.size === 0) {
          setPlayError(
            "저장된 영상 파일이 비어있습니다(0 bytes). 녹화가 stop 되기 전에 이동했을 수 있어요.",
          );
          return;
        }

        // 타입이 비어있으면 video/webm로 보정해 재생/다운로드 호환성을 높입니다.
        const normalizedBlob =
          blob.type && blob.type.length > 0
            ? blob
            : new Blob([blob], { type: "video/webm" });

        objectUrl = URL.createObjectURL(normalizedBlob);
        setUrl(objectUrl);
      } catch (error) {
        console.error("최근 녹화 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [interviewId]);

  if (loading)
    return <div className="rounded-2xl bg-primary/10 p-6">Loading...</div>;

  if (!url)
    return (
      <div className="rounded-2xl bg-primary/10 p-6">No recording found.</div>
    );

  return (
    <div>
      <video
        src={url || ""}
        controls
        preload="metadata"
        className="aspect-video w-full rounded-lg bg-black"
        playsInline
        onError={() => {
          setPlayError(
            "영상 재생에 실패했습니다. 브라우저가 해당 코덱(webm/vp8/vp9)을 지원하는지 확인해주세요.",
          );
        }}
      />

      {playError ? (
        <div className="mt-3 rounded-lg bg-primary/10 p-3 text-sm">
          {playError}
        </div>
      ) : null}

      {debug ? (
        <div className="mt-3 rounded-lg bg-primary/10 p-3 text-xs text-muted-foreground">
          source: {debug.source}, type: {debug.blobType}, size:{" "}
          {debug.blobSize.toLocaleString()} bytes
        </div>
      ) : null}

      <div className="mt-3 text-sm">
        <a
          className="underline"
          href={url}
          download={`interview-${interviewId}.webm`}
        >
          다운로드
        </a>
      </div>
    </div>
  );
}
