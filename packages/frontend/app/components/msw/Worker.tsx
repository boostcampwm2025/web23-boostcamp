"use client";

import { useEffect } from "react";
import { startWorker } from "@/mocks/browser";

export default function MSWWorker() {
  useEffect(() => {
    try {
      if (process.env.NEXT_PUBLIC_API_MOCK === "true") {
        startWorker();
      }
    } catch {}
  }, []);

  return null;
}
