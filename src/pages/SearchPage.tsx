import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { Recording, SearchFilters, Region, RecordingType, VerificationStatus, RecordingQuality, UserRole } from "@/types";
import { recordingService } from "@/services/recordingService";
import AudioPlayer from "@/components/features/AudioPlayer";
import SearchBar from "@/components/features/SearchBar";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Local recording type for client-saved uploads
interface LocalRecording {
  id: string;
  name: string;
  audioData: string;
  userType?: string;
  detectedType?: string;
  basicInfo?: {
    title?: string;
    artist?: string;
    genre?: string;
  };
  culturalContext?: {
    ethnicity?: string;
    region?: string;
  };
  uploadedAt?: string;
  moderation?: {
    status?: string;
    claimedBy?: string | null;
    claimedByName?: string | null;
    reviewedAt?: string | null;
    reviewerId?: string | null;
  };
  uploader?: {
    id?: string;
    username?: string;
    email?: string;
    fullName?: string;
  };
}

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
  // Get actual audio duration
  const duration = await getAudioDuration(local.audioData);

  const isApproved = local.moderation?.status === "APPROVED";

  return {
    id: local.id,
    title: local.basicInfo?.title || local.name,
    titleVietnamese: local.basicInfo?.title || local.name,
    description: `Bản thu được tải lên từ thiết bị của bạn`,
    ethnicity: {
      id: "local",
      name: local.culturalContext?.ethnicity || "Không xác định",
      nameVietnamese: local.culturalContext?.ethnicity || "Không xác định",
      region: Region.RED_RIVER_DELTA,
      recordingCount: 0,
    },
    region: Region.RED_RIVER_DELTA,
    recordingType: RecordingType.OTHER,
    duration: duration,
    audioUrl: local.audioData,
    instruments: [],
    performers: [],
    uploadedDate: local.uploadedAt || new Date().toISOString(),
    uploader: {
      id: local.uploader?.id || "local-user",
      username: local.uploader?.username || "Bạn",
      email: local.uploader?.email || "",
      fullName: local.uploader?.fullName || local.uploader?.username || "Người tải lên",
      role: UserRole.USER,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    tags: [
      local.basicInfo?.genre || local.userType || local.detectedType || "",
    ].filter(Boolean),
    metadata: {
      recordingQuality: RecordingQuality.FIELD_RECORDING,
      lyrics: "",
    },
    verificationStatus: isApproved ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
    viewCount: 0,
    likeCount: 0,
    downloadCount: 0,
  };
};

