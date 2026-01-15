"use client";

import { useEffect, useState } from "react";
import { getLatestVideo } from "@/app/lib/media/mediaStorage";

export default function RecentRecording() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl: string | null = null;

    (async () => {
      try {
        const blob = await getLatestVideo();
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
  }, []);

  if (loading)
    return <div className="rounded-2xl bg-primary/10 p-6">Loading...</div>;

  if (!url)
    return (
      <div className="rounded-2xl bg-primary/10 p-6">No recording found.</div>
    );

  return (
    <div>
      <video
        src={url}
        controls
        preload="metadata"
        className="w-full rounded-2xl bg-primary"
        playsInline
      />
    </div>
  );
}
