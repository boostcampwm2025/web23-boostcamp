import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIsoDateToDot(dateIso: string) {
  if (!dateIso) return "";
  return String(dateIso).split("T")[0].replace(/-/g, ".");
}
