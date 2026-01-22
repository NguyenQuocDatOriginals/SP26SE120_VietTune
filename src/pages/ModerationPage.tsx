import { useEffect, useState, useCallback } from "react";
import { Region, RecordingType, RecordingQuality, VerificationStatus } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { ModerationStatus } from "@/types";
import AudioPlayer from "@/components/features/AudioPlayer";
import VideoPlayer from "@/components/features/VideoPlayer";
import { isYouTubeUrl } from "@/utils/youtube";
import { migrateVideoDataToVideoData } from "@/utils/helpers";

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

interface VerificationData {
    step1?: {
        infoComplete: boolean;
        infoAccurate: boolean;
        formatCorrect: boolean;
        notes?: string;
        completedAt?: string;
    };
    step2?: {
        culturalValue: boolean;
        authenticity: boolean;
        accuracy: boolean;
        expertNotes?: string;
        completedAt?: string;
    };
    step3?: {
        crossChecked: boolean;
        sourcesVerified: boolean;
        finalApproval: boolean;
        finalNotes?: string;
        completedAt?: string;
    };
}

interface LocalRecordingMini {
    id?: string;
    title?: string; // Fallback for old format
    mediaType?: "audio" | "video" | "youtube";
    audioData?: string | null;
    videoData?: string | null;
    youtubeUrl?: string | null;
    basicInfo?: {
        title?: string;
        artist?: string;
        composer?: string;
        language?: string;
        genre?: string;
        recordingDate?: string;
        dateEstimated?: boolean;
        dateNote?: string;
        recordingLocation?: string;
    };
    culturalContext?: {
        ethnicity?: string;
        region?: string;
        province?: string;
        eventType?: string;
        performanceType?: string;
        instruments?: string[];
    };
    additionalNotes?: {
        description?: string;
        fieldNotes?: string;
        transcription?: string;
        hasLyricsFile?: boolean;
    };
    adminInfo?: {
        collector?: string;
        copyright?: string;
        archiveOrg?: string;
        catalogId?: string;
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
        verificationStep?: number;
        verificationData?: VerificationData;
    };
}

