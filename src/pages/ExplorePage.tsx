import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Search, Music, ArrowRight, Sparkles } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import SearchBar from "@/components/features/SearchBar";
import RecordingCard from "@/components/features/RecordingCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Recording, SearchFilters, Region, RecordingType, VerificationStatus, RecordingQuality, UserRole, InstrumentCategory } from "@/types";
import { recordingService } from "@/services/recordingService";
import { getLocalRecordingMetaList, getLocalRecordingFull } from "@/services/recordingStorage";
import { migrateVideoDataToVideoData } from "@/utils/helpers";
import { buildTagsFromLocal, PERFORMANCE_KEY_TO_LABEL } from "@/utils/recordingTags";
import type { LocalRecording } from "@/pages/ApprovedRecordingsPage";

// Helper: audio duration from data URL
const getAudioDuration = (audioDataUrl: string): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener("loadedmetadata", () => resolve(Math.floor(audio.duration)));
    audio.addEventListener("error", () => resolve(0));
    audio.src = audioDataUrl;
  });
};

// Convert LocalRecording to Recording for display (RecordingCard)
const convertLocalToRecording = async (local: LocalRecording): Promise<Recording> => {
  let duration = 0;
  const isVideo = local.mediaType === "video" || local.mediaType === "youtube";
  if (!isVideo && local.audioData) {
    duration = await getAudioDuration(local.audioData);
  }
  let mediaSrc: string | undefined;
  if (local.mediaType === "video" && local.videoData && typeof local.videoData === "string" && local.videoData.trim()) {
    mediaSrc = local.videoData;
  } else if (local.mediaType === "audio" && local.audioData && typeof local.audioData === "string" && local.audioData.trim()) {
    mediaSrc = local.audioData;
  } else if (local.videoData && typeof local.videoData === "string" && local.videoData.trim()) {
    mediaSrc = local.videoData;
  } else if (local.audioData && typeof local.audioData === "string" && local.audioData.trim()) {
    mediaSrc = local.audioData;
  }
  const isApproved = local.moderation?.status === "APPROVED";
  return {
    id: local.id ?? "local-" + Math.random().toString(36).slice(2),
    title: local.basicInfo?.title || local.title || "Không có tiêu đề",
    titleVietnamese: local.basicInfo?.title || local.title || "Không có tiêu đề",
    description: local.description || "Bản thu được tải lên từ thiết bị của bạn",
    ethnicity: local.ethnicity ?? { id: "local", name: "Không xác định", nameVietnamese: "Không xác định", region: Region.RED_RIVER_DELTA, recordingCount: 0 },
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
    instruments: (local.instruments?.length ? local.instruments : ((local as LocalRecording & { culturalContext?: { instruments?: string[] } }).culturalContext?.instruments ?? []).map((name, i) => ({
      id: `inst-${i}`, name, nameVietnamese: name, category: InstrumentCategory.IDIOPHONE, images: [], recordingCount: 0,
    }))),
    performers: local.performers ?? [],
    uploadedDate: local.uploadedDate ?? new Date().toISOString(),
    uploader: typeof local.uploader === "object" && local.uploader != null
      ? { id: local.uploader?.id ?? "local-user", username: local.uploader?.username ?? "Bạn", email: local.uploader?.email ?? "", fullName: local.uploader?.fullName ?? local.uploader?.username ?? "Người tải lên", role: (typeof local.uploader?.role === "string" ? local.uploader.role : UserRole.USER) as UserRole, createdAt: local.uploader?.createdAt ?? new Date().toISOString(), updatedAt: local.uploader?.updatedAt ?? new Date().toISOString() }
      : { id: "local-user", username: "Bạn", email: "", fullName: "Người tải lên", role: UserRole.USER, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    tags: buildTagsFromLocal(local),
    metadata: { ...local.metadata, recordingQuality: local.metadata?.recordingQuality ?? RecordingQuality.FIELD_RECORDING, lyrics: local.metadata?.lyrics ?? "" },
    verificationStatus: local.verificationStatus ?? (isApproved ? VerificationStatus.VERIFIED : VerificationStatus.PENDING),
    viewCount: local.viewCount ?? 0,
    likeCount: local.likeCount ?? 0,
    downloadCount: local.downloadCount ?? 0,
  } as Recording;
};

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
  if (region && Object.values(Region).includes(region as Region)) filters.regions = [region as Region];
  if (type && Object.values(RecordingType).includes(type as RecordingType)) filters.recordingTypes = [type as RecordingType];
  if (status && Object.values(VerificationStatus).includes(status as VerificationStatus)) filters.verificationStatus = [status as VerificationStatus];
  if (from) filters.dateFrom = from;
  if (to) filters.dateTo = to;
  if (tagsParam) filters.tags = tagsParam.split(",").map((t) => t.trim()).filter(Boolean);
  return filters;
}

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

