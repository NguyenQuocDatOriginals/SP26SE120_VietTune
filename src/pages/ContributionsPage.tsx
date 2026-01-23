import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { ModerationStatus } from "@/types";
import { migrateVideoDataToVideoData } from "@/utils/helpers";
import type { LocalRecording } from "@/pages/ApprovedRecordingsPage";
import BackButton from "@/components/common/BackButton";
import { Edit } from "lucide-react";

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

interface LocalRecordingMini {
  id?: string;
  title?: string;
  basicInfo?: {
    title?: string;
    artist?: string;
    genre?: string;
  };
  uploadedAt?: string;
  uploader?: { id?: string; username?: string };
  moderation?: { 
    status?: ModerationStatus | string; 
    claimedByName?: string;
    rejectionNote?: string;
  };
}

export default function ContributionsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<LocalRecordingMini[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("localRecordings");
      const all = raw ? (JSON.parse(raw) as LocalRecordingMini[]) : [];
      // Migrate video data từ audioData sang videoData
      const migrated = migrateVideoDataToVideoData(all);
      if (!user) {
        setContributions([]);
        return;
      }
      const my = migrated.filter((r) => r.uploader?.id === user.id);
      setContributions(
        my.map((r) => ({
          id: r.id,
          title: r.title,
          basicInfo: r.basicInfo,
          uploadedAt: (r as LocalRecordingStorage).uploadedDate || (r as LocalRecordingStorage).uploadedAt,
          uploader: r.uploader,
          moderation: r.moderation
            ? {
              status: r.moderation.status,
              claimedByName:
                r.moderation.claimedByName === null
                  ? undefined
                  : r.moderation.claimedByName,
              rejectionNote: (r.moderation as LocalRecordingStorage['moderation'])?.rejectionNote,
            }
            : undefined,
        }))
      );
    } catch (err) {
      console.error(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Listen for storage changes to update contributions
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const raw = localStorage.getItem("localRecordings");
        const all = raw ? (JSON.parse(raw) as LocalRecordingMini[]) : [];
        const migrated = migrateVideoDataToVideoData(all);
        if (!user) {
          setContributions([]);
          return;
        }
        const my = migrated.filter((r) => r.uploader?.id === user.id);
        setContributions(
          my.map((r) => ({
            id: r.id,
            title: r.title,
            basicInfo: r.basicInfo,
            uploadedAt: (r as LocalRecordingStorage).uploadedDate || (r as LocalRecordingStorage).uploadedAt,
            uploader: r.uploader,
            moderation: r.moderation
              ? {
                status: r.moderation.status,
                claimedByName:
                  r.moderation.claimedByName === null
                    ? undefined
                    : r.moderation.claimedByName,
                rejectionNote: (r.moderation as LocalRecordingStorage['moderation'])?.rejectionNote,
              }
              : undefined,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 3000); // Refresh every 3 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  const withdraw = (id?: string) => {
    if (!id) return;
    try {
      const raw = localStorage.getItem("localRecordings");
      const all = raw ? (JSON.parse(raw) as LocalRecordingMini[]) : [];
      // Migrate video data trước khi xóa
      const migrated = migrateVideoDataToVideoData(all);
      const filtered = migrated.filter((r) => r.id !== id);
      localStorage.setItem("localRecordings", JSON.stringify(filtered));
      setContributions(
        filtered
          .filter((r) => r.uploader?.id === user?.id)
          .map((r) => ({
            id: r.id,
            title: r.title,
            basicInfo: r.basicInfo,
            uploadedAt: (r as LocalRecordingStorage).uploadedDate || (r as LocalRecordingStorage).uploadedAt,
            uploader: r.uploader,
            moderation: r.moderation
              ? {
                status: r.moderation.status,
                claimedByName:
                  r.moderation.claimedByName === null
                    ? undefined
                    : r.moderation.claimedByName,
                rejectionNote: (r.moderation as LocalRecordingStorage['moderation'])?.rejectionNote as string | undefined,
              } as LocalRecordingMini['moderation']
              : undefined,
          }))
      );
    } catch (err) {
      console.error(err);
    }
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
        <div className="prose max-w-none">
          {contributions.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
              <p className="text-neutral-600 text-center text-lg">Bạn chưa có đóng góp nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contributions.filter(c => c.id).map((c) => (
                <div key={c.id} className="border border-neutral-200/80 rounded-2xl p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {c.basicInfo?.title || c.title || 'Không có tiêu đề'}
                      </h3>
                      {c.basicInfo?.artist && (
                        <div className="text-sm text-neutral-600 mb-1">Nghệ sĩ: {c.basicInfo.artist}</div>
                      )}
                      <div className="text-sm text-neutral-600 mb-1">Ngày tải: {c.uploadedAt ? new Date(c.uploadedAt).toLocaleString() : '-'}</div>
                      <div className="text-sm mt-1">
                        Trạng thái: <span className="font-medium">{getStatusLabel(c.moderation?.status)}</span>
                        {c.moderation?.status === ModerationStatus.IN_REVIEW && c.moderation?.claimedByName && (
                          <span className="text-neutral-500"> — Đang được kiểm duyệt bởi {c.moderation.claimedByName}</span>
                        )}
                        {c.moderation?.status === ModerationStatus.TEMPORARILY_REJECTED && c.moderation?.rejectionNote && (
                          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800"><strong>Ghi chú từ Expert:</strong> {c.moderation.rejectionNote}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {c.moderation?.status === ModerationStatus.TEMPORARILY_REJECTED && (
                        <button 
                          onClick={() => {
                            // Load the full recording data and navigate to upload page with edit mode
                            try {
                              const raw = localStorage.getItem("localRecordings");
                              if (raw) {
                                const all = JSON.parse(raw);
                                const recording = all.find((r: LocalRecordingStorage) => r.id === c.id);
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
                      {(c.moderation?.status === ModerationStatus.PENDING_REVIEW || c.moderation?.status === ModerationStatus.REJECTED) && (
                        <button 
                          onClick={() => withdraw(c.id)} 
                          className="px-4 py-2 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm whitespace-nowrap transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          Hủy đóng góp
                        </button>
                      )}
                      {c.moderation?.status === ModerationStatus.APPROVED && (
                        <div className="text-sm text-green-600 font-medium whitespace-nowrap">Đã được kiểm duyệt</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