export default function ModerationPage() {
    const { user } = useAuthStore();
    const [items, setItems] = useState<LocalRecordingMini[]>([]);
    const [verificationStep, setVerificationStep] = useState<Record<string, number>>({});
    const [showVerificationDialog, setShowVerificationDialog] = useState<string | null>(null);
    const [verificationForms, setVerificationForms] = useState<Record<string, VerificationData>>({});

    const load = useCallback(() => {
        try {
            const raw = localStorage.getItem("localRecordings");
            const all = raw ? (JSON.parse(raw) as LocalRecordingMini[]) : [];
            // Migrate video data từ audioData sang videoData
            const migrated = migrateVideoDataToVideoData(all);
            // Show pending and in-review items
            const pending = migrated.filter(
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

    // Load verification data when dialog opens - đảm bảo dữ liệu được migrate
    useEffect(() => {
        if (showVerificationDialog) {
            // Reload và migrate dữ liệu khi mở dialog để đảm bảo có dữ liệu mới nhất
            try {
                const raw = localStorage.getItem("localRecordings");
                const all = raw ? (JSON.parse(raw) as LocalRecordingMini[]) : [];
                const migrated = migrateVideoDataToVideoData(all);
                const item = migrated.find(it => it.id === showVerificationDialog);

                if (item) {
                    // Cập nhật items với dữ liệu đã migrate
                    setItems(prev => {
                        const updated = prev.map(it =>
                            it.id === showVerificationDialog ? item : it
                        );
                        return updated;
                    });

                    // Only load verification data from item if not already in state (to avoid overwriting user input)
                    setVerificationForms(prev => {
                        const existing = prev[showVerificationDialog];
                        // If we already have data in state, don't overwrite it
                        if (existing) {
                            return prev;
                        }
                        // Otherwise, load from item if available
                        if (
                            item.moderation &&
                            "verificationData" in item.moderation &&
                            item.moderation.verificationData !== undefined
                        ) {
                            return {
                                ...prev,
                                [showVerificationDialog]: item.moderation.verificationData as VerificationData,
                            };
                        }
                        return prev;
                    });
                    // Always sync verification step state when dialog opens
                    const savedStep =
                        item.moderation && "verificationStep" in item.moderation && item.moderation.verificationStep !== undefined
                            ? item.moderation.verificationStep
                            : 1;
                    setVerificationStep(prev => {
                        if (prev[showVerificationDialog] !== savedStep) {
                            return {
                                ...prev,
                                [showVerificationDialog]: savedStep as number,
                            };
                        }
                        return prev;
                    });
                }
            } catch (err) {
                console.error("Error loading item for verification dialog:", err);
            }
        }
    }, [showVerificationDialog]);

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
            // Migrate video data trước khi lưu
            const migrated = migrateVideoDataToVideoData(merged);
            localStorage.setItem("localRecordings", JSON.stringify(migrated));
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
                // Start verification process - step 1
                setVerificationStep(prev => ({ ...prev, [id]: 1 }));
                // Load existing verification data if available
                const moderation = it.moderation;
                if (moderation?.verificationData) {
                    setVerificationForms(prev => ({
                        ...prev,
                        [id]: moderation.verificationData as VerificationData,
                    }));
                }
                setShowVerificationDialog(id);
                return {
                    ...it,
                    moderation: {
                        ...it.moderation,
                        status: ModerationStatus.IN_REVIEW,
                        claimedBy: user?.id,
                        claimedByName: user?.username,
                        claimedAt: new Date().toISOString(),
                        verificationStep: 1,
                    },
                };
            }
            return it;
        });
        setItems(updated);
        saveItems(updated);
    };

    const validateStep = (id: string | null, step: number): boolean => {
        if (!id) return false;
        const formData = verificationForms[id];
        if (!formData) return false;

        if (step === 1) {
            const step1 = formData.step1;
            return !!(step1?.infoComplete && step1?.infoAccurate && step1?.formatCorrect);
        }
        if (step === 2) {
            const step2 = formData.step2;
            return !!(step2?.culturalValue && step2?.authenticity && step2?.accuracy);
        }
        if (step === 3) {
            const step3 = formData.step3;
            return !!(step3?.crossChecked && step3?.sourcesVerified && step3?.finalApproval);
        }
        return false;
    };

    const getCurrentVerificationStep = (id: string | null): number => {
        if (!id) return 1;
        const item = items.find(it => it.id === id);
        return verificationStep[id] || item?.moderation?.verificationStep || 1;
    };

    const prevVerificationStep = (id?: string) => {
        if (!id) return;
        const currentStep = getCurrentVerificationStep(id);

        // Can't go back if already at step 1
        if (currentStep <= 1) return;

        const prevStep = currentStep - 1;
        setVerificationStep(prev => ({ ...prev, [id]: prevStep }));

        // Save verification data to item
        const updated = items.map((it) => {
            if (it.id === id && it.moderation?.claimedBy === user?.id) {
                const currentFormData = verificationForms[id] || {};
                return {
                    ...it,
                    moderation: {
                        ...it.moderation,
                        verificationStep: prevStep,
                        verificationData: {
                            ...(it.moderation?.verificationData || {}),
                            ...currentFormData,
                        },
                    },
                };
            }
            return it;
        });
        setItems(updated);
        saveItems(updated);
    };

    const nextVerificationStep = (id?: string) => {
        if (!id) return;
        const currentStep = getCurrentVerificationStep(id);

        // Validate current step before proceeding
        if (!validateStep(id, currentStep)) {
            alert(`Vui lòng hoàn thành tất cả các yêu cầu bắt buộc ở Bước ${currentStep} trước khi tiếp tục!`);
            return;
        }

        if (currentStep < 3) {
            const nextStep = currentStep + 1;
            setVerificationStep(prev => ({ ...prev, [id]: nextStep }));

            // Save verification data to item
            const updated = items.map((it) => {
                if (it.id === id && it.moderation?.claimedBy === user?.id) {
                    const currentFormData = verificationForms[id] || {};
                    return {
                        ...it,
                        moderation: {
                            ...it.moderation,
                            verificationStep: nextStep,
                            verificationData: {
                                ...(it.moderation?.verificationData || {}),
                                ...currentFormData,
                            },
                        },
                    };
                }
                return it;
            });
            setItems(updated);
            saveItems(updated);
        } else {
            // Step 3 completed - automatically approve
            const updated = items.map((it) => {
                if (it.id === id && it.moderation?.claimedBy === user?.id) {
                    const currentFormData = verificationForms[id] || {};
                    // Automatically approve when all 3 steps are completed
                    setVerificationStep(prev => {
                        const newState = { ...prev };
                        delete newState[id];
                        return newState;
                    });
                    setVerificationForms(prev => {
                        const newState = { ...prev };
                        delete newState[id];
                        return newState;
                    });
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
                            verificationStep: undefined,
                            verificationData: {
                                ...(it.moderation?.verificationData || {}),
                                ...currentFormData,
                            },
                        },
                    };
                }
                return it;
            });
            setItems(updated);
            saveItems(updated);
            setShowVerificationDialog(null);
        }
    };

    const updateVerificationForm = (id: string | null, step: number, field: string, value: boolean | string) => {
        if (!id) return;
        setVerificationForms(prev => {
            const current = prev[id] || {};
            const stepData = current[`step${step}` as keyof VerificationData] || {};
            return {
                ...prev,
                [id]: {
                    ...current,
                    [`step${step}`]: {
                        ...stepData,
                        [field]: value,
                        completedAt: new Date().toISOString(),
                    },
                },
            };
        });
    };

    const cancelVerification = (id?: string) => {
        if (!id) return;
        // Cancel verification - return to PENDING_REVIEW
        setVerificationStep(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
        });
        setVerificationForms(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
        });
        setShowVerificationDialog(null);
        const updated = items.map((it) => {
            if (it.id === id && it.moderation?.claimedBy === user?.id) {
                return {
                    ...it,
                    moderation: {
                        ...it.moderation,
                        status: ModerationStatus.PENDING_REVIEW,
                        claimedBy: null,
                        claimedByName: null,
                        claimedAt: null,
                        verificationStep: undefined,
                        verificationData: undefined,
                    },
                };
            }
            return it;
        });
        setItems(updated);
        saveItems(updated);
    };

    // Approve function is no longer needed - approval happens automatically after step 3

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
                                        {it.basicInfo?.artist && (
                                            <div className="text-sm text-neutral-600 mb-1">Nghệ sĩ: {it.basicInfo.artist}</div>
                                        )}
                                        <div className="text-sm text-neutral-600 mb-1">Người đóng góp: {it.uploader?.username || 'Khách'}</div>
                                        <div className="text-sm text-neutral-500 mb-1">Ngày tải: {it.uploadedAt ? new Date(it.uploadedAt).toLocaleString() : '-'}</div>
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

                                        {it.moderation?.status === ModerationStatus.IN_REVIEW && it.moderation?.claimedBy !== user?.id && (
                                            <button disabled className="px-3 py-2 rounded-full bg-neutral-200 text-neutral-500">Đã được nhận</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Verification Dialog */}
                {showVerificationDialog && (() => {
                    // Đảm bảo lấy dữ liệu mới nhất từ localStorage với migration
                    let item = items.find(it => it.id === showVerificationDialog);
                    if (!item) {
                        // Nếu không tìm thấy trong items, thử load từ localStorage
                        try {
                            const raw = localStorage.getItem("localRecordings");
                            const all = raw ? (JSON.parse(raw) as LocalRecordingMini[]) : [];
                            const migrated = migrateVideoDataToVideoData(all);
                            item = migrated.find(it => it.id === showVerificationDialog);
                        } catch (err) {
                            console.error("Error loading item:", err);
                        }
                    }
                    if (!item) return null;

                    // Debug log để kiểm tra dữ liệu
                    console.log('ModerationPage - Item data for dialog:', {
                        id: item.id,
                        mediaType: item.mediaType,
                        hasVideoData: !!item.videoData,
                        videoDataLength: item.videoData ? item.videoData.length : 0,
                        hasAudioData: !!item.audioData,
                        audioDataLength: item.audioData ? item.audioData.length : 0,
                        hasYoutubeUrl: !!item.youtubeUrl,
                    });
                    const currentStep = getCurrentVerificationStep(showVerificationDialog);
                    const stepNames = [
                        "Bước 1: Kiểm tra sơ bộ",
                        "Bước 2: Xác minh chuyên môn",
                        "Bước 3: Đối chiếu và phê duyệt"
                    ];
                    const stepDescriptions = [
                        "Đánh giá tính đầy đủ và phù hợp của thông tin",
                        "Đánh giá bởi chuyên gia về tính chính xác và giá trị văn hóa",
                        "Đối chiếu với các nguồn tài liệu và quyết định phê duyệt"
                    ];
                    return (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                            <div className="rounded-2xl shadow-xl border border-neutral-300 max-w-5xl w-full overflow-hidden flex flex-col" style={{ backgroundColor: '#FFF2D6' }}>
                                {/* Header */}
                                <div className="flex items-center justify-center p-6 border-b border-neutral-200 bg-primary-600">
                                    <h2 className="text-2xl font-bold text-white">{stepNames[currentStep - 1]}</h2>
                                </div>

                                {/* Content */}
                                <div className="overflow-y-auto p-6 max-h-[70vh]">
                                    <div className="space-y-6">
                                        {/* Media Player Section */}
                                        <div className="rounded-2xl shadow-md border border-neutral-200 p-6" style={{ backgroundColor: '#FFFCF5' }}>
                                            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Bản thu</h3>
                                            {(() => {
                                                // Tìm nguồn media - VideoPlayer CHỈ nhận videoData hoặc YouTubeURL, AudioPlayer CHỈ nhận audioData
                                                let mediaSrc: string | undefined;
                                                let isVideo = false;

                                                // Kiểm tra YouTube URL trước (cho VideoPlayer)
                                                if (item.mediaType === "youtube" && item.youtubeUrl && item.youtubeUrl.trim()) {
                                                    mediaSrc = item.youtubeUrl.trim();
                                                    isVideo = true;
                                                } else if (item.youtubeUrl && typeof item.youtubeUrl === 'string' && item.youtubeUrl.trim() && isYouTubeUrl(item.youtubeUrl)) {
                                                    // Fallback: nếu có YouTube URL nhưng mediaType chưa được set đúng
                                                    mediaSrc = item.youtubeUrl.trim();
                                                    isVideo = true;
                                                }
                                                // Nếu là video, CHỈ dùng videoData (không fallback về audioData)
                                                else if (item.mediaType === "video") {
                                                    if (item.videoData && typeof item.videoData === 'string' && item.videoData.trim().length > 0) {
                                                        mediaSrc = item.videoData;
                                                        isVideo = true;
                                                    }
                                                    // Không fallback về audioData - VideoPlayer chỉ phát videoData
                                                }
                                                // Nếu là audio, CHỈ dùng audioData
                                                else if (item.mediaType === "audio") {
                                                    if (item.audioData && typeof item.audioData === 'string' && item.audioData.trim().length > 0) {
                                                        mediaSrc = item.audioData;
                                                        isVideo = false;
                                                    }
                                                }
                                                // Nếu mediaType chưa được set, thử phát hiện từ dữ liệu có sẵn
                                                else {
                                                    // Ưu tiên videoData nếu có
                                                    if (item.videoData && typeof item.videoData === 'string' && item.videoData.trim().length > 0) {
                                                        mediaSrc = item.videoData;
                                                        isVideo = true;
                                                    }
                                                    // Sau đó thử audioData
                                                    else if (item.audioData && typeof item.audioData === 'string' && item.audioData.trim().length > 0) {
                                                        mediaSrc = item.audioData;
                                                        // Kiểm tra xem có phải video không bằng cách xem data URL
                                                        if (mediaSrc.startsWith('data:video/')) {
                                                            isVideo = true;
                                                        } else {
                                                            isVideo = false;
                                                        }
                                                    }
                                                }

                                                // Nếu không có mediaSrc, hiển thị thông báo chi tiết
                                                if (!mediaSrc || mediaSrc.trim().length === 0) {
                                                    return (
                                                        <div className="space-y-2">
                                                            <p className="text-neutral-500">Không có bản thu nào để phát</p>
                                                            <p className="text-xs text-neutral-400">
                                                                MediaType: {item.mediaType || 'Không xác định'} |
                                                                YouTube URL: {item.youtubeUrl ? 'Có' : 'Không'} |
                                                                VideoData: {item.videoData ? `Có (${item.videoData.length} ký tự)` : 'Không'} |
                                                                AudioData: {item.audioData ? `Có (${item.audioData.length} ký tự)` : 'Không'}
                                                            </p>
                                                            {item.mediaType === "video" && !item.videoData && (
                                                                <p className="text-xs text-red-400 mt-2">
                                                                    ⚠️ Video cần có videoData để phát. Vui lòng đợi migration hoàn tất hoặc liên hệ admin.
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                }

                                                // Hiển thị VideoPlayer cho video/YouTube
                                                // Convert LocalRecordingMini to Recording for type safety
                                                const convertedRecording = {
                                                    id: item.id ?? "",
                                                    title: item.basicInfo?.title || item.title || "Không có tiêu đề",
                                                    titleVietnamese: item.basicInfo?.title || item.title || "Không có tiêu đề",
                                                    description: "Bản thu đang chờ kiểm duyệt",
                                                    ethnicity: {
                                                        id: "local",
                                                        name: item.culturalContext?.ethnicity || "Không xác định",
                                                        nameVietnamese: item.culturalContext?.ethnicity || "Không xác định",
                                                        region: (() => {
                                                            const regionKey = item.culturalContext?.region as keyof typeof Region;
                                                            return Region[regionKey] ?? Region.RED_RIVER_DELTA;
                                                        })(),
                                                        recordingCount: 0,
                                                    },
                                                    region: (() => {
                                                        const regionKey = item.culturalContext?.region as keyof typeof Region;
                                                        return Region[regionKey] ?? Region.RED_RIVER_DELTA;
                                                    })(),
                                                    recordingType: RecordingType.OTHER,
                                                    duration: 0,
                                                    audioUrl: item.audioData ?? "",
                                                    instruments: [],
                                                    performers: [],
                                                    uploadedDate: item.uploadedAt || new Date().toISOString(),
                                                    uploader: {
                                                        id: item.uploader?.id || "local-user",
                                                        username: item.uploader?.username || "Khách",
                                                        email: "",
                                                        fullName: item.uploader?.username || "Khách",
                                                        role: "USER" as import("@/types").UserRole,
                                                        createdAt: new Date().toISOString(),
                                                        updatedAt: new Date().toISOString(),
                                                    },
                                                    tags: [item.basicInfo?.genre || ""].filter(Boolean),
                                                    metadata: { recordingQuality: RecordingQuality.FIELD_RECORDING, lyrics: "" },
                                                    verificationStatus: item.moderation?.status === "APPROVED" ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
                                                    viewCount: 0,
                                                    likeCount: 0,
                                                    downloadCount: 0,
                                                };
                                                if (isVideo) {
                                                    return (
                                                        <VideoPlayer
                                                            src={mediaSrc}
                                                            title={item.basicInfo?.title || item.title}
                                                            artist={item.basicInfo?.artist}
                                                            recording={convertedRecording}
                                                            showContainer={true}
                                                        />
                                                    );
                                                }

                                                // Hiển thị AudioPlayer cho audio
                                                return (
                                                    <AudioPlayer
                                                        src={mediaSrc}
                                                        title={item.basicInfo?.title || item.title}
                                                        artist={item.basicInfo?.artist}
                                                        recording={convertedRecording}
                                                        showContainer={true}
                                                    />
                                                );
                                            })()}
                                        </div>

                                        {/* Basic Information */}
                                        <div className="rounded-2xl shadow-md border border-neutral-200 p-6" style={{ backgroundColor: '#FFFCF5' }}>
                                            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Thông tin cơ bản</h3>
                                            <div className="space-y-2 text-sm">
                                                <div><strong>Tiêu đề:</strong> {item.basicInfo?.title || item.title || 'Không có'}</div>
                                                {item.basicInfo?.artist && <div><strong>Nghệ sĩ:</strong> {item.basicInfo.artist}</div>}
                                                {item.basicInfo?.composer && <div><strong>Tác giả/Nhạc sĩ:</strong> {item.basicInfo.composer}</div>}
                                                {item.basicInfo?.language && <div><strong>Ngôn ngữ:</strong> {item.basicInfo.language}</div>}
                                                {item.basicInfo?.genre && <div><strong>Thể loại:</strong> {item.basicInfo.genre}</div>}
                                                {item.basicInfo?.recordingDate && (
                                                    <div>
                                                        <strong>Ngày thu:</strong> {item.basicInfo.recordingDate}
                                                        {item.basicInfo.dateEstimated && <span className="text-neutral-500"> (Ước tính)</span>}
                                                    </div>
                                                )}
                                                {item.basicInfo?.dateNote && <div><strong>Ghi chú ngày:</strong> {item.basicInfo.dateNote}</div>}
                                                {item.basicInfo?.recordingLocation && <div><strong>Địa điểm thu:</strong> {item.basicInfo.recordingLocation}</div>}
                                            </div>
                                        </div>

                                        {/* Cultural Context */}
                                        {item.culturalContext && (
                                            <div className="rounded-2xl shadow-md border border-neutral-200 p-6" style={{ backgroundColor: '#FFFCF5' }}>
                                                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Bối cảnh văn hóa</h3>
                                                <div className="space-y-2 text-sm">
                                                    {item.culturalContext.ethnicity && <div><strong>Dân tộc:</strong> {item.culturalContext.ethnicity}</div>}
                                                    {item.culturalContext.region && <div><strong>Vùng:</strong> {item.culturalContext.region}</div>}
                                                    {item.culturalContext.province && <div><strong>Tỉnh/Thành phố:</strong> {item.culturalContext.province}</div>}
                                                    {item.culturalContext.eventType && <div><strong>Loại sự kiện:</strong> {item.culturalContext.eventType}</div>}
                                                    {item.culturalContext.performanceType && <div><strong>Loại biểu diễn:</strong> {item.culturalContext.performanceType}</div>}
                                                    {item.culturalContext.instruments && item.culturalContext.instruments.length > 0 && (
                                                        <div><strong>Nhạc cụ:</strong> {item.culturalContext.instruments.join(", ")}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Notes */}
                                        {item.additionalNotes && (
                                            <div className="rounded-2xl shadow-md border border-neutral-200 p-6" style={{ backgroundColor: '#FFFCF5' }}>
                                                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Ghi chú bổ sung</h3>
                                                <div className="space-y-2 text-sm">
                                                    {item.additionalNotes.description && (
                                                        <div>
                                                            <strong>Mô tả:</strong>
                                                            <p className="text-neutral-700 mt-1 whitespace-pre-wrap">{item.additionalNotes.description}</p>
                                                        </div>
                                                    )}
                                                    {item.additionalNotes.fieldNotes && (
                                                        <div>
                                                            <strong>Ghi chú thực địa:</strong>
                                                            <p className="text-neutral-700 mt-1 whitespace-pre-wrap">{item.additionalNotes.fieldNotes}</p>
                                                        </div>
                                                    )}
                                                    {item.additionalNotes.transcription && (
                                                        <div>
                                                            <strong>Phiên âm:</strong>
                                                            <p className="text-neutral-700 mt-1 whitespace-pre-wrap">{item.additionalNotes.transcription}</p>
                                                        </div>
                                                    )}
                                                    {item.additionalNotes.hasLyricsFile && <div><strong>Có file lời bài hát:</strong> Có</div>}
                                                </div>
                                            </div>
                                        )}

                                        {/* Admin Info */}
                                        {item.adminInfo && (
                                            <div className="rounded-2xl shadow-md border border-neutral-200 p-6" style={{ backgroundColor: '#FFFCF5' }}>
                                                <h3 className="text-lg font-semibold text-neutral-800 mb-4">Thông tin quản trị</h3>
                                                <div className="space-y-2 text-sm">
                                                    {item.adminInfo.collector && <div><strong>Người thu thập:</strong> {item.adminInfo.collector}</div>}
                                                    {item.adminInfo.copyright && <div><strong>Bản quyền:</strong> {item.adminInfo.copyright}</div>}
                                                    {item.adminInfo.archiveOrg && <div><strong>Archive.org:</strong> {item.adminInfo.archiveOrg}</div>}
                                                    {item.adminInfo.catalogId && <div><strong>Mã catalog:</strong> {item.adminInfo.catalogId}</div>}
                                                </div>
                                            </div>
                                        )}

                                        {/* Verification Form Section */}
                                        <div className="rounded-2xl shadow-md border border-neutral-200 p-6" style={{ backgroundColor: '#FFFCF5' }}>
                                            <div className="mb-4">
                                                <p className="text-neutral-700 mb-4">{stepDescriptions[currentStep - 1]}</p>

                                                {/* Progress indicator */}
                                                <div className="flex items-center gap-2 mb-6">
                                                    {[1, 2, 3].map((step) => (
                                                        <div key={step} className="flex-1">
                                                            <div className={`h-2 rounded-full ${step <= currentStep ? 'bg-primary-600' : 'bg-neutral-200'}`} />
                                                            <div className="text-xs text-center mt-1 text-neutral-600">Bước {step}</div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Validation message */}
                                                {!validateStep(showVerificationDialog, currentStep) && (
                                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                        <p className="text-sm text-red-600 font-medium">
                                                            Vui lòng hoàn thành tất cả các yêu cầu bắt buộc
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Step 1 Form */}
                                            {currentStep === 1 && showVerificationDialog && (
                                                <div className="space-y-4">
                                                    <h3 className="font-semibold text-neutral-800 mb-3">Yêu cầu kiểm tra (Tất cả đều bắt buộc):</h3>
                                                    <div className="space-y-3">
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step1?.infoComplete || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 1, 'infoComplete', e.target.checked)}
                                                                className="mt-1 h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Thông tin đầy đủ: Tiêu đề, nghệ sĩ, ngày thu, địa điểm, dân tộc, thể loại đã được điền đầy đủ</span>
                                                        </label>
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step1?.infoAccurate || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 1, 'infoAccurate', e.target.checked)}
                                                                className="mt-1 h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Thông tin chính xác: Các thông tin cơ bản phù hợp và không có mâu thuẫn</span>
                                                        </label>
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step1?.formatCorrect || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 1, 'formatCorrect', e.target.checked)}
                                                                className="mt-1 h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Định dạng đúng: File media hợp lệ, chất lượng đạt yêu cầu tối thiểu</span>
                                                        </label>
                                                    </div>
                                                    <div className="mt-4">
                                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                            Ghi chú kiểm tra sơ bộ <span className="text-neutral-500">(Tùy chọn)</span>
                                                        </label>
                                                        <textarea
                                                            value={verificationForms[showVerificationDialog]?.step1?.notes || ''}
                                                            onChange={(e) => updateVerificationForm(showVerificationDialog, 1, 'notes', e.target.value)}
                                                            rows={3}
                                                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                            placeholder="Ghi chú về các vấn đề cần lưu ý hoặc cần bổ sung..."
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 2 Form */}
                                            {currentStep === 2 && showVerificationDialog && (
                                                <div className="space-y-4">
                                                    <h3 className="font-semibold text-neutral-800 mb-3">Đánh giá chuyên môn (Tất cả đều bắt buộc):</h3>
                                                    <div className="space-y-3">
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step2?.culturalValue || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 2, 'culturalValue', e.target.checked)}
                                                                className="mt-1 h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Giá trị văn hóa: Bản thu có giá trị văn hóa, lịch sử hoặc nghệ thuật đáng kể</span>
                                                        </label>
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step2?.authenticity || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 2, 'authenticity', e.target.checked)}
                                                                className="mt-1 h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Tính xác thực: Bản thu là bản gốc, không phải bản sao chép hoặc chỉnh sửa không được phép</span>
                                                        </label>
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step2?.accuracy || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 2, 'accuracy', e.target.checked)}
                                                                className="mt-1 h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Độ chính xác: Thông tin về dân tộc, thể loại, phong cách phù hợp với nội dung bản thu</span>
                                                        </label>
                                                    </div>
                                                    <div className="mt-4">
                                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                            Đánh giá chuyên môn <span className="text-neutral-500">(Tùy chọn)</span>
                                                        </label>
                                                        <textarea
                                                            value={verificationForms[showVerificationDialog]?.step2?.expertNotes || ''}
                                                            onChange={(e) => updateVerificationForm(showVerificationDialog, 2, 'expertNotes', e.target.value)}
                                                            rows={4}
                                                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                            placeholder="Đánh giá chi tiết về giá trị văn hóa, tính xác thực, và độ chính xác của bản thu..."
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 3 Form */}
                                            {currentStep === 3 && showVerificationDialog && (
                                                <div className="space-y-4">
                                                    <h3 className="font-semibold text-neutral-800 mb-3">Đối chiếu và phê duyệt cuối cùng (Tất cả đều bắt buộc):</h3>
                                                    <div className="space-y-3">
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step3?.crossChecked || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 3, 'crossChecked', e.target.checked)}
                                                                className="mt-1 h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Đã đối chiếu: Đã kiểm tra và đối chiếu với các nguồn tài liệu, cơ sở dữ liệu liên quan</span>
                                                        </label>
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step3?.sourcesVerified || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 3, 'sourcesVerified', e.target.checked)}
                                                                className="mt-1 h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Nguồn đã xác minh: Nguồn gốc, người thu thập, quyền sở hữu đã được xác minh</span>
                                                        </label>
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step3?.finalApproval || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 3, 'finalApproval', e.target.checked)}
                                                                className="mt-1 h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Xác nhận phê duyệt: Tôi xác nhận đã hoàn thành tất cả các bước kiểm tra và đồng ý phê duyệt bản thu này</span>
                                                        </label>
                                                    </div>
                                                    <div className="mt-4">
                                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                            Ghi chú cuối cùng <span className="text-neutral-500">(Tùy chọn)</span>
                                                        </label>
                                                        <textarea
                                                            value={verificationForms[showVerificationDialog]?.step3?.finalNotes || ''}
                                                            onChange={(e) => updateVerificationForm(showVerificationDialog, 3, 'finalNotes', e.target.value)}
                                                            rows={4}
                                                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                            placeholder="Ghi chú cuối cùng về quá trình kiểm duyệt, các điểm đáng chú ý..."
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between gap-4 p-6 border-t border-neutral-200 bg-neutral-50/50">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => cancelVerification(showVerificationDialog)}
                                            className="px-6 py-2.5 bg-red-600 text-white rounded-full font-medium hover:bg-red-500 transition-colors shadow-sm hover:shadow-md"
                                        >
                                            Hủy nhận kiểm duyệt
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (showVerificationDialog) {
                                                    reject(showVerificationDialog);
                                                    setShowVerificationDialog(null);
                                                }
                                            }}
                                            className="px-6 py-2.5 bg-red-600 text-white rounded-full font-medium hover:bg-red-500 transition-colors shadow-sm hover:shadow-md"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {currentStep > 1 && (
                                            <button
                                                onClick={() => prevVerificationStep(showVerificationDialog)}
                                                className="px-6 py-2.5 bg-neutral-500 text-white rounded-full font-medium hover:bg-neutral-400 transition-colors shadow-sm hover:shadow-md"
                                            >
                                                Quay lại (Bước {currentStep - 1})
                                            </button>
                                        )}
                                        {currentStep < 3 ? (
                                            <button
                                                onClick={() => nextVerificationStep(showVerificationDialog)}
                                                disabled={!validateStep(showVerificationDialog, currentStep)}
                                                className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-500 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Tiếp tục (Bước {currentStep + 1})
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    if (showVerificationDialog) {
                                                        nextVerificationStep(showVerificationDialog);
                                                    }
                                                }}
                                                disabled={!validateStep(showVerificationDialog, currentStep)}
                                                className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-500 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Hoàn thành xác minh
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
