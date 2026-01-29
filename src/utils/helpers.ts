import { type ClassValue, clsx } from "clsx";
import type { LocalRecording } from "@/pages/ApprovedRecordingsPage";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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

  // Pure function: no storage write. Callers use recordingStorage.setLocalRecording per item if needed.
  if (hasChanges) {
    console.log(
      `Migration (in-memory): ${migrated.filter((r) => r.videoData && !r.audioData).length} bản ghi video từ audioData sang videoData`,
    );
  }

  return migrated;
}

/**
 * Format date and time to Vietnamese locale with full date and time
 * Format: "dd/MM/yyyy, HH:mm:ss"
 *
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string in Vietnamese locale, or '-' if invalid
 */
export function formatDateTime(
  dateString: string | Date | null | undefined,
): string {
  if (!dateString) return "-";

  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return "-";
  }
}

/**
 * Format date only (without time) to Vietnamese locale
 * Format: "dd/MM/yyyy"
 *
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string in Vietnamese locale, or '-' if invalid
 */
export function formatDate(
  dateString: string | Date | null | undefined,
): string {
  if (!dateString) return "-";

  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "-";
  }
}
