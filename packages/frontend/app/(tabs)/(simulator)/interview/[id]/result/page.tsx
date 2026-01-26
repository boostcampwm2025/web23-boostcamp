"use client";

import { getLatestVideo } from "@/app/lib/client/media-storage";
import { useEffect, useState } from "react";

export default function InterviewResultPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const getObjectUrl = (blob: Blob, prevUrl: string | null) => {
    if (prevUrl) URL.revokeObjectURL(prevUrl);
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    const handleLoadLatest = async () => {
      const blob = await getLatestVideo();

      if (!blob) return;

      setVideoUrl((prev) => getObjectUrl(blob, prev));
    };
    (async () => {
      await handleLoadLatest();
    })();
  }, []);

  return (
    <div>
      Interview Result Page
      <video src={videoUrl || "/"} controls></video>
    </div>
  );
}