const REGION_MAP: Record<string, Region> = {
  "Trung du và miền núi Bắc Bộ": Region.NORTHERN_MOUNTAINS,
  "Đồng bằng Bắc Bộ": Region.RED_RIVER_DELTA,
  "Bắc Trung Bộ": Region.NORTH_CENTRAL,
  "Nam Trung Bộ": Region.SOUTH_CENTRAL_COAST,
  "Cao nguyên Trung Bộ": Region.CENTRAL_HIGHLANDS,
  "Đông Nam Bộ": Region.SOUTHEAST,
  "Tây Nam Bộ": Region.MEKONG_DELTA,
};

function filterLocalRecordings(list: LocalRecording[], filters: SearchFilters): LocalRecording[] {
  if (!list.length || Object.keys(filters).length === 0) return list;
  return list.filter((r) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const match = (r.basicInfo?.title || r.title || "").toLowerCase().includes(q)
        || (r.basicInfo?.artist || "").toLowerCase().includes(q)
        || (r.basicInfo?.genre || "").toLowerCase().includes(q)
        || (r.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filters.tags?.length) {
      const perfLabel = r.culturalContext?.performanceType ? (PERFORMANCE_KEY_TO_LABEL[r.culturalContext.performanceType] ?? r.culturalContext.performanceType) : "";
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
      const hasTag = filters.tags!.some((ft) =>
        recordingTags.some((rt) => rt.toLowerCase().includes(ft.toLowerCase()) || ft.toLowerCase().includes(rt.toLowerCase()))
      );
      if (!hasTag) return false;
    }
    if (filters.regions?.length) {
      const ok = r.region && filters.regions!.includes(r.region)
        || (r.culturalContext?.region && REGION_MAP[r.culturalContext.region] && filters.regions!.includes(REGION_MAP[r.culturalContext.region]));
      if (!ok) return false;
    }
    if (filters.recordingTypes?.length) {
      const t = r.recordingType ?? ((r as LocalRecording & { culturalContext?: { performanceType?: string } }).culturalContext?.performanceType === "instrumental" ? RecordingType.INSTRUMENTAL : (r as LocalRecording & { culturalContext?: { performanceType?: string } }).culturalContext?.performanceType === "acappella" || (r as LocalRecording & { culturalContext?: { performanceType?: string } }).culturalContext?.performanceType === "vocal_accompaniment" ? RecordingType.VOCAL : null);
      if (!t || !filters.recordingTypes!.includes(t)) return false;
    }
    if (filters.verificationStatus?.length) {
      const approved = r.moderation?.status === "APPROVED";
      const match = filters.verificationStatus!.some((s) => (s === VerificationStatus.VERIFIED && approved) || (s === VerificationStatus.PENDING && !approved));
      if (!match) return false;
    }
    if (filters.dateFrom || filters.dateTo) {
      const d = r.basicInfo?.recordingDate || r.recordedDate;
      if (!d) return false;
      const date = new Date(d);
      if (filters.dateFrom && date < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && date > new Date(filters.dateTo)) return false;
    }
    return true;
  });
}

type ApiResponseType = { items: Recording[]; total: number; totalPages: number };

/**
 * Explore: latest approved recordings (contributor + expert moderation).
 * UI/UX aligned with SemanticSearchPage; search filter via SearchBar.
 */
