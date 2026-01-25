import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { ModerationStatus, Region, RecordingType, RecordingQuality, VerificationStatus, UserRole, User, RecordingMetadata, Recording } from "@/types";
import { migrateVideoDataToVideoData, formatDateTime } from "@/utils/helpers";
import type { LocalRecording } from "@/pages/ApprovedRecordingsPage";
import BackButton from "@/components/common/BackButton";
import { Edit } from "lucide-react";
import AudioPlayer from "@/components/features/AudioPlayer";
import VideoPlayer from "@/components/features/VideoPlayer";
import { isYouTubeUrl } from "@/utils/youtube";

// Extended type for local recording storage (supports both legacy and new formats)
type LocalRecordingStorage = LocalRecording & {
  uploadedAt?: string; // Legacy field
  moderation?: LocalRecording['moderation'] & {
    rejectionNote?: string;
  };
};

// Hàm dịch trạng thái sang tiếng Việt
const getStatusLabel = (status?: ModerationStatus | string): string => {
  if (!status) return "Không xác định";

  switch (status) {
    case ModerationStatus.PENDING_REVIEW:
    case "PENDING_REVIEW":
      return "Đang chờ được kiểm duyệt";
    case ModerationStatus.IN_REVIEW:
    case "IN_REVIEW":
      return "Đang được kiểm duyệt";
    case ModerationStatus.APPROVED:
    case "APPROVED":
      return "Đã được kiểm duyệt";
    case ModerationStatus.REJECTED:
    case "REJECTED":
      return "Đã bị từ chối";
    case ModerationStatus.TEMPORARILY_REJECTED:
    case "TEMPORARILY_REJECTED":
      return "Tạm thời bị từ chối";
    default:
      return String(status);
  }
};

// Extended Recording type that may include original local data
type RecordingWithLocalData = Recording & {
  _originalLocalData?: LocalRecording & {
    culturalContext?: {
      region?: string;
    };
  };
};

