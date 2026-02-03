"use client";

import { useEffect, useState } from "react";

import { getVideoByInterviewId } from "@/app/lib/client/media-storage";

export default function RecentRecording({
  interviewId,
}: {
  interviewId: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playError, setPlayError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    (async () => {
      try {
        const blob = await getVideoByInterviewId(interviewId);
        if (!blob) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
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