export default function ExplorePage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const returnTo = location.pathname + location.search;

  const initialFiltersFromUrl = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFiltersFromUrl);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    try {
      let response: ApiResponseType;
      if (Object.keys(filters).length > 0) {
        const res = await recordingService.searchRecordings(filters, currentPage, 20);
        response = res as ApiResponseType;
      } else {
        const res = await recordingService.getRecordings(currentPage, 20);
        response = res as ApiResponseType;
      }
      const apiItems = Array.isArray(response?.items) ? response.items : [];
      const apiTotal = typeof response?.total === "number" ? response.total : apiItems.length;

      const metaList = await getLocalRecordingMetaList();
      const migrated = migrateVideoDataToVideoData(metaList);
      const approved = migrated.filter((r) => r.moderation?.status === "APPROVED");
      const filteredLocal = filterLocalRecordings(approved, filters);
      const fullList = (await Promise.all(filteredLocal.map((r) => getLocalRecordingFull(r.id ?? "")))).filter((r): r is LocalRecording => r != null);
      const convertedLocal = await Promise.all(fullList.map(convertLocalToRecording));

      const merged = [...convertedLocal, ...apiItems];
      const sorted = [...merged].sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime());

      setRecordings(sorted);
      setTotalResults(apiTotal + fullList.length);
    } catch (error) {
      console.error("Error fetching recordings:", error);
      setRecordings([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  const handleSearch = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    const params = searchParamsFromFilters(newFilters);
    setSearchParams(Object.keys(params).length > 0 ? params : {}, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    const next = filtersFromSearchParams(searchParams);
    setFilters(next);
    setCurrentPage(1);
  }, [searchParams]);

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header — same as SemanticSearchPage */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            Khám phá âm nhạc dân tộc
          </h1>
          <div className="flex items-center gap-3">
            <Link
              to="/semantic-search"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 py-0 rounded-full bg-primary-100/90 text-primary-700 hover:bg-primary-200/90 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary-500/50 border border-primary-200/80"
              title="Tìm theo ý nghĩa"
            >
              <Sparkles className="h-5 w-5" strokeWidth={2.5} />
              <span>Tìm theo ý nghĩa</span>
            </Link>
            <BackButton />
          </div>
        </div>

        {/* Main Search / Filter card — same style as SemanticSearchPage */}
        <div
          className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 mb-8 transition-all duration-300 hover:shadow-xl"
          style={{ backgroundColor: "#FFFCF5" }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900 flex items-center gap-3">
            <div className="p-2 bg-primary-100/90 rounded-lg shadow-sm">
              <Search className="h-5 w-5 text-primary-600" strokeWidth={2.5} />
            </div>
            Bộ lọc tìm kiếm
          </h2>
          <p className="text-neutral-600 font-medium leading-relaxed mb-4">
            Lọc theo từ khóa, vùng miền, loại hình, thẻ hoặc ngày để tìm bản thu phù hợp.
          </p>
          <SearchBar onSearch={handleSearch} initialFilters={filters} />
        </div>

        {/* Results — same card style as SemanticSearchPage */}
        <div
          className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 mb-8 transition-all duration-300 hover:shadow-xl"
          style={{ backgroundColor: "#FFFCF5" }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900 flex items-center gap-3">
            <div className="p-2 bg-primary-100/90 rounded-lg shadow-sm">
              <Music className="h-5 w-5 text-primary-600" strokeWidth={2.5} />
            </div>
            {hasFilters ? "Kết quả" : "Bản thu mới nhất"}
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : recordings.length === 0 ? (
            <div className="py-10 text-center">
              <Music className="h-12 w-12 text-neutral-400 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Chưa có bản thu nào</h3>
              <p className="text-neutral-600 font-medium leading-relaxed max-w-md mx-auto mb-4">
                {hasFilters ? "Thử thay đổi bộ lọc hoặc xóa bộ lọc để xem bản thu mới nhất." : "Chưa có bản thu nào được kiểm duyệt."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => handleSearch({})}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-primary-600/40 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary-500/50"
                >
                  Xóa bộ lọc
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-neutral-700 font-medium leading-relaxed mb-4">
                {hasFilters ? `Tìm thấy ${totalResults} bản thu` : `Có ${totalResults} bản thu đã được kiểm duyệt`}
              </p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recordings.map((r) => (
                  <li key={r.id}>
                    <RecordingCard recording={r} linkState={{ from: returnTo }} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
