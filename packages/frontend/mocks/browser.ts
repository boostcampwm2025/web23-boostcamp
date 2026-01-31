import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

declare global {
  interface Window {
    __MSW_WORKER_STARTED__?: boolean;
  }
}

export function startWorker() {
  if (typeof window === "undefined") return;
  if (
    (window as Window & { __MSW_WORKER_STARTED__?: boolean })
      .__MSW_WORKER_STARTED__
  )
    return;
  worker.start({ onUnhandledRequest: "bypass" });
  (
    window as Window & { __MSW_WORKER_STARTED__?: boolean }
  ).__MSW_WORKER_STARTED__ = true;
}
