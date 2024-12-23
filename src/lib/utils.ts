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

    console.log(`[SUMMA_DEBUG]-${tag} ${formattedMessages}`);
  }
}

// 打印错误日志
export function summaErrorLog(tag: string, error: unknown) {
  const formattedError = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    name: error instanceof Error ? error.name : typeof error
  }
  console.log(`[SUMMA_DEBUG]-${tag} ${JSON.stringify(formattedError)}`);
}
