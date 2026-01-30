/**
 * Shared conversion from LocalRecording (upload/moderation storage) to Recording (display/API type).
 * Used for demo fallback when API is unavailable (HomePage, SemanticSearchPage, etc.).
 */
import type { LocalRecording } from "@/pages/ApprovedRecordingsPage";
import {
  Recording,
  Region,
  RecordingType,
  RecordingQuality,
  VerificationStatus,
  UserRole,
  InstrumentCategory,
} from "@/types";
import { buildTagsFromLocal } from "@/utils/recordingTags";

const getAudioDuration = (audioDataUrl: string): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener("loadedmetadata", () => resolve(Math.floor(audio.duration)));
    audio.addEventListener("error", () => resolve(0));
    audio.src = audioDataUrl;
  });
};

export async function convertLocalToRecording(local: LocalRecording): Promise<Recording> {
  let duration = 0;
  const isVideo = local.mediaType === "video" || local.mediaType === "youtube";
  if (!isVideo && local.audioData) {
    duration = await getAudioDuration(local.audioData);
  }
  let mediaSrc: string | undefined;
  if (local.mediaType === "video" && local.videoData && typeof local.videoData === "string" && local.videoData.trim()) {
    mediaSrc = local.videoData;
  } else if (local.mediaType === "audio" && local.audioData && typeof local.audioData === "string" && local.audioData.trim()) {
    mediaSrc = local.audioData;
  } else if (local.videoData && typeof local.videoData === "string" && local.videoData.trim()) {
    mediaSrc = local.videoData;
  } else if (local.audioData && typeof local.audioData === "string" && local.audioData.trim()) {
    mediaSrc = local.audioData;
  }
  const isApproved = local.moderation?.status === "APPROVED";
  return {
    id: local.id ?? "local-" + Math.random().toString(36).slice(2),
    title: local.basicInfo?.title || local.title || "Không có tiêu đề",
    titleVietnamese: local.basicInfo?.title || local.title || "Không có tiêu đề",
    description: local.description || "Bản thu được tải lên từ thiết bị của bạn",
    ethnicity: local.ethnicity ?? {
      id: "local",
      name: "Không xác định",
      nameVietnamese: "Không xác định",
      region: Region.RED_RIVER_DELTA,
      recordingCount: 0,
    },
    region: local.region ?? Region.RED_RIVER_DELTA,
    recordingType: (() => {
      if (local.recordingType) return local.recordingType;
      const key = (local as LocalRecording & { culturalContext?: { performanceType?: string } }).culturalContext?.performanceType;
      if (key === "instrumental") return RecordingType.INSTRUMENTAL;
      if (key === "acappella" || key === "vocal_accompaniment") return RecordingType.VOCAL;
      return RecordingType.OTHER;
    })(),
    duration: local.duration ?? duration,
    audioUrl: local.audioUrl ?? mediaSrc ?? "",
    instruments: (local.instruments?.length ? local.instruments : ((local as LocalRecording & { culturalContext?: { instruments?: string[] } }).culturalContext?.instruments ?? []).map((name, i) => ({
      id: `inst-${i}`,
      name,
      nameVietnamese: name,
      category: InstrumentCategory.IDIOPHONE,
      images: [],
      recordingCount: 0,
    }))),
    performers: local.performers ?? [],
    uploadedDate: local.uploadedDate ?? new Date().toISOString(),
    uploader:
      typeof local.uploader === "object" && local.uploader != null
        ? {
            id: local.uploader?.id ?? "local-user",
            username: local.uploader?.username ?? "Bạn",
            email: local.uploader?.email ?? "",
            fullName: local.uploader?.fullName ?? local.uploader?.username ?? "Người tải lên",
            role: (typeof local.uploader?.role === "string" ? local.uploader.role : UserRole.USER) as UserRole,
            createdAt: local.uploader?.createdAt ?? new Date().toISOString(),
            updatedAt: local.uploader?.updatedAt ?? new Date().toISOString(),
          }
        : {
            id: "local-user",
            username: "Bạn",
            email: "",
            fullName: "Người tải lên",
            role: UserRole.USER,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
    tags: buildTagsFromLocal(local),
    metadata: {
      ...local.metadata,
      recordingQuality: local.metadata?.recordingQuality ?? RecordingQuality.FIELD_RECORDING,
      lyrics: local.metadata?.lyrics ?? "",
    },
    verificationStatus: local.verificationStatus ?? (isApproved ? VerificationStatus.VERIFIED : VerificationStatus.PENDING),
    viewCount: local.viewCount ?? 0,
    likeCount: local.likeCount ?? 0,
    downloadCount: local.downloadCount ?? 0,
  } as Recording;
}
