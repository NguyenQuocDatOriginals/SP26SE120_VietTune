import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Search, Sparkles, Download } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import { Recording, SearchFilters, Region, RecordingType, VerificationStatus, RecordingQuality, UserRole, InstrumentCategory } from "@/types";
import { recordingService } from "@/services/recordingService";
import AudioPlayer from "@/components/features/AudioPlayer";
import VideoPlayer from "@/components/features/VideoPlayer";
import { isYouTubeUrl } from "@/utils/youtube";
import SearchBar from "@/components/features/SearchBar";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { migrateVideoDataToVideoData } from "@/utils/helpers";
import { getLocalRecordingMetaList, getLocalRecordingFull, removeLocalRecording } from "@/services/recordingStorage";

import type { LocalRecording } from "@/types";
import { buildTagsFromLocal, PERFORMANCE_KEY_TO_LABEL } from "@/utils/recordingTags";

// Extended Recording type that may include original local data
type RecordingWithLocalData = Recording & {
  _originalLocalData?: LocalRecording & {
    culturalContext?: {
      region?: string;
    };
  };
};

// Helper function to get audio duration from data URL
const getAudioDuration = (audioDataUrl: string): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener("loadedmetadata", () => {
      resolve(Math.floor(audio.duration));
    });
    audio.addEventListener("error", () => {
      resolve(0); // Return 0 if error loading
    });
    audio.src = audioDataUrl;
  });
};

