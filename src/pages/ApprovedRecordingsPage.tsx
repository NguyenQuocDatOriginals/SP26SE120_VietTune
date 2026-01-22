import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ModerationStatus } from "@/types";
import AudioPlayer from "@/components/features/AudioPlayer";
import VideoPlayer from "@/components/features/VideoPlayer";
import { isYouTubeUrl } from "@/utils/youtube";
import { Trash2 } from "lucide-react";
import { migrateVideoDataToVideoData } from "@/utils/helpers";

// Type for migration function
type LocalRecordingType = LocalRecording;

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

import { Ethnicity, Region, RecordingType, Instrument, Performer, RecordingMetadata, VerificationStatus, User, RecordingQuality, UserRole } from "@/types";

export interface LocalRecording {
    id?: string;
    title?: string;
    titleVietnamese?: string;
    description?: string;
    ethnicity?: Ethnicity;
    region?: Region;
    recordingType?: RecordingType;
    duration?: number;
    audioUrl?: string;
    waveformUrl?: string;
    coverImage?: string;
    instruments?: Instrument[];
    performers?: Performer[];
    recordedDate?: string;
    uploadedDate?: string;
    uploader?: User | { id?: string; username?: string; email?: string; fullName?: string; role?: string; createdAt?: string; updatedAt?: string };
    tags?: string[];
    metadata?: Partial<RecordingMetadata>;
    verificationStatus?: VerificationStatus;
    verifiedBy?: User;
    viewCount?: number;
    likeCount?: number;
    downloadCount?: number;
    // legacy/local-only fields
    basicInfo?: {
        title?: string;
        artist?: string;
        genre?: string;
    };
    audioData?: string | null;
    videoData?: string | null;
    youtubeUrl?: string | null;
    mediaType?: "audio" | "video" | "youtube";
    moderation?: {
        status?: ModerationStatus | string;
        claimedBy?: string | null;
        claimedByName?: string | null;
        claimedAt?: string | null;
        reviewerId?: string | null;
        reviewerName?: string | null;
        reviewedAt?: string | null;
    };
}

export default function ApprovedRecordingsPage() {
    const { user } = useAuthStore();
    const [items, setItems] = useState<LocalRecording[]>([]);

    const load = useCallback(() => {
        try {
            const raw = localStorage.getItem("localRecordings");
            const all = raw ? (JSON.parse(raw) as LocalRecording[]) : [];
            // Migrate video data từ audioData sang videoData
            const migrated = migrateVideoDataToVideoData(all as LocalRecordingType[]);
            // Show only approved items
            const approved = migrated.filter(
                (r) =>
                    r.moderation &&
                    typeof r.moderation === "object" &&
                    "status" in r.moderation &&
                    (r.moderation as { status?: string }).status === ModerationStatus.APPROVED
            );
            setItems(approved);
        } catch (err) {
            console.error(err);
            setItems([]);
        }
    }, []);

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

    const [showDeleteConfirm, setShowDeleteConfirm] = useState<Record<string, boolean>>({});

    const handleDelete = (id: string) => {
        if (!id) return;
        try {
            const raw = localStorage.getItem("localRecordings");
            const all = raw ? (JSON.parse(raw) as LocalRecording[]) : [];
            const filtered = all.filter((r) => r.id !== id);
            localStorage.setItem("localRecordings", JSON.stringify(filtered));
            setShowDeleteConfirm(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
            load();
        } catch (err) {
            console.error(err);
        }
    };

    if (!user || user.role !== "EXPERT") {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
                <div className="text-center">
                    <h1 className="text-9xl font-bold text-primary-600">403</h1>
                    <h2 className="text-3xl font-semibold text-neutral-800 mb-4">Truy cập bị từ chối</h2>
                    <p className="text-neutral-600 mb-8">Bạn cần tài khoản <strong>Chuyên gia</strong> để truy cập trang này.</p>
                    <a href="/" className="btn-liquid-glass-primary inline-block">Về trang chủ</a>
                </div>
            </div>
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
            <div key={it.id} className="rounded-2xl shadow-md border border-neutral-200 p-8" style={{ backgroundColor: '#FFFCF5' }}>
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="text-neutral-800 font-semibold text-lg">
                                {it.basicInfo?.title || it.title || 'Không có tiêu đề'}
                            </div>
                            {isMyReview && (
                                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                                    Đã duyệt bởi tôi
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
                            Ngày tải: {it.uploadedDate ? new Date(it.uploadedDate).toLocaleString() : '-'}
                        </div>
                        {it.moderation?.reviewedAt && (
                            <div className="text-sm text-neutral-500 mb-1">
                                Ngày kiểm duyệt: {new Date(it.moderation.reviewedAt).toLocaleString()}
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
                                className="w-9 h-9 rounded-full flex items-center justify-center text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 transition-colors shadow-sm hover:shadow-md"
                                title="Xóa bản thu khỏi hệ thống"
                            >
                                <Trash2 className="w-4 h-4" />
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
                                    tags: it.tags ?? [],
                                    metadata: {
                                        ...((it.metadata ?? {}) as Partial<RecordingMetadata>),
                                        recordingQuality: (it.metadata?.recordingQuality ?? RecordingQuality.FIELD_RECORDING)
                                    },
                                    verificationStatus: it.verificationStatus ?? VerificationStatus.PENDING,
                                    verifiedBy: it.verifiedBy ?? undefined,
                                    viewCount: it.viewCount ?? 0,
                                    likeCount: it.likeCount ?? 0,
                                    downloadCount: it.downloadCount ?? 0,
                                }}
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
                                    tags: it.tags ?? [],
                                    metadata: {
                                        ...((it.metadata ?? {}) as Partial<RecordingMetadata>),
                                        recordingQuality: (it.metadata?.recordingQuality ?? RecordingQuality.FIELD_RECORDING)
                                    },
                                    verificationStatus: it.verificationStatus ?? VerificationStatus.PENDING,
                                    verifiedBy: it.verifiedBy ?? undefined,
                                    viewCount: it.viewCount ?? 0,
                                    likeCount: it.likeCount ?? 0,
                                    downloadCount: it.downloadCount ?? 0,
                                }}
                                onDelete={handleDelete}
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
                <h1 className="text-3xl font-bold text-neutral-800 mb-8">Quản lý bản thu đã được kiểm duyệt</h1>

                {items.length === 0 ? (
                    <div className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8" style={{ backgroundColor: '#FFFCF5' }}>
                        <h2 className="text-xl font-semibold mb-2 text-neutral-800">Không có bản thu</h2>
                        <p className="text-neutral-700">Không có bản thu nào đã được kiểm duyệt.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Bản thu do tôi duyệt */}
                        {myApproved.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                                        Bản thu do tôi duyệt
                                    </span>
                                    <span className="text-sm font-normal text-neutral-500">({myApproved.length})</span>
                                </h2>
                                <div className="space-y-6">
                                    {myApproved.map((it) => renderRecordingItem(it))}
                                </div>
                            </div>
                        )}

                        {/* Bản thu do expert khác duyệt */}
                        {othersApproved.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                                    <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                                        Bản thu do expert khác duyệt
                                    </span>
                                    <span className="text-sm font-normal text-neutral-500">({othersApproved.length})</span>
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