export default function ContributionsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<LocalRecording[]>([]);

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem("localRecordings");
      const all = raw ? (JSON.parse(raw) as LocalRecording[]) : [];
      // Migrate video data từ audioData sang videoData
      const migrated = migrateVideoDataToVideoData(all);
      if (!user) {
        setContributions([]);
        return;
      }
      const my = migrated.filter((r) => r.uploader?.id === user.id);
      setContributions(my);
    } catch (err) {
      console.error(err);
      setContributions([]);
    }
  }, [user]);

  useEffect(() => {
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "localRecordings") load();
    };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(load, 3000); // refresh to pick up changes in same tab
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, [load]);


  const withdraw = (id?: string) => {
    if (!id) return;
    try {
      const raw = localStorage.getItem("localRecordings");
      const all = raw ? (JSON.parse(raw) as LocalRecording[]) : [];
      // Migrate video data trước khi xóa
      const migrated = migrateVideoDataToVideoData(all);
      const filtered = migrated.filter((r) => r.id !== id);
      localStorage.setItem("localRecordings", JSON.stringify(filtered));
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const renderRecordingItem = (it: LocalRecording) => {
    // VideoPlayer CHỈ nhận videoData hoặc YouTubeURL, AudioPlayer CHỈ nhận audioData
    let mediaSrc: string | undefined;
    let isVideo = false;

    // Kiểm tra YouTube URL trước (cho VideoPlayer)
    if (it.mediaType === "youtube" && it.youtubeUrl && it.youtubeUrl.trim()) {
      mediaSrc = it.youtubeUrl.trim();
      isVideo = true;
    } else if (it.youtubeUrl && typeof it.youtubeUrl === 'string' && it.youtubeUrl.trim() && isYouTubeUrl(it.youtubeUrl)) {
      mediaSrc = it.youtubeUrl.trim();
      isVideo = true;
    }
    // Nếu là video, CHỈ dùng videoData (không fallback về audioData)
    else if (it.mediaType === "video") {
      if (it.videoData && typeof it.videoData === 'string' && it.videoData.trim().length > 0) {
        mediaSrc = it.videoData;
        isVideo = true;
      }
    }
    // Nếu là audio, CHỈ dùng audioData
    else if (it.mediaType === "audio") {
      if (it.audioData && typeof it.audioData === 'string' && it.audioData.trim().length > 0) {
        mediaSrc = it.audioData;
        isVideo = false;
      }
    }
    // Nếu mediaType chưa được set, thử phát hiện từ dữ liệu có sẵn
    else {
      // Ưu tiên videoData nếu có
      if (it.videoData && typeof it.videoData === 'string' && it.videoData.trim().length > 0) {
        mediaSrc = it.videoData;
        isVideo = true;
      }
      // Sau đó thử audioData
      else if (it.audioData && typeof it.audioData === 'string' && it.audioData.trim().length > 0) {
        mediaSrc = it.audioData;
        // Kiểm tra xem có phải video không bằng cách xem data URL
        if (mediaSrc.startsWith('data:video/')) {
          isVideo = true;
        } else {
          isVideo = false;
        }
      }
    }

    return (
      <div key={it.id} className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="text-neutral-800 font-semibold text-lg mb-2">
              {it.basicInfo?.title || it.title || 'Không có tiêu đề'}
            </div>
            {it.basicInfo?.artist && (
              <div className="text-sm text-neutral-600 mb-1">
                Nghệ sĩ: {it.basicInfo.artist}
              </div>
            )}
            <div className="text-sm text-neutral-500 mb-1">
              Thời điểm tải lên: {formatDateTime(it.uploadedDate || (it as LocalRecordingStorage).uploadedAt)}
            </div>
            <div className="text-sm mt-2">
              Trạng thái: <span className="font-medium">{getStatusLabel(it.moderation?.status)}</span>
              {it.moderation?.status === ModerationStatus.IN_REVIEW && it.moderation?.claimedByName && (
                <span className="text-neutral-500"> — Đang được kiểm duyệt bởi {it.moderation.claimedByName}</span>
              )}
              {it.moderation?.status === ModerationStatus.TEMPORARILY_REJECTED && it.moderation?.rejectionNote && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800"><strong>Ghi chú từ Expert:</strong> {it.moderation.rejectionNote}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ml-4 flex items-center gap-2 flex-shrink-0">
            {it.moderation?.status === ModerationStatus.TEMPORARILY_REJECTED && (
              <button 
                onClick={() => {
                  // Load the full recording data and navigate to upload page with edit mode
                  try {
                    const raw = localStorage.getItem("localRecordings");
                    if (raw) {
                      const all = JSON.parse(raw);
                      const recording = all.find((r: LocalRecordingStorage) => r.id === it.id);
                      if (recording) {
                        // Store the recording to edit in sessionStorage
                        sessionStorage.setItem("editingRecording", JSON.stringify(recording));
                        navigate("/upload?edit=true");
                      }
                    }
                  } catch (err) {
                    console.error("Error loading recording for edit:", err);
                  }
                }}
                className="px-4 py-2 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white text-sm whitespace-nowrap flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Edit className="h-4 w-4" strokeWidth={2.5} />
                Chỉnh sửa
              </button>
            )}
            {(it.moderation?.status === ModerationStatus.PENDING_REVIEW || it.moderation?.status === ModerationStatus.REJECTED) && (
              <button 
                onClick={() => withdraw(it.id)} 
                className="px-4 py-2 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm whitespace-nowrap transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                Hủy đóng góp
              </button>
            )}
            {it.moderation?.status === ModerationStatus.APPROVED && (
              <div className="text-sm text-green-600 font-medium whitespace-nowrap">Đã được kiểm duyệt</div>
            )}
          </div>
        </div>

        {/* Media Player */}
        {mediaSrc && (
          <div className="mt-4">
            {isVideo ? (
              <VideoPlayer
                src={mediaSrc}
                title={it.basicInfo?.title || it.title}
                artist={it.basicInfo?.artist}
                recording={{
                  id: it.id ?? "",
                  title: it.title ?? it.basicInfo?.title ?? "Không có tiêu đề",
                  titleVietnamese: it.titleVietnamese ?? "",
                  description: it.description ?? "",
                  ethnicity: it.ethnicity ?? { id: "", name: "", nameVietnamese: "", region: Region.RED_RIVER_DELTA, recordingCount: 0 },
                  region: it.region ?? Region.RED_RIVER_DELTA,
                  recordingType: it.recordingType ?? RecordingType.OTHER,
                  duration: it.duration ?? 0,
                  audioUrl: it.audioUrl ?? it.audioData ?? "",
                  waveformUrl: it.waveformUrl ?? "",
                  coverImage: it.coverImage ?? "",
                  instruments: it.instruments ?? [],
                  performers: it.performers ?? [],
                  recordedDate: it.recordedDate ?? "",
                  uploadedDate: it.uploadedDate ?? "",
                  uploader: ((): User => {
                    if (typeof it.uploader === "object" && it.uploader !== null) {
                      const u = it.uploader as Partial<User>;
                      return {
                        id: u.id ?? "",
                        username: u.username ?? "",
                        email: u.email ?? "",
                        fullName: u.fullName ?? u.username ?? "",
                        role: u.role ?? UserRole.USER,
                        createdAt: u.createdAt ?? "",
                        updatedAt: u.updatedAt ?? "",
                      };
                    }
                    return {
                      id: "",
                      username: "",
                      email: "",
                      fullName: "",
                      role: UserRole.USER,
                      createdAt: "",
                      updatedAt: "",
                    };
                  })(),
                  tags: it.tags ?? [it.basicInfo?.genre ?? ""].filter(Boolean),
                  metadata: {
                    ...((it.metadata ?? {}) as Partial<RecordingMetadata>),
                    recordingQuality: (it.metadata?.recordingQuality ?? RecordingQuality.FIELD_RECORDING)
                  },
                  verificationStatus: it.verificationStatus ?? VerificationStatus.PENDING,
                  verifiedBy: it.verifiedBy ?? undefined,
                  viewCount: it.viewCount ?? 0,
                  likeCount: it.likeCount ?? 0,
                  downloadCount: it.downloadCount ?? 0,
                  _originalLocalData: it,
                } as RecordingWithLocalData}
                showContainer={true}
              />
            ) : (
              <AudioPlayer
                src={mediaSrc}
                title={it.basicInfo?.title || it.title}
                artist={it.basicInfo?.artist}
                recording={{
                  id: it.id ?? "",
                  title: it.title ?? it.basicInfo?.title ?? "Không có tiêu đề",
                  titleVietnamese: it.titleVietnamese ?? "",
                  description: it.description ?? "",
                  ethnicity: it.ethnicity ?? { id: "", name: "", nameVietnamese: "", region: Region.RED_RIVER_DELTA, recordingCount: 0 },
                  region: it.region ?? Region.RED_RIVER_DELTA,
                  recordingType: it.recordingType ?? RecordingType.OTHER,
                  duration: it.duration ?? 0,
                  audioUrl: it.audioUrl ?? it.audioData ?? "",
                  waveformUrl: it.waveformUrl ?? "",
                  coverImage: it.coverImage ?? "",
                  instruments: it.instruments ?? [],
                  performers: it.performers ?? [],
                  recordedDate: it.recordedDate ?? "",
                  uploadedDate: it.uploadedDate ?? "",
                  uploader: ((): User => {
                    if (typeof it.uploader === "object" && it.uploader !== null) {
                      const u = it.uploader as Partial<User>;
                      return {
                        id: u.id ?? "",
                        username: u.username ?? "",
                        email: u.email ?? "",
                        fullName: u.fullName ?? u.username ?? "",
                        role: u.role ?? UserRole.USER,
                        createdAt: u.createdAt ?? "",
                        updatedAt: u.updatedAt ?? "",
                      };
                    }
                    return {
                      id: "",
                      username: "",
                      email: "",
                      fullName: "",
                      role: UserRole.USER,
                      createdAt: "",
                      updatedAt: "",
                    };
                  })(),
                  tags: it.tags ?? [it.basicInfo?.genre ?? ""].filter(Boolean),
                  metadata: {
                    ...((it.metadata ?? {}) as Partial<RecordingMetadata>),
                    recordingQuality: (it.metadata?.recordingQuality ?? RecordingQuality.FIELD_RECORDING)
                  },
                  verificationStatus: it.verificationStatus ?? VerificationStatus.PENDING,
                  verifiedBy: it.verifiedBy ?? undefined,
                  viewCount: it.viewCount ?? 0,
                  likeCount: it.likeCount ?? 0,
                  downloadCount: it.downloadCount ?? 0,
                  _originalLocalData: it,
                } as RecordingWithLocalData}
                showContainer={true}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  // Redirect if user is Expert
  useEffect(() => {
    if (user?.role === "EXPERT") {
      navigate("/profile");
    }
  }, [user, navigate]);

  if (user?.role === "EXPERT") {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Đóng góp của bạn</h1>
          <BackButton />
        </div>

        {/* Content */}
        {contributions.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
            <h2 className="text-xl font-semibold mb-2 text-neutral-900">Không có đóng góp</h2>
            <p className="text-neutral-700 font-medium">Bạn chưa có đóng góp nào.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {contributions.filter(c => c.id).map((c) => renderRecordingItem(c))}
          </div>
        )}
      </div>
    </div>
  );
}
