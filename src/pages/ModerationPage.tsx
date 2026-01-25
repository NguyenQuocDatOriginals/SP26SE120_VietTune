import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Region, RecordingType, RecordingQuality, VerificationStatus, Recording, User, UserRole, RecordingMetadata } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { ModerationStatus } from "@/types";
import AudioPlayer from "@/components/features/AudioPlayer";
import VideoPlayer from "@/components/features/VideoPlayer";
import { isYouTubeUrl } from "@/utils/youtube";
import { migrateVideoDataToVideoData, formatDateTime } from "@/utils/helpers";
import { createPortal } from "react-dom";
import { ChevronDown, Search, AlertCircle, X } from "lucide-react";
import BackButton from "@/components/common/BackButton";

// ===== UTILITY FUNCTIONS =====
// Check if click is on scrollbar
const isClickOnScrollbar = (event: MouseEvent): boolean => {
    const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
    if (
        scrollbarWidth > 0 &&
        event.clientX >= document.documentElement.clientWidth
    ) {
        return true;
    }
    return false;
};

// ===== REUSABLE COMPONENTS =====
function SearchableDropdown({
    value,
    onChange,
    options,
    placeholder = "-- Chọn --",
    searchable = true,
    disabled = false,
}: {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    placeholder?: string;
    searchable?: boolean;
    disabled?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

    const filteredOptions = useMemo(() => {
        if (!search) return options;
        return options.filter((opt) =>
            opt.toLowerCase().includes(search.toLowerCase()),
        );
    }, [options, search]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isClickOnScrollbar(event)) return;
            const target = event.target as Node;
            const clickedOutsideDropdown =
                dropdownRef.current && !dropdownRef.current.contains(target);
            const clickedOutsideMenu =
                menuRef.current && !menuRef.current.contains(target);
            if (
                clickedOutsideDropdown &&
                (menuRef.current ? clickedOutsideMenu : true)
            ) {
                setIsOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const updateRect = () => {
            if (buttonRef.current)
                setMenuRect(buttonRef.current.getBoundingClientRect());
        };
        if (isOpen) updateRect();
        window.addEventListener("resize", updateRect);
        window.addEventListener("scroll", updateRect, true);
        return () => {
            window.removeEventListener("resize", updateRect);
            window.removeEventListener("scroll", updateRect, true);
        };
    }, [isOpen]);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full px-5 py-3 pr-10 text-neutral-900 border border-neutral-400 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-left flex items-center justify-between ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                style={{ backgroundColor: "#FFFCF5" }}
            >
                <span className={value ? "text-neutral-900" : "text-neutral-400"}>
                    {value || placeholder}
                </span>
                <ChevronDown
                    className={`h-5 w-5 text-neutral-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {isOpen &&
                menuRect &&
                createPortal(
                    <div
                        ref={(el) => (menuRef.current = el)}
                        className="rounded-2xl border border-neutral-300/80 shadow-xl backdrop-blur-sm overflow-hidden transition-all duration-300"
                        style={{
                            backgroundColor: "#FFFCF5",
                            position: "absolute",
                            left: Math.max(8, menuRect.left + (window.scrollX ?? 0)),
                            top: menuRect.bottom + (window.scrollY ?? 0) + 8,
                            width: menuRect.width,
                            zIndex: 40,
                        }}
                    >
                        {searchable && (
                            <div className="p-3 border-b border-neutral-200">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Tìm kiếm..."
                                        className="w-full pl-9 pr-3 py-2 text-neutral-900 placeholder-neutral-500 border border-neutral-400 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                        style={{ backgroundColor: "#FFFCF5" }}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}
                        <div
                            className="max-h-60 overflow-y-auto"
                            style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "#9B2C2C rgba(255, 255, 255, 0.3)",
                            }}
                        >
                            {filteredOptions.length === 0 ? (
                                <div className="px-5 py-3 text-neutral-400 text-sm text-center">
                                    Không tìm thấy kết quả
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => {
                                            onChange(option);
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                        className={`w-full px-5 py-3 text-left text-sm transition-colors ${value === option
                                            ? "bg-primary-600 text-white font-medium"
                                            : "text-neutral-900 hover:bg-primary-100 hover:text-primary-700"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}

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
        rejectionNote?: string;
    };
}

// Extended Recording type that may include original local data
type RecordingWithLocalData = Recording & {
  _originalLocalData?: LocalRecordingMini & {
    culturalContext?: {
      region?: string;
    };
  };
};

