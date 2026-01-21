import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ModerationStatus } from "@/types";

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

interface LocalRecordingMini {
    id?: string;
    title?: string; // Fallback for old format
    basicInfo?: {
        title?: string;
        artist?: string;
        genre?: string;
    };
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

export default function ModerationPage() {
    const { user } = useAuthStore();
    const [items, setItems] = useState<LocalRecordingMini[]>([]);

    const load = useCallback(() => {
        try {
            const raw = localStorage.getItem("localRecordings");
            const all = raw ? (JSON.parse(raw) as LocalRecordingMini[]) : [];
            // Show pending and in-review items
            const pending = all.filter(
                (r) =>
                    r.moderation?.status === ModerationStatus.PENDING_REVIEW ||
                    r.moderation?.status === ModerationStatus.IN_REVIEW,
            );
            setItems(pending);
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

    if (!user || user.role !== "EXPERT") {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
                <div className="text-center">
                    <h1 className="text-9xl font-bold text-primary-600">403</h1>
                    <h2 className="text-3xl font-semibold text-neutral-800 mb-4">Truy cập bị từ chối</h2>
                    <p className="text-neutral-600 mb-8">Bạn cần tài khoản <strong>Chuyên gia</strong> để truy cập trang kiểm duyệt bản thu.</p>
                    <a href="/" className="btn-liquid-glass-primary inline-block">Về trang chủ</a>
                </div>
            </div>
        );
    }

    const saveItems = (updated: LocalRecordingMini[]) => {
        try {
            const raw = localStorage.getItem("localRecordings");
            const all = raw ? (JSON.parse(raw) as LocalRecordingMini[]) : [];
            // Merge by id: replace items that match updated IDs
            const updatedMap = new Map(updated.map((i) => [i.id, i]));
            const merged = all.map((r) => (updatedMap.has(r.id) ? (updatedMap.get(r.id) as LocalRecordingMini) : r));
            localStorage.setItem("localRecordings", JSON.stringify(merged));
            load();
        } catch (err) {
            console.error(err);
        }
    };

    const claim = (id?: string) => {
        if (!id) return;
        const updated = items.map((it) => {
            if (it.id === id) {
                // If already claimed by another, block
                if (it.moderation?.status === ModerationStatus.IN_REVIEW && it.moderation?.claimedBy && it.moderation.claimedBy !== user?.id) {
                    return it;
                }
                return {
                    ...it,
                    moderation: {
                        ...it.moderation,
                        status: ModerationStatus.IN_REVIEW,
                        claimedBy: user?.id,
                        claimedByName: user?.username,
                        claimedAt: new Date().toISOString(),
                    },
                };
            }
            return it;
        });
        setItems(updated);
        saveItems(updated);
    };

    const release = (id?: string) => {
        if (!id) return;
        const updated = items.map((it) => {
            if (it.id === id) {
                // Only the claimer can release
                if (it.moderation?.claimedBy !== user?.id) {
                    return it;
                }
                return {
                    ...it,
                    moderation: {
                        ...it.moderation,
                        status: ModerationStatus.PENDING_REVIEW,
                        claimedBy: null,
                        claimedByName: null,
                        claimedAt: null,
                    },
                };
            }
            return it;
        });
        setItems(updated);
        saveItems(updated);
    };

    const approve = (id?: string) => {
        if (!id) return;
        const updated = items.map((it) => {
            if (it.id === id) {
                if (it.moderation?.claimedBy !== user?.id) {
                    return it;
                }
                return {
                    ...it,
                    moderation: {
                        ...it.moderation,
                        status: ModerationStatus.APPROVED,
                        reviewerId: user?.id,
                        reviewerName: user?.username,
                        reviewedAt: new Date().toISOString(),
                        claimedBy: null,
                        claimedByName: null,
                    },
                };
            }
            return it;
        });
        setItems(updated);
        saveItems(updated);
    };

    const reject = (id?: string) => {
        if (!id) return;
        const updated = items.map((it) => {
            if (it.id === id) {
                if (it.moderation?.claimedBy !== user?.id) {
                    return it;
                }
                return {
                    ...it,
                    moderation: {
                        ...it.moderation,
                        status: ModerationStatus.REJECTED,
                        reviewerId: user?.id,
                        reviewerName: user?.username,
                        reviewedAt: new Date().toISOString(),
                        claimedBy: null,
                        claimedByName: null,
                    },
                };
            }
            return it;
        });
        setItems(updated);
        saveItems(updated);
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-neutral-800 mb-8">Kiểm duyệt bản thu</h1>

                {items.length === 0 ? (
                    <div className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8" style={{ backgroundColor: '#FFFCF5' }}>
                        <h2 className="text-xl font-semibold mb-2 text-neutral-800">Không có bản thu</h2>
                        <p className="text-neutral-700">Không có bản thu đang chờ được kiểm duyệt.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {items.map((it) => (
                            <div key={it.id} className="rounded-2xl shadow-md border border-neutral-200 p-8" style={{ backgroundColor: '#FFFCF5' }}>
                                <div className="md:flex md:items-start md:justify-between">
                                    <div className="md:flex-1">
                                        <div className="text-neutral-800 font-semibold text-lg mb-1">
                                            {it.basicInfo?.title || it.title || 'Không có tiêu đề'}
                                        </div>
                                        <div className="text-sm text-neutral-600 mb-1">Người đóng góp: {it.uploader?.username || 'Khách'}</div>
                                        <div className="text-sm text-neutral-500">Ngày tải: {it.uploadedAt ? new Date(it.uploadedAt).toLocaleString() : '-'}</div>
                                        <div className="text-sm mt-2">
                                            Trạng thái: <span className="font-medium">{getStatusLabel(it.moderation?.status)}</span>
                                            {it.moderation?.status === ModerationStatus.IN_REVIEW && it.moderation?.claimedByName && (
                                                <span> — Đang được kiểm duyệt bởi {it.moderation.claimedByName}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-wrap gap-2 md:flex-col md:items-end">
                                        {it.moderation?.status === ModerationStatus.PENDING_REVIEW && (
                                            <button onClick={() => claim(it.id)} className="px-3 py-2 rounded-full bg-primary-600 text-white">Nhận kiểm duyệt</button>
                                        )}

                                        {it.moderation?.status === ModerationStatus.IN_REVIEW && it.moderation?.claimedBy === user?.id && (
                                            <>
                                                <button onClick={() => approve(it.id)} className="px-3 py-2 rounded-full bg-green-600 text-white">Kiểm duyệt</button>
                                                <button onClick={() => reject(it.id)} className="px-3 py-2 rounded-full bg-red-600 text-white">Từ chối</button>
                                                <button onClick={() => release(it.id)} className="px-3 py-2 rounded-full bg-secondary-100 text-secondary-700">Hủy nhận kiểm duyệt</button>
                                            </>
                                        )}

                                        {it.moderation?.status === ModerationStatus.IN_REVIEW && it.moderation?.claimedBy !== user?.id && (
                                            <button disabled className="px-3 py-2 rounded-full bg-neutral-200 text-neutral-500">Đã được nhận</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
