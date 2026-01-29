import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { ModerationStatus, Region, RecordingType, RecordingQuality, VerificationStatus, UserRole, User, RecordingMetadata, Recording } from "@/types";
import { migrateVideoDataToVideoData, formatDateTime } from "@/utils/helpers";
import type { LocalRecording } from "@/pages/ApprovedRecordingsPage";
import BackButton from "@/components/common/BackButton";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { Edit, LogIn } from "lucide-react";
import AudioPlayer from "@/components/features/AudioPlayer";
import VideoPlayer from "@/components/features/VideoPlayer";
import { isYouTubeUrl } from "@/utils/youtube";
import { getLocalRecordingMetaList, getLocalRecordingFull, removeLocalRecording } from "@/services/recordingStorage";
import { sessionSetItem } from "@/services/storageService";

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
  const [withdrawConfirmId, setWithdrawConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const metaList = await getLocalRecordingMetaList();
      const migrated = migrateVideoDataToVideoData(metaList);
      if (!user) {
        setContributions([]);
        return;
      }
      const myMeta = migrated.filter((r) => r.uploader?.id === user.id);
      const fullList = await Promise.all(myMeta.map((r) => getLocalRecordingFull(r.id ?? "")));
      setContributions(fullList.filter((r): r is LocalRecording => r != null));
    } catch (err) {
      console.error(err);
      setContributions([]);
    }
  }, [user]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);


  const withdraw = async (id?: string) => {
    if (!id) return;
    try {
      await removeLocalRecording(id);
      void load();
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
                onClick={async () => {
                  try {
                    const recording = await getLocalRecordingFull(it.id ?? "");
                    if (recording) {
                      await sessionSetItem("editingRecording", JSON.stringify(recording));
                      navigate("/upload?edit=true");
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
                onClick={() => setWithdrawConfirmId(it.id ?? null)}
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

  const isNotContributor = !user || user.role !== "CONTRIBUTOR";

  return (
    <div className="min-h-screen">
      <ConfirmationDialog
        isOpen={withdrawConfirmId != null}
        onClose={() => setWithdrawConfirmId(null)}
        onConfirm={() => {
          if (withdrawConfirmId) {
            withdraw(withdrawConfirmId);
            setWithdrawConfirmId(null);
          }
        }}
        title="Xác nhận hủy đóng góp"
        message="Bạn có chắc muốn hủy đóng góp này?"
        description="Bản thu sẽ bị xóa khỏi danh sách đóng góp của bạn. Hành động này không thể hoàn tác."
        confirmText="Hủy đóng góp"
        cancelText="Không"
        confirmButtonStyle="bg-red-600 text-white hover:bg-red-500"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Đóng góp của bạn</h1>
          <BackButton />
        </div>

        {/* Notice for non-Contributor users (same UX as UploadPage) */}
        {isNotContributor && (
          <div className="mb-8 border border-primary-200/80 rounded-2xl p-8 shadow-lg backdrop-blur-sm text-center transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFF1F3' }}>
            <h2 className="text-2xl font-semibold mb-4 text-primary-700">Bạn cần có tài khoản Người đóng góp để xem trang đóng góp</h2>
            <div className="text-primary-700 text-base mb-4 font-medium">Vui lòng đăng nhập bằng tài khoản Người đóng góp để xem và quản lý đóng góp của bạn.</div>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-primary-600/40 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary-500/50 mx-auto"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "auto" });
                navigate("/login");
              }}
              type="button"
            >
              <LogIn className="h-5 w-5" strokeWidth={2.5} />
              Đăng nhập
            </button>
          </div>
        )}

        {/* Main content (dimmed and disabled for non-Contributor) */}
        <div
          className={`rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl ${isNotContributor ? "opacity-50 pointer-events-none select-none" : ""}`}
          style={{ backgroundColor: '#FFFCF5' }}
        >
          {contributions.length === 0 ? (
            <>
              <h2 className="text-xl font-semibold mb-2 text-neutral-900">Không có đóng góp</h2>
              <p className="text-neutral-700 font-medium">Bạn chưa có đóng góp nào.</p>
            </>
          ) : (
            <div className="space-y-8">
              {contributions.filter(c => c.id).map((c) => renderRecordingItem(c))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
