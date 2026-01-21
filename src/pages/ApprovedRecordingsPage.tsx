import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ModerationStatus } from "@/types";
import AudioPlayer from "@/components/features/AudioPlayer";

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
        default:
            return String(status);
    }
};

interface LocalRecording {
    id?: string;
    title?: string; // Fallback for old format
    basicInfo?: {
        title?: string;
        artist?: string;
        genre?: string;
    };
    audioData?: string | null;
    youtubeUrl?: string | null;
    mediaType?: "audio" | "video" | "youtube";
    uploadedAt?: string;
    uploader?: { id?: string; username?: string };
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
            // Show only approved items
            const approved = all.filter(
                (r) => r.moderation?.status === ModerationStatus.APPROVED,
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

    const handleDelete = (id: string) => {
        try {
            const raw = localStorage.getItem("localRecordings");
            const all = raw ? (JSON.parse(raw) as LocalRecording[]) : [];
            const filtered = all.filter((r) => r.id !== id);
            localStorage.setItem("localRecordings", JSON.stringify(filtered));
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
                    <div className="space-y-6">
                        {items.map((it) => {
                            // Xác định src cho AudioPlayer
                            let audioSrc: string | undefined;
                            if (it.mediaType === "youtube" && it.youtubeUrl) {
                                audioSrc = it.youtubeUrl;
                            } else if (it.audioData) {
                                audioSrc = it.audioData;
                            }

                            return (
                                <div key={it.id} className="rounded-2xl shadow-md border border-neutral-200 p-8" style={{ backgroundColor: '#FFFCF5' }}>
                                    <div className="mb-4">
                                        <div className="text-neutral-800 font-semibold text-lg mb-1">
                                            {it.basicInfo?.title || it.title || 'Không có tiêu đề'}
                                        </div>
                                        <div className="text-sm text-neutral-600 mb-1">
                                            Nghệ sĩ: {it.basicInfo?.artist || 'Không rõ'}
                                        </div>
                                        <div className="text-sm text-neutral-600 mb-1">
                                            Người đóng góp: {it.uploader?.username || 'Khách'}
                                        </div>
                                        <div className="text-sm text-neutral-500 mb-1">
                                            Ngày tải: {it.uploadedAt ? new Date(it.uploadedAt).toLocaleString() : '-'}
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

                                    {/* AudioPlayer */}
                                    {audioSrc && (
                                        <div className="mt-4">
                                            <AudioPlayer
                                                src={audioSrc}
                                                title={it.basicInfo?.title || it.title}
                                                artist={it.basicInfo?.artist}
                                                recording={it}
                                                onDelete={handleDelete}
                                                showContainer={true}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
