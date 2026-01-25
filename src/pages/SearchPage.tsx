import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import { Recording, SearchFilters, Region, RecordingType, VerificationStatus, RecordingQuality, UserRole } from "@/types";
import { recordingService } from "@/services/recordingService";
import AudioPlayer from "@/components/features/AudioPlayer";
import VideoPlayer from "@/components/features/VideoPlayer";
import { isYouTubeUrl } from "@/utils/youtube";
import SearchBar from "@/components/features/SearchBar";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { migrateVideoDataToVideoData } from "@/utils/helpers";

// Use LocalRecording type from ApprovedRecordingsPage for consistency
import type { LocalRecording } from "@/pages/ApprovedRecordingsPage";

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
    recordingType: local.recordingType ?? RecordingType.OTHER,
    duration: local.duration ?? duration,
    audioUrl: local.audioUrl ?? mediaSrc ?? "",
    instruments: local.instruments ?? [],
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
    tags: local.tags ?? [local.basicInfo?.genre ?? ""].filter(Boolean),
    metadata: {
      ...local.metadata,
      recordingQuality: local.metadata?.recordingQuality ?? RecordingQuality.FIELD_RECORDING,
      lyrics: local.metadata?.lyrics ?? "",
    },
    verificationStatus: local.verificationStatus ?? (isApproved ? VerificationStatus.VERIFIED : VerificationStatus.PENDING),
    viewCount: local.viewCount ?? 0,
    likeCount: local.likeCount ?? 0,
    downloadCount: local.downloadCount ?? 0,
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
      // Migrate video data từ audioData sang videoData
      const migrated = migrateVideoDataToVideoData(localRecordings);

      // Only include approved local recordings in public results
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

          // Filter by tags (genres, instruments, eventType, province, ethnicity)
          if (filters.tags && filters.tags.length > 0) {
            const recordingTags = [
              ...(r.basicInfo?.genre ? [r.basicInfo.genre] : []),
              ...(r.tags || []),
              ...(r.culturalContext?.instruments || []),
              ...(r.culturalContext?.eventType ? [r.culturalContext.eventType] : []),
              ...(r.culturalContext?.province ? [r.culturalContext.province] : []),
              ...(r.culturalContext?.ethnicity ? [r.culturalContext.ethnicity] : []),
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

          // Filter by recording type
          if (filters.recordingTypes && filters.recordingTypes.length > 0) {
            if (!r.recordingType || !filters.recordingTypes.includes(r.recordingType)) {
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

      // Convert local recordings to Recording format (async to get durations)
      const convertedLocalRecordings = await Promise.all(
        approvedLocalRecordings.map(convertLocalToRecording),
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
      setTotalResults(apiTotal + approvedLocalRecordings.length);
    } catch (error) {
      console.error("Error fetching recordings:", error);

      // Even if API fails, try to show local recordings
      try {
        const localRecordingsRaw = localStorage.getItem("localRecordings");
        const localRecordings: LocalRecording[] = localRecordingsRaw
          ? JSON.parse(localRecordingsRaw)
          : [];
        // Migrate video data từ audioData sang videoData
        const migrated = migrateVideoDataToVideoData(localRecordings);
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
              const recordingTags = [
                ...(r.basicInfo?.genre ? [r.basicInfo.genre] : []),
                ...(r.tags || []),
                ...(r.culturalContext?.instruments || []),
                ...(r.culturalContext?.eventType ? [r.culturalContext.eventType] : []),
                ...(r.culturalContext?.province ? [r.culturalContext.province] : []),
                ...(r.culturalContext?.ethnicity ? [r.culturalContext.ethnicity] : []),
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
              if (!r.recordingType || !filters.recordingTypes.includes(r.recordingType)) {
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">
            Tìm kiếm bài hát
          </h1>
          <BackButton />
        </div>

        {/* Main Search Form */}
        <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 mb-8 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
          <SearchBar onSearch={handleSearch} initialFilters={filters} />
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 mb-8 transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
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
              <div className="border border-neutral-200/80 rounded-xl p-12 text-center shadow-sm backdrop-blur-sm" style={{ backgroundColor: '#FFFCF5' }}>
                <div className="p-4 bg-primary-100/90 rounded-2xl w-fit mx-auto mb-4 shadow-sm">
                  <Search className="h-8 w-8 text-primary-600" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Không tìm thấy bản thu
                </h3>
                <p className="text-neutral-600 font-medium max-w-md mx-auto leading-relaxed">
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
                            // Migrate video data từ audioData sang videoData
                            const migrated = migrateVideoDataToVideoData(localRecordings);
                            const originalLocalRecording = migrated.find(
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
                          tags: localRecordingData.tags ?? [localRecordingData.basicInfo?.genre ?? ""].filter(Boolean),
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
                        />
                      ) : (
                        <AudioPlayer
                          key={recording.id || `api-${idx}`}
                          src={apiSrc}
                          title={recording.title}
                          artist={recording.titleVietnamese}
                          recording={recording}
                          showContainer={true}
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
          <div className="border border-neutral-200/80 rounded-2xl p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
            <h2 className="text-2xl font-semibold mb-4 text-neutral-900 flex items-center gap-3">
              <div className="p-2 bg-primary-100/90 rounded-lg shadow-sm">
                <Search className="h-5 w-5 text-primary-600" strokeWidth={2.5} />
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