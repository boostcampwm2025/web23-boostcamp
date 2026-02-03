"use client";

import { Hammer, House, MountainSnow } from "lucide-react";
import { Button } from "./components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-6 p-4">
      <MountainSnow className="size-12 text-primary" />

      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">
          어라..? 뭔가 잘못된거 같군요..
        </h1>
        {/* <p className="mb-4 text-lg text-gray-600">{error.message}</p> */}
        {error.digest && (
          <p className="text-xs text-gray-400">Error ID: {error.digest}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button className="cursor-pointer" onClick={() => reset()}>
          <Hammer />
          <p>다시 시도하기</p>
        </Button>
        <Button
          className="cursor-pointer"
          onClick={() => (window.location.href = "/")}
        >
          <House />
          <p>홈으로</p>
        </Button>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        이 문제가 계속되면 WEB 23에게 연락해주세요!
      </p>
    </div>
  );
}