export default function SearchPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({});

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

      // Load local recordings from localStorage
      const localRecordingsRaw = localStorage.getItem("localRecordings");
      const localRecordings: LocalRecording[] = localRecordingsRaw
        ? JSON.parse(localRecordingsRaw)
        : [];

      // Only include approved local recordings in public results
      const approvedLocalRecordings = localRecordings.filter(
        (r) => r.moderation?.status === "APPROVED",
      );

      // Convert local recordings to Recording format (async to get durations)
      const convertedLocalRecordings = await Promise.all(
        approvedLocalRecordings.map(convertLocalToRecording),
      );

      // Merge: put local recordings first, then API recordings (defensive checks in case API returns unexpected shape)
      const apiItems = response && Array.isArray((response as any).items) ? (response as any).items : [];
      const allRecordings = [...convertedLocalRecordings, ...apiItems];

      setRecordings(allRecordings);
      setTotalPages(response?.totalPages ?? 1);
      const apiTotal = (response && typeof (response as any).total === 'number') ? (response as any).total : apiItems.length;
      setTotalResults(apiTotal + approvedLocalRecordings.length);
    } catch (error) {
      console.error("Error fetching recordings:", error);

      // Even if API fails, try to show local recordings
      try {
        const localRecordingsRaw = localStorage.getItem("localRecordings");
        const localRecordings: LocalRecording[] = localRecordingsRaw
          ? JSON.parse(localRecordingsRaw)
          : [];
        const approvedLocalRecordings = localRecordings.filter(
          (r) => r.moderation?.status === "APPROVED",
        );
        const convertedLocalRecordings = await Promise.all(
          approvedLocalRecordings.map(convertLocalToRecording),
        );
        setRecordings(convertedLocalRecordings);
        setTotalResults(approvedLocalRecordings.length);
      } catch (localError) {
        console.error("Error loading local recordings:", localError);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  const handleDeleteRecording = (id: string) => {
    const updated = recordings.filter((rec) => rec.id !== id);
    setRecordings(updated);
    const localRecordingsRaw = localStorage.getItem("localRecordings");
    if (localRecordingsRaw) {
      const localRecordings = JSON.parse(localRecordingsRaw);
      const filtered = localRecordings.filter((r: LocalRecording) => r.id !== id);
      localStorage.setItem("localRecordings", JSON.stringify(filtered));
    }
    // Update total results
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
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">
            Tìm kiếm bản thu
          </h1>
        </div>

        {/* Main Search Form */}
        <div className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8" style={{ backgroundColor: '#FFFCF5' }}>
          <SearchBar onSearch={handleSearch} initialFilters={filters} />
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8" style={{ backgroundColor: '#FFFCF5' }}>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-800">
                  Kết quả tìm kiếm
                </h2>
                {!loading && (
                  <p className="text-neutral-500 mt-1">
                    Tìm thấy {totalResults} bản thu
                  </p>
                )}
              </div>
            </div>

            {/* Results Content */}
            {loading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : recordings.length === 0 ? (
              <div className="border border-neutral-200 rounded-xl p-12 text-center" style={{ backgroundColor: '#FFFCF5' }}>
                <div className="p-4 bg-primary-100 rounded-2xl w-fit mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  Không tìm thấy bản thu
                </h3>
                <p className="text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm kết quả phù hợp hơn
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {recordings.map((recording, idx) => {
                    try {
                      // Check if this is a local recording (guard audioUrl access)
                      const isLocalRecording =
                        recording.uploader?.id === "local-user" ||
                        (typeof recording.audioUrl === "string" && recording.audioUrl.startsWith("data:audio"));

                      // Load original LocalRecording from localStorage if it's a local recording
                      let localRecordingData: LocalRecording | undefined = undefined;
                      if (isLocalRecording) {
                        try {
                          const localRecordingsRaw = localStorage.getItem("localRecordings");
                          if (localRecordingsRaw) {
                            const localRecordings: LocalRecording[] = JSON.parse(localRecordingsRaw);
                            const originalLocalRecording = localRecordings.find(
                              (r) => r.id === recording.id
                            );
                            if (originalLocalRecording) {
                              localRecordingData = originalLocalRecording;
                            }
                          }
                        } catch (error) {
                          console.error("Error loading local recording:", error);
                        }
                      }

                      // Delete handler for local recordings
                      const handleDelete = isLocalRecording ? handleDeleteRecording : undefined;

                      // Use LocalRecording data directly like HomePage.tsx
                      if (localRecordingData) {
                        return (
                          <AudioPlayer
                            key={recording.id || `local-${idx}`}
                            src={localRecordingData.audioData}
                            title={localRecordingData.basicInfo?.title || localRecordingData.name}
                            artist={localRecordingData.basicInfo?.artist}
                            recording={localRecordingData}
                            onDelete={handleDelete}
                            showContainer={true}
                          />
                        );
                      }

                      // For API recordings, use AudioPlayer without container (guard src)
                      return (
                        <AudioPlayer
                          key={recording.id || `api-${idx}`}
                          src={typeof recording.audioUrl === "string" ? recording.audioUrl : ""}
                          title={recording.title}
                          artist={recording.titleVietnamese}
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
          <div className="border border-neutral-200 rounded-2xl p-8 shadow-md" style={{ backgroundColor: '#FFFCF5' }}>
            <h2 className="text-2xl font-semibold mb-4 text-neutral-800 flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Search className="h-5 w-5 text-primary-600" />
              </div>
              Mẹo tìm kiếm
            </h2>
            <ul className="space-y-3 text-neutral-700 leading-relaxed">
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