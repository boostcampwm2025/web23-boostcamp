import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIsoDateToDot(dateIso: string) {
  if (!dateIso) return "";
  return String(dateIso).split("T")[0].replace(/-/g, ".");
}

export function timeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "방금 전";
  if (diffHours < 1) return `${diffMinutes}분 전`;
  if (diffDays < 1) return `${diffHours}시간 전`;
  return `${diffDays}일 전`;
}
