import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 打印日志
export function summaDebugLog(tag: string, ...messages: unknown[]) {
  if (process.env.NODE_ENV !== 'production') {
    const formattedMessages = messages
      .map((msg) =>
        typeof msg === 'object' ? JSON.stringify(msg) : String(msg)
      )
      .join(' ');

    console.log(`[SUMMA_DEBUG]-${tag}: ${formattedMessages}`);
  }
}