// Convert LocalRecording to Recording format for display (async to get duration)
const convertLocalToRecording = async (
  local: LocalRecording,
): Promise<Recording> => {
  // Get actual duration - only for audio files
  let duration = 0;
  const isVideo = local.mediaType === "video" || local.mediaType === "youtube";

  if (!isVideo && local.audioData) {
    duration = await getAudioDuration(local.audioData);
  }

  // VideoPlayer CHỈ nhận videoData hoặc YouTubeURL, AudioPlayer CHỈ nhận audioData
  let mediaSrc: string | undefined;

  // Kiểm tra YouTube URL trước (cho VideoPlayer)
  if (local.mediaType === "youtube" && local.youtubeUrl && local.youtubeUrl.trim()) {
    mediaSrc = local.youtubeUrl.trim();
  } else if (local.youtubeUrl && typeof local.youtubeUrl === 'string' && local.youtubeUrl.trim() && isYouTubeUrl(local.youtubeUrl)) {
    mediaSrc = local.youtubeUrl.trim();
  }
  // Nếu là video, CHỈ dùng videoData (không fallback về audioData)
  else if (local.mediaType === "video") {
    if (local.videoData && typeof local.videoData === 'string' && local.videoData.trim().length > 0) {
      mediaSrc = local.videoData;
    }
    // Không fallback về audioData - VideoPlayer chỉ phát videoData
  }
  // Nếu là audio, CHỈ dùng audioData
  else if (local.mediaType === "audio") {
    if (local.audioData && typeof local.audioData === 'string' && local.audioData.trim().length > 0) {
      mediaSrc = local.audioData;
    }
  }
  // Nếu mediaType chưa được set, thử phát hiện từ dữ liệu có sẵn
  else {
    // Ưu tiên videoData nếu có
    if (local.videoData && typeof local.videoData === 'string' && local.videoData.trim().length > 0) {
      mediaSrc = local.videoData;
    }
    // Sau đó thử audioData
    else if (local.audioData && typeof local.audioData === 'string' && local.audioData.trim().length > 0) {
      mediaSrc = local.audioData;
    }
  }

  const isApproved = local.moderation?.status === "APPROVED";

  return {
    id: local.id ?? "local-" + Math.random().toString(36).slice(2),
    title: local.basicInfo?.title || local.title || "Không có tiêu đề",
    titleVietnamese: local.basicInfo?.title || local.title || "Không có tiêu đề",
    description: local.description || `Bản thu được tải lên từ thiết bị của bạn`,
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
    instruments: (local.instruments && local.instruments.length > 0)
      ? local.instruments
      : ((local as LocalRecording & { culturalContext?: { instruments?: string[] } }).culturalContext?.instruments ?? []).map((name, i) => ({
        id: `inst-${i}`,
        name,
        nameVietnamese: name,
        category: InstrumentCategory.IDIOPHONE,
        images: [],
        recordingCount: 0,
      })),
    performers: local.performers ?? [],
    uploadedDate: local.uploadedDate ?? new Date().toISOString(),
    uploader: typeof local.uploader === "object" && local.uploader !== null ? {
      id: local.uploader?.id ?? "local-user",
      username: local.uploader?.username ?? "Bạn",
      email: local.uploader?.email ?? "",
      fullName: local.uploader?.fullName ?? local.uploader?.username ?? "Người tải lên",
      role: (typeof local.uploader?.role === "string" ? local.uploader?.role : UserRole.USER) as UserRole,
      createdAt: local.uploader?.createdAt ?? new Date().toISOString(),
      updatedAt: local.uploader?.updatedAt ?? new Date().toISOString(),
    } : {
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
    _originalLocalData: local,
  } as Recording & { _originalLocalData?: LocalRecording };
};

// Build SearchFilters from URL search params (restore filter state from shareable links)
function filtersFromSearchParams(searchParams: URLSearchParams): SearchFilters {
  const q = searchParams.get("q")?.trim();
  const region = searchParams.get("region");
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const tagsParam = searchParams.get("tags");

  const filters: SearchFilters = {};
  if (q) filters.query = q;
  if (region && Object.values(Region).includes(region as Region)) {
    filters.regions = [region as Region];
  }
  if (type && Object.values(RecordingType).includes(type as RecordingType)) {
    filters.recordingTypes = [type as RecordingType];
  }
  if (status && Object.values(VerificationStatus).includes(status as VerificationStatus)) {
    filters.verificationStatus = [status as VerificationStatus];
  }
  if (from) filters.dateFrom = from;
  if (to) filters.dateTo = to;
  if (tagsParam) {
    filters.tags = tagsParam.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return filters;
}

// Build URL search params from SearchFilters for shareable links
function searchParamsFromFilters(filters: SearchFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.query) params.q = filters.query;
  if (filters.regions?.length) params.region = filters.regions[0];
  if (filters.recordingTypes?.length) params.type = filters.recordingTypes[0];
  if (filters.verificationStatus?.length) params.status = filters.verificationStatus[0];
  if (filters.dateFrom) params.from = filters.dateFrom;
  if (filters.dateTo) params.to = filters.dateTo;
  if (filters.tags?.length) params.tags = filters.tags.join(",");
  return params;
}

export default function SearchPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const returnTo = location.pathname + location.search;

  const initialFiltersFromUrl = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams]
  );

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [localRecordingsList, setLocalRecordingsList] = useState<LocalRecording[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(() => Object.keys(initialFiltersFromUrl).length > 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>(initialFiltersFromUrl);

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch API recordings
      let response;
      if (Object.keys(filters).length > 0) {
        response = await recordingService.searchRecordings(
          filters,
          currentPage,
          20
        );
      } else {
        response = await recordingService.getRecordings(currentPage, 20);
      }

      // Load local recordings (meta only for list → then full only for approved → no OOM)
      const metaList = await getLocalRecordingMetaList();
      const migrated = migrateVideoDataToVideoData(metaList);
      let approvedLocalRecordings = migrated.filter(
        (r) => r.moderation?.status === "APPROVED",
      );

      // Apply filters to local recordings
      if (Object.keys(filters).length > 0) {
        approvedLocalRecordings = approvedLocalRecordings.filter((r) => {
          // Filter by query (search in title, artist, genre)
          if (filters.query) {
            const queryLower = filters.query.toLowerCase();
            const titleMatch = (r.basicInfo?.title || r.title || "").toLowerCase().includes(queryLower);
            const artistMatch = (r.basicInfo?.artist || "").toLowerCase().includes(queryLower);
            const genreMatch = (r.basicInfo?.genre || "").toLowerCase().includes(queryLower);
            const tagsMatch = (r.tags || []).some(tag => tag.toLowerCase().includes(queryLower));
            if (!titleMatch && !artistMatch && !genreMatch && !tagsMatch) {
              return false;
            }
          }

          // Filter by tags (genres, instruments, eventType, province, ethnicity, region, performanceType)
          if (filters.tags && filters.tags.length > 0) {
            const perfLabel = r.culturalContext?.performanceType
              ? (PERFORMANCE_KEY_TO_LABEL[r.culturalContext.performanceType] ?? r.culturalContext.performanceType)
              : "";
            const recordingTags = [
              ...(r.basicInfo?.genre ? [r.basicInfo.genre] : []),
              ...(r.tags || []),
              ...(r.culturalContext?.instruments || []),
              ...(r.culturalContext?.eventType ? [r.culturalContext.eventType] : []),
              ...(r.culturalContext?.province ? [r.culturalContext.province] : []),
              ...(r.culturalContext?.ethnicity ? [r.culturalContext.ethnicity] : []),
              ...(r.culturalContext?.region ? [r.culturalContext.region] : []),
              ...(perfLabel ? [perfLabel] : []),
            ];
            const hasMatchingTag = filters.tags.some(filterTag =>
              recordingTags.some(recordingTag =>
                recordingTag.toLowerCase().includes(filterTag.toLowerCase()) ||
                filterTag.toLowerCase().includes(recordingTag.toLowerCase())
              )
            );
            if (!hasMatchingTag) {
              return false;
            }
          }

          // Filter by region
          if (filters.regions && filters.regions.length > 0) {
            if (!r.region || !filters.regions.includes(r.region)) {
              // Also check culturalContext.region (Vietnamese name)
              if (r.culturalContext?.region) {
                const regionMap: Record<string, Region> = {
                  "Trung du và miền núi Bắc Bộ": Region.NORTHERN_MOUNTAINS,
                  "Đồng bằng Bắc Bộ": Region.RED_RIVER_DELTA,
                  "Bắc Trung Bộ": Region.NORTH_CENTRAL,
                  "Nam Trung Bộ": Region.SOUTH_CENTRAL_COAST,
                  "Cao nguyên Trung Bộ": Region.CENTRAL_HIGHLANDS,
                  "Đông Nam Bộ": Region.SOUTHEAST,
                  "Tây Nam Bộ": Region.MEKONG_DELTA,
                };
                const mappedRegion = regionMap[r.culturalContext.region];
                if (!mappedRegion || !filters.regions.includes(mappedRegion)) {
                  return false;
                }
              } else {
                return false;
              }
            }
          }

          // Filter by recording type (derive from culturalContext.performanceType for local recordings)
          if (filters.recordingTypes && filters.recordingTypes.length > 0) {
            const effectiveType = r.recordingType ?? (
              (r as LocalRecording & { culturalContext?: { performanceType?: string } }).culturalContext?.performanceType === "instrumental"
                ? RecordingType.INSTRUMENTAL
                : (r as LocalRecording & { culturalContext?: { performanceType?: string } }).culturalContext?.performanceType === "acappella" ||
                  (r as LocalRecording & { culturalContext?: { performanceType?: string } }).culturalContext?.performanceType === "vocal_accompaniment"
                  ? RecordingType.VOCAL
                  : null
            );
            if (!effectiveType || !filters.recordingTypes.includes(effectiveType)) {
              return false;
            }
          }

          // Filter by verification status
          if (filters.verificationStatus && filters.verificationStatus.length > 0) {
            const isVerified = r.moderation?.status === "APPROVED";
            const hasMatchingStatus = filters.verificationStatus.some(status => {
              if (status === VerificationStatus.VERIFIED && isVerified) return true;
              if (status === VerificationStatus.PENDING && !isVerified) return true;
              return false;
            });
            if (!hasMatchingStatus) {
              return false;
            }
          }

          // Filter by date range
          if (filters.dateFrom || filters.dateTo) {
            const recordingDate = r.basicInfo?.recordingDate || r.recordedDate;
            if (recordingDate) {
              const date = new Date(recordingDate);
              if (filters.dateFrom && date < new Date(filters.dateFrom)) {
                return false;
              }
              if (filters.dateTo && date > new Date(filters.dateTo)) {
                return false;
              }
            } else {
              // If no date and filters require date, exclude
              if (filters.dateFrom || filters.dateTo) {
                return false;
              }
            }
          }

          return true;
        });
      }

      // Load full data only for approved locals (for playback and duration) — no OOM
      const fullApproved = await Promise.all(
        approvedLocalRecordings.map((r) => getLocalRecordingFull(r.id ?? "")),
      );
      const fullList = fullApproved.filter((r): r is LocalRecording => r != null);
      setLocalRecordingsList(fullList);

      // Convert local recordings to Recording format (async to get durations)
      const convertedLocalRecordings = await Promise.all(
        fullList.map(convertLocalToRecording),
      );

      // Merge: put local recordings first, then API recordings (defensive checks in case API returns unexpected shape)
      type ApiResponseType = { items: Recording[]; total: number; totalPages: number };
      const apiItems = response && Array.isArray((response as ApiResponseType).items)
        ? (response as ApiResponseType).items
        : [];
      const allRecordings = [...convertedLocalRecordings, ...apiItems];

      setRecordings(allRecordings);
      setTotalPages((response as ApiResponseType)?.totalPages ?? 1);
      const apiTotal = (response && typeof (response as ApiResponseType).total === 'number')
        ? (response as ApiResponseType).total
        : apiItems.length;
      setTotalResults(apiTotal + fullList.length);
    } catch (error) {
      console.error("Error fetching recordings:", error);

      // Even if API fails, try to show local recordings (per-recording storage → no OOM)
      try {
        const metaList = await getLocalRecordingMetaList();
        const migrated = migrateVideoDataToVideoData(metaList);
        let approvedLocalRecordings = migrated.filter(
          (r) => r.moderation?.status === "APPROVED",
        );

        // Apply filters to local recordings (same logic as above)
        if (Object.keys(filters).length > 0) {
          approvedLocalRecordings = approvedLocalRecordings.filter((r) => {
            if (filters.query) {
              const queryLower = filters.query.toLowerCase();
              const titleMatch = (r.basicInfo?.title || r.title || "").toLowerCase().includes(queryLower);
              const artistMatch = (r.basicInfo?.artist || "").toLowerCase().includes(queryLower);
              const genreMatch = (r.basicInfo?.genre || "").toLowerCase().includes(queryLower);
              const tagsMatch = (r.tags || []).some(tag => tag.toLowerCase().includes(queryLower));
              if (!titleMatch && !artistMatch && !genreMatch && !tagsMatch) {
                return false;
              }
            }

            if (filters.tags && filters.tags.length > 0) {
              const perfLabel = r.culturalContext?.performanceType
                ? (PERFORMANCE_KEY_TO_LABEL[r.culturalContext.performanceType] ?? r.culturalContext.performanceType)
                : "";
              const recordingTags = [
                ...(r.basicInfo?.genre ? [r.basicInfo.genre] : []),
                ...(r.tags || []),
                ...(r.culturalContext?.instruments || []),
                ...(r.culturalContext?.eventType ? [r.culturalContext.eventType] : []),
                ...(r.culturalContext?.province ? [r.culturalContext.province] : []),
                ...(r.culturalContext?.ethnicity ? [r.culturalContext.ethnicity] : []),
                ...(r.culturalContext?.region ? [r.culturalContext.region] : []),
                ...(perfLabel ? [perfLabel] : []),
              ];
              const hasMatchingTag = filters.tags.some(filterTag =>
                recordingTags.some(recordingTag =>
                  recordingTag.toLowerCase().includes(filterTag.toLowerCase()) ||
                  filterTag.toLowerCase().includes(recordingTag.toLowerCase())
                )
              );
              if (!hasMatchingTag) {
                return false;
              }
            }

            if (filters.regions && filters.regions.length > 0) {
              if (!r.region || !filters.regions.includes(r.region)) {
                if (r.culturalContext?.region) {
                  const regionMap: Record<string, Region> = {
                    "Trung du và miền núi Bắc Bộ": Region.NORTHERN_MOUNTAINS,
                    "Đồng bằng Bắc Bộ": Region.RED_RIVER_DELTA,
                    "Bắc Trung Bộ": Region.NORTH_CENTRAL,
                    "Nam Trung Bộ": Region.SOUTH_CENTRAL_COAST,
                    "Cao nguyên Trung Bộ": Region.CENTRAL_HIGHLANDS,
                    "Đông Nam Bộ": Region.SOUTHEAST,
                    "Tây Nam Bộ": Region.MEKONG_DELTA,
                  };
                  const mappedRegion = regionMap[r.culturalContext.region];
                  if (!mappedRegion || !filters.regions.includes(mappedRegion)) {
                    return false;
                  }
                } else {
                  return false;
                }
              }
            }

            if (filters.recordingTypes && filters.recordingTypes.length > 0) {
              const effectiveType = r.recordingType ?? (
                (r as LocalRecording & { culturalContext?: { performanceType?: string } }).culturalContext?.performanceType === "instrumental"
                  ? RecordingType.INSTRUMENTAL
                  : (r as LocalRecording & { culturalContext?: { performanceType?: string } }).culturalContext?.performanceType === "acappella" ||
                    (r as LocalRecording & { culturalContext?: { performanceType?: string } }).culturalContext?.performanceType === "vocal_accompaniment"
                    ? RecordingType.VOCAL
                    : null
              );
              if (!effectiveType || !filters.recordingTypes.includes(effectiveType)) {
                return false;
              }
            }

            if (filters.verificationStatus && filters.verificationStatus.length > 0) {
              const isVerified = r.moderation?.status === "APPROVED";
              const hasMatchingStatus = filters.verificationStatus.some(status => {
                if (status === VerificationStatus.VERIFIED && isVerified) return true;
                if (status === VerificationStatus.PENDING && !isVerified) return true;
                return false;
              });
              if (!hasMatchingStatus) {
                return false;
              }
            }

            if (filters.dateFrom || filters.dateTo) {
              const recordingDate = r.basicInfo?.recordingDate || r.recordedDate;
              if (recordingDate) {
                const date = new Date(recordingDate);
                if (filters.dateFrom && date < new Date(filters.dateFrom)) {
                  return false;
                }
                if (filters.dateTo && date > new Date(filters.dateTo)) {
                  return false;
                }
              } else {
                if (filters.dateFrom || filters.dateTo) {
                  return false;
                }
              }
            }

            return true;
          });
        }

        const fullApproved = await Promise.all(
          approvedLocalRecordings.map((r) => getLocalRecordingFull(r.id ?? "")),
        );
        const fullList = fullApproved.filter((r): r is LocalRecording => r != null);
        setLocalRecordingsList(fullList);
        const convertedLocalRecordings = await Promise.all(
          fullList.map(convertLocalToRecording),
        );
        setRecordings(convertedLocalRecordings);
        setTotalResults(fullList.length);
      } catch (localError) {
        console.error("Error loading local recordings:", localError);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  const handleDeleteRecording = async (id: string) => {
    const updated = recordings.filter((rec) => rec.id !== id);
    setRecordings(updated);
    await removeLocalRecording(id);
    setLocalRecordingsList((prev) => prev.filter((r) => r.id !== id));
    setTotalResults((prev) => Math.max(0, prev - 1));
  };

  useEffect(() => {
    if (hasSearched) {
      fetchRecordings();
    }
  }, [fetchRecordings, hasSearched]);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setHasSearched(true);
    const params = searchParamsFromFilters(newFilters);
    setSearchParams(Object.keys(params).length > 0 ? params : {}, { replace: true });
  };

  // Sync filters from URL when user navigates (e.g. browser back/forward) so filter search stays restored
  useEffect(() => {
    const next = filtersFromSearchParams(searchParams);
    setFilters(next);
    setCurrentPage(1);
    setHasSearched(Object.keys(next).length > 0);
  }, [searchParams]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header — wraps on small screens */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-neutral-900 min-w-0">
            Tìm kiếm bài hát
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/semantic-search"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 sm:px-6 py-2 rounded-full bg-primary-100/90 text-primary-700 hover:bg-primary-200/90 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer focus:outline-none border border-primary-200/80 text-sm sm:text-base"
              title="Tìm theo ý nghĩa"
            >
              <Sparkles className="h-5 w-5 shrink-0" strokeWidth={2.5} />
              <span className="whitespace-nowrap">Tìm theo ý nghĩa</span>
            </Link>
            <BackButton />
          </div>
        </div>

        {/* Main Search Form — same card style as SemanticSearchPage */}
        <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 mb-8 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: "#FFFCF5" }}>
          <SearchBar onSearch={handleSearch} initialFilters={filters} />
        </div>

        {/* Search Results — same card style as SemanticSearchPage */}
        {hasSearched && (
          <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 mb-8 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: "#FFFCF5" }}>
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900 flex items-center gap-3">
              <div className="p-2 bg-primary-100/90 rounded-lg shadow-sm">
                <Search className="h-5 w-5 text-primary-600" strokeWidth={2.5} />
              </div>
              Kết quả tìm kiếm
            </h2>

            {/* Results Content — same structure as SemanticSearchPage empty/loading */}
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : recordings.length === 0 ? (
              <div className="py-10 text-center">
                <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">Không tìm thấy bản thu</h3>
                <p className="text-neutral-600 font-medium leading-relaxed max-w-md mx-auto mb-4">
                  Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm kết quả phù hợp hơn. Bạn cũng có thể dùng Tìm theo ý nghĩa.
                </p>
                <Link
                  to="/semantic-search"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-primary-600/40 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
                >
                  Tìm theo ý nghĩa
                  <Sparkles className="h-4 w-4" strokeWidth={2.5} />
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <p className="text-neutral-700 font-medium leading-relaxed">
                    Tìm thấy {totalResults} bản thu
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const payload = recordings.map((r) => ({
                        id: r.id,
                        title: r.title,
                        titleVietnamese: r.titleVietnamese,
                        description: r.description,
                        ethnicity: r.ethnicity ? { name: r.ethnicity.name, nameVietnamese: r.ethnicity.nameVietnamese } : null,
                        region: r.region,
                        recordingType: r.recordingType,
                        duration: r.duration,
                        instruments: r.instruments?.map((i) => i.nameVietnamese || i.name) ?? [],
                        performers: r.performers?.map((p) => p.nameVietnamese || p.name) ?? [],
                        uploadedDate: r.uploadedDate,
                        tags: r.tags,
                        metadata: r.metadata,
                        verificationStatus: r.verificationStatus,
                      }));
                      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), total: payload.length, recordings: payload }, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `viettune-search-export-${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-300/80 bg-primary-50/90 text-primary-700 hover:bg-primary-100/90 font-medium transition-all duration-200 cursor-pointer focus:outline-none"
                  >
                    <Download className="h-4 w-4" strokeWidth={2.5} />
                    Xuất dữ liệu (JSON)
                  </button>
                </div>
                <div className="space-y-4 mb-8">
                  {recordings.map((recording, idx) => {
                    try {
                      // Check if this is a local recording (guard audioUrl access)
                      const isLocalRecording =
                        recording.uploader?.id === "local-user" ||
                        (typeof recording.audioUrl === "string" && recording.audioUrl.startsWith("data:audio"));

                      // Use in-memory list (loaded once per fetch) to avoid OOM from large storage
                      const localRecordingData = isLocalRecording
                        ? localRecordingsList.find((r) => r.id === recording.id)
                        : undefined;

                      // Delete handler for local recordings
                      const handleDelete = isLocalRecording ? handleDeleteRecording : undefined;

                      // Use LocalRecording data directly like HomePage.tsx
                      if (localRecordingData) {
                        // Determine media source
                        let mediaSrc: string | undefined;
                        if (localRecordingData.mediaType === "youtube" && localRecordingData.youtubeUrl) {
                          mediaSrc = localRecordingData.youtubeUrl;
                        } else if (localRecordingData.mediaType === "video") {
                          // VideoPlayer CHỈ nhận videoData, không fallback về audioData
                          if (localRecordingData.videoData && typeof localRecordingData.videoData === 'string' && localRecordingData.videoData.trim().length > 0) {
                            mediaSrc = localRecordingData.videoData;
                          }
                        } else if (localRecordingData.mediaType === "audio") {
                          // AudioPlayer CHỈ nhận audioData
                          if (localRecordingData.audioData && typeof localRecordingData.audioData === 'string' && localRecordingData.audioData.trim().length > 0) {
                            mediaSrc = localRecordingData.audioData;
                          }
                        } else if (localRecordingData.audioData) {
                          // Fallback cho trường hợp mediaType chưa được set
                          mediaSrc = localRecordingData.audioData;
                        }

                        // Determine if it's video/YouTube
                        let isVideo = false;
                        if (localRecordingData.mediaType === "video" || localRecordingData.mediaType === "youtube") {
                          isVideo = true;
                        } else if (mediaSrc && (isYouTubeUrl(mediaSrc) || (typeof mediaSrc === 'string' && mediaSrc.startsWith('data:video/')))) {
                          isVideo = true;
                        }

                        if (!mediaSrc) {
                          return null;
                        }

                        // Convert LocalRecording to Recording for type safety
                        const convertedRecording = {
                          id: localRecordingData.id ?? "local-" + Math.random().toString(36).slice(2),
                          title: localRecordingData.basicInfo?.title || localRecordingData.title || "Không có tiêu đề",
                          titleVietnamese: localRecordingData.basicInfo?.title || localRecordingData.title || "Không có tiêu đề",
                          description: localRecordingData.description || `Bản thu được tải lên từ thiết bị của bạn`,
                          ethnicity: localRecordingData.ethnicity ?? {
                            id: "local",
                            name: "Không xác định",
                            nameVietnamese: "Không xác định",
                            region: Region.RED_RIVER_DELTA,
                            recordingCount: 0,
                          },
                          region: localRecordingData.region ?? Region.RED_RIVER_DELTA,
                          recordingType: localRecordingData.recordingType ?? RecordingType.OTHER,
                          duration: localRecordingData.duration ?? 0,
                          audioUrl: localRecordingData.audioUrl ?? mediaSrc ?? "",
                          instruments: localRecordingData.instruments ?? [],
                          performers: localRecordingData.performers ?? [],
                          uploadedDate: localRecordingData.uploadedDate ?? new Date().toISOString(),
                          uploader: typeof localRecordingData.uploader === "object" && localRecordingData.uploader !== null ? {
                            id: localRecordingData.uploader?.id ?? "local-user",
                            username: localRecordingData.uploader?.username ?? "Bạn",
                            email: localRecordingData.uploader?.email ?? "",
                            fullName: localRecordingData.uploader?.fullName ?? localRecordingData.uploader?.username ?? "Người tải lên",
                            role: (typeof localRecordingData.uploader?.role === "string" ? localRecordingData.uploader?.role : UserRole.USER) as UserRole,
                            createdAt: localRecordingData.uploader?.createdAt ?? new Date().toISOString(),
                            updatedAt: localRecordingData.uploader?.updatedAt ?? new Date().toISOString(),
                          } : {
                            id: "local-user",
                            username: "Bạn",
                            email: "",
                            fullName: "Người tải lên",
                            role: UserRole.USER,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          },
                          tags: buildTagsFromLocal(localRecordingData),
                          metadata: {
                            ...localRecordingData.metadata,
                            recordingQuality: localRecordingData.metadata?.recordingQuality ?? RecordingQuality.FIELD_RECORDING,
                            lyrics: localRecordingData.metadata?.lyrics ?? "",
                          },
                          verificationStatus: localRecordingData.verificationStatus ?? (localRecordingData.moderation?.status === "APPROVED" ? VerificationStatus.VERIFIED : VerificationStatus.PENDING),
                          viewCount: localRecordingData.viewCount ?? 0,
                          likeCount: localRecordingData.likeCount ?? 0,
                          downloadCount: localRecordingData.downloadCount ?? 0,
                          _originalLocalData: localRecordingData,
                        } as RecordingWithLocalData;

                        return isVideo ? (
                          <VideoPlayer
                            key={recording.id || `local-${idx}`}
                            src={mediaSrc}
                            title={localRecordingData.basicInfo?.title || localRecordingData.title || "Không có tiêu đề"}
                            artist={localRecordingData.basicInfo?.artist}
                            recording={convertedRecording}
                            showContainer={true}
                            returnTo={returnTo}
                          />
                        ) : (
                          <AudioPlayer
                            key={recording.id || `local-${idx}`}
                            src={mediaSrc}
                            title={localRecordingData.basicInfo?.title || localRecordingData.title || "Không có tiêu đề"}
                            artist={localRecordingData.basicInfo?.artist}
                            recording={convertedRecording}
                            onDelete={handleDelete}
                            showContainer={true}
                            returnTo={returnTo}
                          />
                        );
                      }

                      // For API recordings, check if it's video/YouTube
                      const apiSrc = typeof recording.audioUrl === "string" ? recording.audioUrl : "";
                      const isApiVideo = apiSrc && (isYouTubeUrl(apiSrc) || apiSrc.match(/\.(mp4|mov|avi|webm|mkv|mpeg|mpg|wmv|3gp|flv)$/i));

                      return isApiVideo ? (
                        <VideoPlayer
                          key={recording.id || `api-${idx}`}
                          src={apiSrc}
                          title={recording.title}
                          artist={recording.titleVietnamese}
                          recording={recording}
                          showContainer={true}
                          returnTo={returnTo}
                        />
                      ) : (
                        <AudioPlayer
                          key={recording.id || `api-${idx}`}
                          src={apiSrc}
                          title={recording.title}
                          artist={recording.titleVietnamese}
                          recording={recording}
                          showContainer={true}
                          returnTo={returnTo}
                        />
                      );
                    } catch (err) {
                      console.error("Error rendering recording:", err, recording);
                      return (
                        <div key={recording.id || `err-${idx}`} className="border border-red-200 rounded-xl p-6 text-center text-red-600">
                          <p>Có lỗi khi hiển thị bản thu.</p>
                        </div>
                      );
                    }
                  })}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Initial State - Search Tips */}
        {!hasSearched && (
          <div className="border border-neutral-200/80 rounded-2xl p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl mb-8" style={{ backgroundColor: "#FFFCF5" }}>
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900 flex items-center gap-3">
              <div className="p-2 bg-primary-100/90 rounded-lg shadow-sm">
                <Search className="h-5 w-5 text-primary-600" strokeWidth={2.5} />
              </div>
              Mẹo tìm kiếm
            </h2>
            <ul className="space-y-3 text-neutral-700 font-medium leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-primary-600 flex-shrink-0">•</span>
                <span>Sử dụng từ khóa cụ thể như tên bài hát, nghệ nhân, hoặc nhạc cụ</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 flex-shrink-0">•</span>
                <span>Kết hợp nhiều bộ lọc để thu hẹp kết quả tìm kiếm</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 flex-shrink-0">•</span>
                <span>Thử tìm theo vùng miền hoặc dân tộc để khám phá âm nhạc đặc trưng</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 flex-shrink-0">•</span>
                <span>Bộ lọc "Đã xác minh" giúp tìm các bản thu đã được kiểm chứng</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}