import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ModerationStatus } from "@/types";
import AudioPlayer from "@/components/features/AudioPlayer";
import VideoPlayer from "@/components/features/VideoPlayer";
import { isYouTubeUrl } from "@/utils/youtube";
import { Trash2 } from "lucide-react";
import { migrateVideoDataToVideoData, formatDateTime } from "@/utils/helpers";
import { buildTagsFromLocal } from "@/utils/recordingTags";
import BackButton from "@/components/common/BackButton";
import ForbiddenPage from "@/pages/ForbiddenPage";
import { getLocalRecordingMetaList, getLocalRecordingFull, removeLocalRecording } from "@/services/recordingStorage";

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

import {
  Recording,
  Region,
  RecordingType,
  User,
  UserRole,
  RecordingMetadata,
  RecordingQuality,
  VerificationStatus,
} from "@/types";
import type { LocalRecording } from "@/types";

// Extended Recording type that may include original local data
type RecordingWithLocalData = Recording & {
    _originalLocalData?: LocalRecording & {
        culturalContext?: {
            region?: string;
        };
    };
};

export default function ApprovedRecordingsPage() {
    const { user } = useAuthStore();
    const [items, setItems] = useState<LocalRecording[]>([]);

    const load = useCallback(async () => {
        try {
            const metaList = await getLocalRecordingMetaList();
            const migrated = migrateVideoDataToVideoData(metaList as LocalRecording[]);
            const approvedMeta = migrated.filter(
                (r) =>
                    r.moderation &&
                    typeof r.moderation === "object" &&
                    "status" in r.moderation &&
                    (r.moderation as { status?: string }).status === ModerationStatus.APPROVED
            );
            const fullList = await Promise.all(approvedMeta.map((r) => getLocalRecordingFull(r.id ?? "")));
            setItems(fullList.filter((r): r is LocalRecording => r != null));
        } catch (err) {
            console.error(err);
            setItems([]);
        }
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 3000);
        return () => clearInterval(interval);
    }, [load]);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState<Record<string, boolean>>({});

    const handleDelete = async (id: string) => {
        if (!id) return;
        try {
            await removeLocalRecording(id);
            setShowDeleteConfirm(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
            void load();
        } catch (err) {
            console.error(err);
        }
    };

    if (!user || user.role !== "EXPERT") {
        return (
            <ForbiddenPage message="Bạn cần tài khoản Chuyên gia để truy cập trang này." />
        );
    }

    // Phân chia bản thu thành 2 nhóm: do expert hiện tại duyệt và do expert khác duyệt
    const myApproved = items.filter((it) => it.moderation?.reviewerId === user?.id);
    const othersApproved = items.filter((it) => it.moderation?.reviewerId !== user?.id && it.moderation?.reviewerId);

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

        const isMyReview = it.moderation?.reviewerId === user?.id;

        return (
            <div key={it.id} className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="text-neutral-800 font-semibold text-lg">
                                {it.basicInfo?.title || it.title || 'Không có tiêu đề'}
                            </div>
                            {isMyReview && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100/90 text-primary-800 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
                                    Đã được tôi kiểm duyệt
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-neutral-600 mb-1">
                            Nghệ sĩ: {it.basicInfo?.artist || 'Không rõ'}
                        </div>
                        <div className="text-sm text-neutral-600 mb-1">
                            Người đóng góp: {it.uploader?.username || 'Khách'}
                        </div>
                        <div className="text-sm text-neutral-500 mb-1">
                            Thời điểm tải lên: {formatDateTime(it.uploadedDate)}
                        </div>
                        {it.moderation?.reviewedAt && (
                            <div className="text-sm text-neutral-500 mb-1">
                                Ngày kiểm duyệt: {formatDateTime(it.moderation.reviewedAt)}
                            </div>
                        )}
                        {it.moderation?.reviewerName && (
                            <div className="text-sm text-neutral-500 mb-1">
                                Người kiểm duyệt: {it.moderation.reviewerName}
                            </div>
                        )}
                        <div className="text-sm mt-2">
                            Trạng thái: <span className="font-medium">{getStatusLabel(it.moderation?.status)}</span>
                        </div>
                    </div>

                    {/* Delete Button */}
                    <div className="ml-4">
                        {showDeleteConfirm[it.id || ''] ? (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5">
                                <span className="text-xs text-red-700 font-medium">Xác nhận?</span>
                                <button
                                    onClick={() => handleDelete(it.id || '')}
                                    className="text-xs text-red-700 hover:text-red-900 font-semibold"
                                >
                                    Xóa
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(prev => ({ ...prev, [it.id || '']: false }))}
                                    className="text-xs text-neutral-600 hover:text-neutral-800"
                                >
                                    Hủy
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDeleteConfirm(prev => ({ ...prev, [it.id || '']: true }))}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110 active:scale-95 cursor-pointer"
                                title="Xóa bản thu khỏi hệ thống"
                            >
                                <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                            </button>
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
                                    tags: buildTagsFromLocal(it),
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
                                    tags: buildTagsFromLocal(it),
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

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-neutral-800">Quản lý bản thu đã được kiểm duyệt</h1>
                    <BackButton />
                </div>

                {items.length === 0 ? (
                    <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 mb-8 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
                        <h2 className="text-xl font-semibold mb-2 text-neutral-900">Không có bản thu</h2>
                        <p className="text-neutral-700 font-medium">Không có bản thu nào đã được kiểm duyệt.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Bản thu do tôi kiểm duyệt */}
                        {myApproved.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100/90 text-primary-800 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
                                        Bản thu do tôi kiểm duyệt
                                    </span>
                                    <span className="text-sm font-normal text-neutral-600">({myApproved.length})</span>
                                </h2>
                                <div className="space-y-6">
                                    {myApproved.map((it) => renderRecordingItem(it))}
                                </div>
                            </div>
                        )}

                        {/* Bản thu do chuyên gia khác kiểm duyệt */}
                        {othersApproved.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100/90 text-neutral-700 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-200">
                                        Bản thu do chuyên gia khác kiểm duyệt
                                    </span>
                                    <span className="text-sm font-normal text-neutral-600">({othersApproved.length})</span>
                                </h2>
                                <div className="space-y-6">
                                    {othersApproved.map((it) => renderRecordingItem(it))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
