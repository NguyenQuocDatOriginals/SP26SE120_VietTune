import { type ClassValue, clsx } from "clsx";
import type { LocalRecording } from "@/pages/ApprovedRecordingsPage";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Migration function: Chuyển đổi video từ audioData sang videoData
 * Hàm này sẽ tự động migrate các bản ghi cũ có mediaType === "video"
 * nhưng đang lưu trong audioData sang videoData
 */
export function migrateVideoDataToVideoData(
  recordings: LocalRecording[],
): LocalRecording[] {
  let hasChanges = false;

  const migrated = recordings.map((rec) => {
    // Chỉ migrate nếu:
    // 1. mediaType === "video"
    // 2. Có audioData (không null/undefined và không rỗng)
    // 3. Chưa có videoData hoặc videoData rỗng/null
    if (
      rec.mediaType === "video" &&
      rec.audioData &&
      typeof rec.audioData === "string" &&
      rec.audioData.trim().length > 0 &&
      (!rec.videoData ||
        (typeof rec.videoData === "string" &&
          rec.videoData.trim().length === 0))
    ) {
      hasChanges = true;
      return {
        ...rec,
        videoData: rec.audioData, // Chuyển audioData sang videoData
        audioData: null, // Xóa audioData
      };
    }
    return rec;
  });

  // Nếu có thay đổi, lưu lại vào localStorage
  if (hasChanges) {
    try {
      localStorage.setItem("localRecordings", JSON.stringify(migrated));
      console.log(
        `Migration: Đã chuyển đổi ${migrated.filter((r) => r.videoData && !r.audioData).length} bản ghi video từ audioData sang videoData`,
      );
    } catch (error) {
      console.error("Migration error:", error);
    }
  }

  return migrated;
}