export default function ModerationPage() {
    const { user } = useAuthStore();
    const [items, setItems] = useState<LocalRecordingMini[]>([]);
    const [allItems, setAllItems] = useState<LocalRecordingMini[]>([]);
    const [verificationStep, setVerificationStep] = useState<Record<string, number>>({});
    const [showVerificationDialog, setShowVerificationDialog] = useState<string | null>(null);
    const [verificationForms, setVerificationForms] = useState<Record<string, VerificationData>>({});
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");
    const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);
    const [rejectType, setRejectType] = useState<"direct" | "temporary">("direct");
    const [rejectNote, setRejectNote] = useState("");
    const [showUnclaimDialog, setShowUnclaimDialog] = useState<string | null>(null);
    const [showApproveConfirmDialog, setShowApproveConfirmDialog] = useState<string | null>(null);
    const [showRejectConfirmDialog, setShowRejectConfirmDialog] = useState<string | null>(null);
    const [showRejectNoteWarningDialog, setShowRejectNoteWarningDialog] = useState<boolean>(false);

    const load = useCallback(() => {
        try {
            const raw = localStorage.getItem("localRecordings");
            const all = raw ? (JSON.parse(raw) as LocalRecordingMini[]) : [];
            // Migrate video data từ audioData sang videoData
            const migrated = migrateVideoDataToVideoData(all);
            // Filter by claimedBy - only show items claimed by this expert or unclaimed items
            // When an expert claims an item, it's "put in their bag" - other experts can't see it
            const expertItems = migrated.filter(
                (r) => {
                    // Show items claimed by this expert (they are "in the bag")
                    if (r.moderation?.claimedBy === user?.id) return true;
                    // Show unclaimed items (available for claiming)
                    if (!r.moderation?.claimedBy && r.moderation?.status === ModerationStatus.PENDING_REVIEW) return true;
                    // Also show items reviewed by this expert (already approved/rejected)
                    if (r.moderation?.reviewerId === user?.id) return true;
                    // Don't show items claimed by other experts
                    return false;
                }
            );
            setAllItems(expertItems);
            // Apply filters
            let filtered = expertItems;
            if (statusFilter !== "ALL") {
                filtered = filtered.filter((r) => r.moderation?.status === statusFilter);
            }
            // Sort by date
            filtered = [...filtered].sort((a, b) => {
                const aDate = (a as LocalRecordingMini & { uploadedDate?: string }).uploadedDate || (a as LocalRecordingMini).uploadedAt || a.moderation?.reviewedAt || '';
                const bDate = (b as LocalRecordingMini & { uploadedDate?: string }).uploadedDate || (b as LocalRecordingMini).uploadedAt || b.moderation?.reviewedAt || '';
                const dateA = new Date(aDate || 0).getTime();
                const dateB = new Date(bDate || 0).getTime();
                return dateSort === "newest" ? dateB - dateA : dateA - dateB;
            });
            setItems(filtered);
        } catch (err) {
            console.error(err);
            setItems([]);
            setAllItems([]);
        }
    }, [user?.id, statusFilter, dateSort]);

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
                    // Cập nhật allItems với dữ liệu đã migrate
                    setAllItems(prev => {
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

    // Disable body scroll when any dialog is open
    useEffect(() => {
        const hasOpenDialog = !!(
            showVerificationDialog ||
            showRejectDialog ||
            showUnclaimDialog ||
            showApproveConfirmDialog ||
            showRejectConfirmDialog ||
            showRejectNoteWarningDialog
        );
        
        if (hasOpenDialog) {
            // Save current scroll position
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scroll position
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }
        return () => {
            // Cleanup
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
        };
    }, [showVerificationDialog, showRejectDialog, showUnclaimDialog, showApproveConfirmDialog, showRejectConfirmDialog, showRejectNoteWarningDialog]);

    // Handle ESC key to close dialogs
    useEffect(() => {
        const hasOpenDialog = !!(
            showVerificationDialog ||
            showRejectDialog ||
            showUnclaimDialog ||
            showApproveConfirmDialog ||
            showRejectConfirmDialog ||
            showRejectNoteWarningDialog
        );
        
        if (!hasOpenDialog) return;
        
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showVerificationDialog) {
                    cancelVerification(showVerificationDialog);
                }
                if (showRejectDialog) {
                    setShowRejectDialog(null);
                    setRejectNote("");
                    setRejectType("direct");
                }
                if (showUnclaimDialog) {
                    setShowUnclaimDialog(null);
                }
                if (showApproveConfirmDialog) {
                    setShowApproveConfirmDialog(null);
                }
                if (showRejectConfirmDialog) {
                    setShowRejectConfirmDialog(null);
                }
                if (showRejectNoteWarningDialog) {
                    setShowRejectNoteWarningDialog(false);
                }
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showVerificationDialog, showRejectDialog, showUnclaimDialog, showApproveConfirmDialog, showRejectConfirmDialog, showRejectNoteWarningDialog]);

    if (!user || user.role !== "EXPERT") {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50 relative">
                <div className="absolute top-4 right-4"><BackButton /></div>
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
            // Also add any new items from updated that aren't in all
            updated.forEach((u) => {
                if (u.id && !all.find((a) => a.id === u.id)) {
                    merged.push(u);
                }
            });
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
        const updated = allItems.map((it) => {
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
        setAllItems(updated);
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
        const item = allItems.find(it => it.id === id);
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
        const updated = allItems.map((it) => {
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
        setAllItems(updated);
        saveItems(updated);
    };

    const nextVerificationStep = (id?: string) => {
        if (!id) return;
        const currentStep = getCurrentVerificationStep(id);

        if (currentStep < 3) {
            // Bước 1 và 2: Không cần validate, cho phép tiếp tục luôn
            const nextStep = currentStep + 1;
            setVerificationStep(prev => ({ ...prev, [id]: nextStep }));

            // Save verification data to item
            const updated = allItems.map((it) => {
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
            setAllItems(updated);
            saveItems(updated);
        } else {
            // Step 3: Phải validate trước khi hoàn thành
            if (!validateStep(id, currentStep)) {
                alert(`Vui lòng hoàn thành tất cả các yêu cầu bắt buộc ở Bước ${currentStep} trước khi hoàn thành kiểm duyệt bản thu!`);
                return;
            }
            // Step 3 completed - show confirmation dialog before approving
            setShowApproveConfirmDialog(id);
            return;
        }
    };

    const handleConfirmApprove = () => {
        const id = showApproveConfirmDialog;
        if (!id) return;
        // Automatically approve when all 3 steps are completed
        const updated = allItems.map((it) => {
            if (it.id === id && it.moderation?.claimedBy === user?.id) {
                const currentFormData = verificationForms[id] || {};
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
        setAllItems(updated);
        saveItems(updated);
        setShowVerificationDialog(null);
        setShowApproveConfirmDialog(null);
    };

    const handleConfirmReject = () => {
        const id = showRejectConfirmDialog;
        if (!id) return;
        reject(id, rejectType, rejectNote);
        if (showVerificationDialog === id) {
            setShowVerificationDialog(null);
        }
        setShowRejectDialog(null);
        setShowRejectConfirmDialog(null);
        setRejectNote("");
        setRejectType("direct");
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
        // Just close the dialog, don't unclaim
        setShowVerificationDialog(null);
    };

    const unclaim = (id?: string) => {
        if (!id) return;
        // Show confirmation dialog
        setShowUnclaimDialog(id);
    };

    const handleConfirmUnclaim = () => {
        const id = showUnclaimDialog;
        if (!id) return;
        // Cancel verification - return to PENDING_REVIEW and unclaim
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
        setShowUnclaimDialog(null);
        const updated = allItems.map((it) => {
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
        setAllItems(updated);
        saveItems(updated);
    };

    // Approve function is no longer needed - approval happens automatically after step 3

    const reject = (id?: string, type: "direct" | "temporary" = "direct", note?: string) => {
        if (!id) return;
        const updated = allItems.map((it) => {
            if (it.id === id) {
                if (it.moderation?.claimedBy !== user?.id && it.moderation?.reviewerId !== user?.id) {
                    return it;
                }
                return {
                    ...it,
                    moderation: {
                        ...it.moderation,
                        status: type === "direct" ? ModerationStatus.REJECTED : ModerationStatus.TEMPORARILY_REJECTED,
                        reviewerId: user?.id,
                        reviewerName: user?.username,
                        reviewedAt: new Date().toISOString(),
                        rejectionNote: note || "",
                        claimedBy: null,
                        claimedByName: null,
                    },
                };
            }
            return it;
        });
        setAllItems(updated);
        saveItems(updated);
        setShowRejectDialog(null);
        setRejectNote("");
        setRejectType("direct");
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900">
                        Kiểm duyệt bản thu
                    </h1>
                    <BackButton />
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 mb-8 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-neutral-800">Lọc theo trạng thái</label>
                            <SearchableDropdown
                                value={statusFilter === "ALL" ? "" : getStatusLabel(statusFilter)}
                                onChange={(val) => {
                                    // Map label back to status value
                                    if (val === "Tất cả") {
                                        setStatusFilter("ALL");
                                    } else {
                                        const statusMap: Record<string, string> = {
                                            "Đang chờ được kiểm duyệt": ModerationStatus.PENDING_REVIEW,
                                            "Đang được kiểm duyệt": ModerationStatus.IN_REVIEW,
                                            "Đã được kiểm duyệt": ModerationStatus.APPROVED,
                                            "Đã bị từ chối": ModerationStatus.REJECTED,
                                            "Tạm thời bị từ chối": ModerationStatus.TEMPORARILY_REJECTED,
                                        };
                                        setStatusFilter(statusMap[val] || "ALL");
                                    }
                                }}
                                options={[
                                    "Tất cả",
                                    "Đang chờ được kiểm duyệt",
                                    "Đang được kiểm duyệt",
                                    "Đã được kiểm duyệt",
                                    "Đã bị từ chối",
                                    "Tạm thời bị từ chối",
                                ]}
                                placeholder="Chọn trạng thái"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-neutral-800">Sắp xếp theo ngày</label>
                            <SearchableDropdown
                                value={dateSort === "newest" ? "Mới nhất" : "Cũ nhất"}
                                onChange={(val) => {
                                    setDateSort(val === "Mới nhất" ? "newest" : "oldest");
                                }}
                                options={["Mới nhất", "Cũ nhất"]}
                                placeholder="Chọn thứ tự"
                                searchable={false}
                            />
                        </div>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 mb-8 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
                        <h2 className="text-xl font-semibold mb-2 text-neutral-900">Không có bản thu</h2>
                        <p className="text-neutral-700 font-medium">Không có bản thu đang chờ được kiểm duyệt.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {items.filter(it => it.id).map((it) => {
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

                            // Convert LocalRecordingMini to Recording for type safety
                            const convertedRecording: RecordingWithLocalData = {
                                id: it.id ?? "",
                                title: it.basicInfo?.title || it.title || "Không có tiêu đề",
                                titleVietnamese: it.basicInfo?.title || it.title || "Không có tiêu đề",
                                description: "",
                                ethnicity: {
                                    id: "local",
                                    name: it.culturalContext?.ethnicity || "Không xác định",
                                    nameVietnamese: it.culturalContext?.ethnicity || "Không xác định",
                                    region: (() => {
                                        const regionKey = it.culturalContext?.region as keyof typeof Region;
                                        return Region[regionKey] ?? Region.RED_RIVER_DELTA;
                                    })(),
                                    recordingCount: 0,
                                },
                                region: (() => {
                                    const regionKey = it.culturalContext?.region as keyof typeof Region;
                                    return Region[regionKey] ?? Region.RED_RIVER_DELTA;
                                })(),
                                recordingType: RecordingType.OTHER,
                                duration: 0,
                                audioUrl: it.audioData ?? "",
                                waveformUrl: "",
                                coverImage: "",
                                instruments: (it.culturalContext?.instruments || []).map((name, idx) => ({
                                    id: `local-instrument-${idx}`,
                                    name: name,
                                    nameVietnamese: name,
                                })),
                                performers: [],
                                recordedDate: it.basicInfo?.recordingDate || "",
                                uploadedDate: it.uploadedAt || new Date().toISOString(),
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
                                tags: (it as LocalRecordingMini & { tags?: string[] }).tags ?? [it.basicInfo?.genre ?? ""].filter(Boolean),
                                metadata: {
                                    recordingQuality: RecordingQuality.FIELD_RECORDING,
                                    lyrics: "",
                                } as Partial<RecordingMetadata>,
                                verificationStatus: it.moderation?.status === "APPROVED" ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
                                verifiedBy: undefined,
                                viewCount: 0,
                                likeCount: 0,
                                downloadCount: 0,
                                _originalLocalData: it,
                            };

                            return (
                                <div key={it.id} className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="text-neutral-800 font-semibold text-lg mb-2">
                                                {it.basicInfo?.title || it.title || 'Không có tiêu đề'}
                                            </div>
                                            {it.basicInfo?.artist && (
                                                <div className="text-sm text-neutral-600 mb-1">Nghệ sĩ: {it.basicInfo.artist}</div>
                                            )}
                                            <div className="text-sm text-neutral-600 mb-1">Người đóng góp: {it.uploader?.username || 'Khách'}</div>
                                            <div className="text-sm text-neutral-500 mb-1">Thời điểm tải lên: {formatDateTime((it as LocalRecordingMini & { uploadedDate?: string }).uploadedDate || it.uploadedAt)}</div>
                                            <div className="text-sm mt-2">
                                                Trạng thái: <span className="font-medium">{getStatusLabel(it.moderation?.status)}</span>
                                                {it.moderation?.status === ModerationStatus.IN_REVIEW && it.moderation?.claimedByName && (
                                                    <span className="text-neutral-500"> — Đang được kiểm duyệt bởi {it.moderation.claimedByName}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="ml-4 flex flex-col gap-2 flex-shrink-0">
                                            {it.moderation?.status === ModerationStatus.PENDING_REVIEW && (
                                                <button onClick={() => claim(it.id)} className="px-4 py-2.5 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-primary-600/40 hover:scale-110 active:scale-95 cursor-pointer whitespace-nowrap">Nhận kiểm duyệt</button>
                                            )}

                                            {it.moderation?.status === ModerationStatus.IN_REVIEW && it.moderation?.claimedBy === user?.id && (
                                                <>
                                                    <button onClick={() => claim(it.id)} className="px-4 py-2.5 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-primary-600/40 hover:scale-110 active:scale-95 cursor-pointer whitespace-nowrap">Tiếp tục kiểm duyệt</button>
                                                    <button onClick={() => unclaim(it.id)} className="px-4 py-2.5 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-red-600/40 hover:scale-110 active:scale-95 cursor-pointer whitespace-nowrap">Hủy nhận kiểm duyệt</button>
                                                </>
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
                                                    recording={convertedRecording}
                                                    showContainer={true}
                                                />
                                            ) : (
                                                <AudioPlayer
                                                    src={mediaSrc}
                                                    title={it.basicInfo?.title || it.title}
                                                    artist={it.basicInfo?.artist}
                                                    recording={convertedRecording}
                                                    showContainer={true}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Verification Dialog */}
                {showVerificationDialog && (() => {
                    // Đảm bảo lấy dữ liệu mới nhất từ localStorage với migration
                    let item = allItems.find(it => it.id === showVerificationDialog);
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
                    return createPortal(
                        <div 
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
                            onClick={() => cancelVerification(showVerificationDialog)}
                            style={{ 
                                animation: 'fadeIn 0.3s ease-out',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                width: '100vw',
                                height: '100vh',
                                position: 'fixed',
                            }}
                        >
                            <div 
                                className="rounded-2xl border border-neutral-300/80 shadow-2xl backdrop-blur-sm max-w-3xl w-full overflow-hidden flex flex-col transition-all duration-300 pointer-events-auto transform mt-16"
                                style={{ 
                                    backgroundColor: '#FFF2D6',
                                    animation: 'slideUp 0.3s ease-out',
                                    maxHeight: 'calc(100vh - 8rem)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-neutral-200/80 bg-gradient-to-br from-primary-600 to-primary-700">
                                    <h2 className="text-2xl font-bold text-white">{stepNames[currentStep - 1]}</h2>
                                    <button
                                        onClick={() => cancelVerification(showVerificationDialog)}
                                        className="p-1.5 rounded-full hover:bg-primary-500/50 transition-colors duration-200 text-white hover:text-white cursor-pointer"
                                        aria-label="Đóng"
                                    >
                                        <X className="h-5 w-5" strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="overflow-y-auto p-6 max-h-[70vh]">
                                    <div className="space-y-6">
                                        {/* Media Player Section */}
                                        <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
                                            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Bản thu</h3>
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
                                                    tags: (item as LocalRecordingMini & { tags?: string[] }).tags ?? [item.basicInfo?.genre ?? ""].filter(Boolean),
                                                    metadata: { recordingQuality: RecordingQuality.FIELD_RECORDING, lyrics: "" },
                                                    verificationStatus: item.moderation?.status === "APPROVED" ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
                                                    viewCount: 0,
                                                    likeCount: 0,
                                                    downloadCount: 0,
                                                    _originalLocalData: item,
                                                } as RecordingWithLocalData;
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
                                        <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
                                            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Thông tin cơ bản</h3>
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
                                            <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
                                                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Bối cảnh văn hóa</h3>
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
                                            <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
                                                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Ghi chú bổ sung</h3>
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
                                            <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
                                                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Thông tin quản trị</h3>
                                                <div className="space-y-2 text-sm">
                                                    {item.adminInfo.collector && <div><strong>Người thu thập:</strong> {item.adminInfo.collector}</div>}
                                                    {item.adminInfo.copyright && <div><strong>Bản quyền:</strong> {item.adminInfo.copyright}</div>}
                                                    {item.adminInfo.archiveOrg && <div><strong>Archive.org:</strong> {item.adminInfo.archiveOrg}</div>}
                                                    {item.adminInfo.catalogId && <div><strong>Mã catalog:</strong> {item.adminInfo.catalogId}</div>}
                                                </div>
                                            </div>
                                        )}

                                        {/* Verification Form Section */}
                                        <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
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
                                                                className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Thông tin đầy đủ: Tiêu đề, nghệ sĩ, ngày thu, địa điểm, dân tộc, thể loại đã được điền đầy đủ</span>
                                                        </label>
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step1?.infoAccurate || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 1, 'infoAccurate', e.target.checked)}
                                                                className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Thông tin chính xác: Các thông tin cơ bản phù hợp và không có mâu thuẫn</span>
                                                        </label>
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step1?.formatCorrect || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 1, 'formatCorrect', e.target.checked)}
                                                                className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
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
                                                                className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Giá trị văn hóa: Bản thu có giá trị văn hóa, lịch sử hoặc nghệ thuật đáng kể</span>
                                                        </label>
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step2?.authenticity || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 2, 'authenticity', e.target.checked)}
                                                                className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Tính xác thực: Bản thu là bản gốc, không phải bản sao chép hoặc chỉnh sửa không được phép</span>
                                                        </label>
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step2?.accuracy || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 2, 'accuracy', e.target.checked)}
                                                                className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
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
                                                                className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Đã đối chiếu: Đã kiểm tra và đối chiếu với các nguồn tài liệu, cơ sở dữ liệu liên quan</span>
                                                        </label>
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step3?.sourcesVerified || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 3, 'sourcesVerified', e.target.checked)}
                                                                className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                                            />
                                                            <span className="text-neutral-700">Nguồn đã xác minh: Nguồn gốc, người thu thập, quyền sở hữu đã được xác minh</span>
                                                        </label>
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={verificationForms[showVerificationDialog]?.step3?.finalApproval || false}
                                                                onChange={(e) => updateVerificationForm(showVerificationDialog, 3, 'finalApproval', e.target.checked)}
                                                                className="mt-1 h-5 w-5 flex-shrink-0 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
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
                                            onClick={() => unclaim(showVerificationDialog)}
                                            className="px-6 py-2.5 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-red-600/40 hover:scale-110 active:scale-95 cursor-pointer"
                                        >
                                            Hủy nhận kiểm duyệt
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (showVerificationDialog) {
                                                    setShowRejectDialog(showVerificationDialog);
                                                }
                                            }}
                                            className="px-6 py-2.5 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white rounded-full font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-orange-600/40 hover:scale-110 active:scale-95 cursor-pointer"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {currentStep > 1 && (
                                            <button
                                                onClick={() => prevVerificationStep(showVerificationDialog)}
                                                className="px-6 py-2.5 bg-neutral-200/80 hover:bg-neutral-300 text-neutral-800 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                                            >
                                                Quay lại (Bước {currentStep - 1})
                                            </button>
                                        )}
                                        {currentStep < 3 ? (
                                            <button
                                                onClick={() => nextVerificationStep(showVerificationDialog)}
                                                className="px-6 py-2.5 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-full font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-primary-600/40 hover:scale-110 active:scale-95 cursor-pointer"
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
                                                className="px-6 py-2.5 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-full font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-green-600/40 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            >
                                                Hoàn thành kiểm duyệt
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        , document.body
                    );
                })()}

                {/* Rejection Dialog */}
                {showRejectDialog && createPortal(
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
                        onClick={(e) => { if (e.target === e.currentTarget) { setShowRejectDialog(null); setRejectNote(""); setRejectType("direct"); } }}
                        style={{ 
                            animation: 'fadeIn 0.3s ease-out',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100vw',
                            height: '100vh',
                            position: 'fixed',
                        }}
                    >
                        <div 
                            className="rounded-2xl shadow-xl border border-neutral-300/80 backdrop-blur-sm max-w-lg w-full p-6 pointer-events-auto transform"
                            style={{ 
                                backgroundColor: '#FFF2D6',
                                animation: 'slideUp 0.3s ease-out'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-semibold mb-4 text-neutral-800">Từ chối bản thu</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Loại từ chối</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="rejectType"
                                                value="direct"
                                                checked={rejectType === "direct"}
                                                onChange={(e) => setRejectType(e.target.value as "direct" | "temporary")}
                                                className="h-4 w-4 text-primary-600"
                                            />
                                            <div>
                                                <span className="text-neutral-800 font-medium">Từ chối vĩnh viễn</span>
                                                <p className="text-sm text-neutral-600">Dùng khi sai thông tin trầm trọng, bị trùng file, v.v.</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="rejectType"
                                                value="temporary"
                                                checked={rejectType === "temporary"}
                                                onChange={(e) => setRejectType(e.target.value as "direct" | "temporary")}
                                                className="h-4 w-4 text-primary-600"
                                            />
                                            <div>
                                                <span className="text-neutral-800 font-medium">Từ chối tạm thời</span>
                                                <p className="text-sm text-neutral-600">Người đóng góp có thể chỉnh sửa và gửi lại</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                {rejectType === "temporary" && (
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Ghi chú cho người đóng góp</label>
                                        <textarea
                                            value={rejectNote}
                                            onChange={(e) => setRejectNote(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Nhập ghi chú về những điểm cần chỉnh sửa..."
                                        />
                                    </div>
                                )}
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => { setShowRejectDialog(null); setRejectNote(""); setRejectType("direct"); }}
                                        className="px-4 py-2 rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-neutral-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (showRejectDialog) {
                                                if (rejectType === "temporary" && !rejectNote.trim()) {
                                                    setShowRejectNoteWarningDialog(true);
                                                    return;
                                                }
                                                // Show confirmation dialog
                                                setShowRejectConfirmDialog(showRejectDialog);
                                            }
                                        }}
                                        className="px-4 py-2 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-red-600/40 hover:scale-110 active:scale-95 cursor-pointer"
                                    >
                                        {rejectType === "direct" ? "Từ chối vĩnh viễn" : "Từ chối tạm thời"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>, document.body
                )}

                {/* Unclaim Confirmation Dialog */}
                {showUnclaimDialog && createPortal(
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
                        onClick={() => setShowUnclaimDialog(null)}
                        style={{ 
                            animation: 'fadeIn 0.3s ease-out',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100vw',
                            height: '100vh',
                            position: 'fixed',
                        }}
                    >
                        <div
                            className="rounded-2xl shadow-xl border border-neutral-300/80 backdrop-blur-sm max-w-3xl w-full overflow-hidden flex flex-col pointer-events-auto transform"
                            style={{ 
                                backgroundColor: '#FFF2D6',
                                animation: 'slideUp 0.3s ease-out'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-neutral-200/80 bg-gradient-to-br from-primary-600 to-primary-700">
                                <h2 className="text-2xl font-bold text-white">Xác nhận hủy nhận kiểm duyệt</h2>
                                <button
                                    onClick={() => setShowUnclaimDialog(null)}
                                    className="p-1.5 rounded-full hover:bg-primary-500/50 transition-colors duration-200 text-white hover:text-white cursor-pointer"
                                    aria-label="Đóng"
                                >
                                    <X className="h-5 w-5" strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="overflow-y-auto p-6">
                                <div className="rounded-2xl shadow-md border border-neutral-200 p-8" style={{ backgroundColor: '#FFFCF5' }}>
                                    <div className="flex flex-col items-center gap-4 mb-2">
                                        <div className="p-3 bg-primary-100 rounded-full flex-shrink-0">
                                            <AlertCircle className="h-8 w-8 text-primary-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-neutral-800 text-center">
                                            Bạn có chắc chắn muốn hủy nhận kiểm duyệt bản thu này?
                                        </h3>
                                        <div className="text-neutral-700 text-center space-y-1">
                                            <p>Bản thu sẽ được trả lại danh sách để các chuyên gia khác có thể nhận kiểm duyệt.</p>
                                            <p>Tiến trình kiểm duyệt hiện tại sẽ bị hủy.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-center gap-4 p-6 border-t border-neutral-200/80 bg-neutral-50/50">
                                <button
                                    onClick={() => setShowUnclaimDialog(null)}
                                    className="px-6 py-2.5 bg-neutral-200/80 hover:bg-neutral-300 text-neutral-800 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmUnclaim}
                                    className="px-6 py-2.5 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-full font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-red-600/40 hover:scale-110 active:scale-95 cursor-pointer"
                                >
                                    Xác nhận hủy
                                </button>
                            </div>
                        </div>
                    </div>
                    , document.body
                )}

                {/* Approve Confirmation Dialog */}
                {showApproveConfirmDialog && createPortal(
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
                        onClick={() => setShowApproveConfirmDialog(null)}
                        style={{ 
                            animation: 'fadeIn 0.3s ease-out',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100vw',
                            height: '100vh',
                            position: 'fixed',
                        }}
                    >
                        <div
                            className="rounded-2xl shadow-xl border border-neutral-300/80 backdrop-blur-sm max-w-3xl w-full overflow-hidden flex flex-col pointer-events-auto transform"
                            style={{ 
                                backgroundColor: '#FFF2D6',
                                animation: 'slideUp 0.3s ease-out'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-neutral-200/80 bg-gradient-to-br from-primary-600 to-primary-700">
                                <h2 className="text-2xl font-bold text-white">Xác nhận phê duyệt</h2>
                                <button
                                    onClick={() => setShowApproveConfirmDialog(null)}
                                    className="p-1.5 rounded-full hover:bg-primary-500/50 transition-colors duration-200 text-white hover:text-white cursor-pointer"
                                    aria-label="Đóng"
                                >
                                    <X className="h-5 w-5" strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="overflow-y-auto p-6">
                                <div className="rounded-2xl shadow-md border border-neutral-200 p-8" style={{ backgroundColor: '#FFFCF5' }}>
                                    <div className="flex flex-col items-center gap-4 mb-2">
                                        <div className="p-3 bg-primary-100 rounded-full flex-shrink-0">
                                            <AlertCircle className="h-8 w-8 text-primary-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-neutral-800 text-center">
                                            Bạn có chắc chắn muốn phê duyệt bản thu này?
                                        </h3>
                                        <div className="text-neutral-700 text-center space-y-1">
                                            <p>Hành động này sẽ đưa bản thu vào danh sách đã được kiểm duyệt.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-center gap-4 p-6 border-t border-neutral-200 bg-neutral-50/50">
                                <button
                                    onClick={() => setShowApproveConfirmDialog(null)}
                                    className="px-6 py-2.5 bg-neutral-200 text-neutral-800 rounded-full font-medium hover:bg-neutral-300 transition-colors shadow-sm hover:shadow-md"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmApprove}
                                    className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-500 transition-colors shadow-sm hover:shadow-md"
                                >
                                    Xác nhận phê duyệt
                                </button>
                            </div>
                        </div>
                    </div>
                    , document.body
                )}

                {/* Reject Confirmation Dialog */}
                {showRejectConfirmDialog && createPortal(
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
                        onClick={() => setShowRejectConfirmDialog(null)}
                        style={{ 
                            animation: 'fadeIn 0.3s ease-out',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100vw',
                            height: '100vh',
                            position: 'fixed',
                        }}
                    >
                        <div
                            className="rounded-2xl shadow-xl border border-neutral-300/80 backdrop-blur-sm max-w-3xl w-full overflow-hidden flex flex-col pointer-events-auto transform"
                            style={{ 
                                backgroundColor: '#FFF2D6',
                                animation: 'slideUp 0.3s ease-out'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-neutral-200/80 bg-gradient-to-br from-primary-600 to-primary-700">
                                <h2 className="text-2xl font-bold text-white">Xác nhận từ chối</h2>
                                <button
                                    onClick={() => setShowRejectConfirmDialog(null)}
                                    className="p-1.5 rounded-full hover:bg-primary-500/50 transition-colors duration-200 text-white hover:text-white cursor-pointer"
                                    aria-label="Đóng"
                                >
                                    <X className="h-5 w-5" strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="overflow-y-auto p-6">
                                <div className="rounded-2xl shadow-md border border-neutral-200 p-8" style={{ backgroundColor: '#FFFCF5' }}>
                                    <div className="flex flex-col items-center gap-4 mb-2">
                                        <div className="p-3 bg-primary-100 rounded-full flex-shrink-0">
                                            <AlertCircle className="h-8 w-8 text-primary-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-neutral-800 text-center">
                                            Bạn có chắc chắn muốn {rejectType === "direct" ? "từ chối vĩnh viễn" : "từ chối tạm thời"} bản thu này?
                                        </h3>
                                        <div className="text-neutral-700 text-center space-y-1">
                                            <p>{rejectType === "direct" ? "Bản thu sẽ bị từ chối vĩnh viễn và không thể chỉnh sửa." : "Bản thu sẽ bị từ chối tạm thời và người đóng góp có thể chỉnh sửa và gửi lại."}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-center gap-4 p-6 border-t border-neutral-200 bg-neutral-50/50">
                                <button
                                    onClick={() => setShowRejectConfirmDialog(null)}
                                    className="px-6 py-2.5 bg-neutral-200 text-neutral-800 rounded-full font-medium hover:bg-neutral-300 transition-colors shadow-sm hover:shadow-md"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmReject}
                                    className="px-6 py-2.5 bg-red-600 text-white rounded-full font-medium hover:bg-red-500 transition-colors shadow-sm hover:shadow-md"
                                >
                                    Xác nhận {rejectType === "direct" ? "từ chối vĩnh viễn" : "từ chối tạm thời"}
                                </button>
                            </div>
                        </div>
                    </div>
                    , document.body
                )}

                {/* Reject Note Warning Dialog */}
                {showRejectNoteWarningDialog && createPortal(
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
                        onClick={() => setShowRejectNoteWarningDialog(false)}
                        style={{ 
                            animation: 'fadeIn 0.3s ease-out',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100vw',
                            height: '100vh',
                            position: 'fixed',
                        }}
                    >
                        <div
                            className="rounded-2xl shadow-xl border border-neutral-300/80 backdrop-blur-sm max-w-3xl w-full overflow-hidden flex flex-col pointer-events-auto transform"
                            style={{ 
                                backgroundColor: '#FFF2D6',
                                animation: 'slideUp 0.3s ease-out'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-neutral-200/80 bg-gradient-to-br from-primary-600 to-primary-700">
                                <h2 className="text-2xl font-bold text-white">Cảnh báo</h2>
                                <button
                                    onClick={() => setShowRejectNoteWarningDialog(false)}
                                    className="p-1.5 rounded-full hover:bg-primary-500/50 transition-colors duration-200 text-white hover:text-white cursor-pointer"
                                    aria-label="Đóng"
                                >
                                    <X className="h-5 w-5" strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="overflow-y-auto p-6">
                                <div className="rounded-2xl shadow-md border border-neutral-200 p-8" style={{ backgroundColor: '#FFFCF5' }}>
                                    <div className="flex flex-col items-center gap-4 mb-2">
                                        <div className="p-3 bg-primary-100 rounded-full flex-shrink-0">
                                            <AlertCircle className="h-8 w-8 text-primary-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-neutral-800 text-center">
                                            Vui lòng nhập ghi chú cho người đóng góp khi tạm thời bị từ chối.
                                        </h3>
                                        <div className="text-neutral-700 text-center space-y-1">
                                            <p>Khi từ chối tạm thời, bạn cần cung cấp ghi chú để người đóng góp biết những điểm cần chỉnh sửa.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-center gap-4 p-6 border-t border-neutral-200 bg-neutral-50/50">
                                <button
                                    onClick={() => setShowRejectNoteWarningDialog(false)}
                                    className="px-6 py-2.5 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-full font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-primary-600/40 hover:scale-110 active:scale-95 cursor-pointer"
                                >
                                    Đã hiểu
                                </button>
                            </div>
                        </div>
                    </div>
                    , document.body
                )}
            </div>
        </div>
    );
}