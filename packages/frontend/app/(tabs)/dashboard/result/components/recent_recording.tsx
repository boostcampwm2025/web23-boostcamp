"use client";

import { useEffect, useState } from "react";
import { getLatestVideo } from "@/app/lib/media/mediaStorage";

export default function RecentRecording() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const blob = await getLatestVideo();
        if (!mounted) return;
        if (blob) {
          const objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      } catch (err) {
        console.error("최근 녹화 불러오기 실패:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  if (loading) return <div className="rounded-2xl bg-primary/10 p-6">Loading...</div>;

  if (!url) return <div className="rounded-2xl bg-primary/10 p-6">No recording found.</div>;

  return (
    <div>
      <video src={url} controls preload="metadata" className="rounded-2xl bg-primary w-full" playsInline />
    </div>
  );
}
