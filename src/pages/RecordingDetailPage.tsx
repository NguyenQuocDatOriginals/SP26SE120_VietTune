import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Recording, Region, RecordingType, RecordingQuality, VerificationStatus, UserRole } from "@/types";
import { recordingService } from "@/services/recordingService";
import { Heart, Download, Share2, Eye, User, Users, MapPin, Music } from "lucide-react";
import Badge from "@/components/common/Badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";
import BackButton from "@/components/common/BackButton";
import { RECORDING_TYPE_NAMES, REGION_NAMES } from "@/config/constants";

// Helper function to map Vietnamese region name to Region enum
const getRegionFromVietnameseName = (vietnameseName: string | undefined): Region | undefined => {
  if (!vietnameseName) return undefined;
  const entry = Object.entries(REGION_NAMES).find(([, name]) => name === vietnameseName) as [string, string] | undefined;
  return entry ? (entry[0] as Region) : undefined;
};
import { format } from "date-fns";
import { migrateVideoDataToVideoData } from "@/utils/helpers";
import AudioPlayer from "@/components/features/AudioPlayer";
import VideoPlayer from "@/components/features/VideoPlayer";
import { isYouTubeUrl } from "@/utils/youtube";
import type { LocalRecording } from "@/pages/ApprovedRecordingsPage";

// Extended type for local recording storage (supports both legacy and new formats)
type LocalRecordingStorage = LocalRecording & {
  uploadedAt?: string; // Legacy field
  culturalContext?: {
    ethnicity?: string;
    region?: string; // Vietnamese region name from UploadMusic
  };
  _hasRealRegion?: boolean; // Flag to track if region was actually set by user
  file?: {
    duration?: number;
  };
};

// Extended Recording type that may include original local data
type RecordingWithLocalData = Recording & {
  _originalLocalData?: LocalRecordingStorage & {
    culturalContext?: {
      region?: string;
    };
  };
};

export default function RecordingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRecording(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRecording = async (recordingId: string) => {
    try {
      // First try to load from localStorage (local recordings)
      try {
        const raw = localStorage.getItem("localRecordings");
        if (raw) {
          const all = JSON.parse(raw);
          const migrated = migrateVideoDataToVideoData(all);
          const local = migrated.find((r) => r.id === recordingId) as LocalRecordingStorage | undefined;
          if (local) {
            // Convert local recording to Recording format
            const converted = {
              id: local.id ?? "",
              title: local.basicInfo?.title || local.title || "Không có tiêu đề",
              titleVietnamese: local.titleVietnamese ?? "",
              description: local.description ?? "",
              ethnicity: local.ethnicity ?? {
                id: "local",
                name: local.culturalContext?.ethnicity || "Không xác định",
                nameVietnamese: local.culturalContext?.ethnicity || "Không xác định",
                region: getRegionFromVietnameseName(local.culturalContext?.region) ?? Region.RED_RIVER_DELTA, // Keep for ethnicity.region compatibility
                recordingCount: 0,
              },
              region: (() => {
                // Get region from local.region (if it's a Region enum) or from culturalContext.region (Vietnamese name)
                if (local.region) {
                  return local.region;
                }
                const mappedRegion = getRegionFromVietnameseName(local.culturalContext?.region);
                if (mappedRegion) {
                  return mappedRegion;
                }
                // No region from user, but Recording type requires a Region, so use RED_RIVER_DELTA as placeholder
                // We'll check in display logic to show "Không xác định" instead
                return Region.RED_RIVER_DELTA;
              })(),
              // Store original data to check if region was actually set
              _originalLocalData: local,
              recordingType: local.recordingType ?? RecordingType.OTHER,
              duration: local.file?.duration ?? local.duration ?? 0,
              audioUrl: local.audioUrl ?? local.audioData ?? "",
              waveformUrl: local.waveformUrl ?? "",
              coverImage: local.coverImage ?? "",
              instruments: local.instruments ?? [],
              performers: local.performers ?? [],
              recordedDate: local.recordedDate ?? "",
              uploadedDate: local.uploadedDate ?? local.uploadedAt ?? new Date().toISOString(),
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
              verificationStatus: local.verificationStatus ?? VerificationStatus.PENDING,
              verifiedBy: local.verifiedBy ?? undefined,
              viewCount: local.viewCount ?? 0,
              likeCount: local.likeCount ?? 0,
              downloadCount: local.downloadCount ?? 0,
            } as Recording;
            setRecording(converted);
            setLoading(false);
            return;
          }
        }
      } catch (localError) {
        console.error("Error loading local recording:", localError);
      }

      // If not found in localStorage, try API
      const response = await recordingService.getRecordingById(recordingId);
      setRecording(response.data);
    } catch (error) {
      console.error("Error fetching recording:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-neutral-900">
              Không tìm thấy bản thu
            </h1>
            <BackButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">
            Chi tiết bản thu
          </h1>
          <BackButton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Media Player */}
            <div className="mb-6">
              <div>
                {(() => {
                  // Try to get media source from local recording
                  if (!recording.id) return null;
                  try {
                    const raw = localStorage.getItem("localRecordings");
                    if (raw) {
                      const all = JSON.parse(raw);
                      const migrated = migrateVideoDataToVideoData(all);
                      const local = migrated.find((r) => r.id === recording.id) as LocalRecordingStorage | undefined;
                      if (local) {
                        let mediaSrc: string | undefined;
                        let isVideo = false;

                        // Check YouTube URL first
                        if (local.mediaType === "youtube" && local.youtubeUrl && local.youtubeUrl.trim()) {
                          mediaSrc = local.youtubeUrl.trim();
                          isVideo = true;
                        } else if (local.youtubeUrl && typeof local.youtubeUrl === 'string' && local.youtubeUrl.trim() && isYouTubeUrl(local.youtubeUrl)) {
                          mediaSrc = local.youtubeUrl.trim();
                          isVideo = true;
                        }
                        // Check video data
                        else if (local.mediaType === "video" && local.videoData && typeof local.videoData === 'string' && local.videoData.trim().length > 0) {
                          mediaSrc = local.videoData;
                          isVideo = true;
                        }
                        // Check audio data
                        else if (local.mediaType === "audio" && local.audioData && typeof local.audioData === 'string' && local.audioData.trim().length > 0) {
                          mediaSrc = local.audioData;
                          isVideo = false;
                        }
                        // Fallback: try to detect from data
                        else if (local.videoData && typeof local.videoData === 'string' && local.videoData.trim().length > 0) {
                          mediaSrc = local.videoData;
                          isVideo = true;
                        } else if (local.audioData && typeof local.audioData === 'string' && local.audioData.trim().length > 0) {
                          mediaSrc = local.audioData;
                          if (mediaSrc.startsWith('data:video/')) {
                            isVideo = true;
                          } else {
                            isVideo = false;
                          }
                        }

                        if (mediaSrc) {
                          const artistName = local.basicInfo?.artist || recording.performers?.[0]?.name;
                          if (isVideo) {
                            return (
                              <VideoPlayer
                                src={mediaSrc}
                                title={recording.title}
                                artist={artistName}
                                recording={recording}
                                showContainer={true}
                              />
                            );
                          } else {
                            return (
                              <AudioPlayer
                                src={mediaSrc}
                                title={recording.title}
                                artist={artistName}
                                recording={recording}
                                showContainer={true}
                              />
                            );
                          }
                        }
                      }
                    }
                  } catch (err) {
                    console.error("Error loading local recording for playback:", err);
                  }

                  // Fallback: use audioUrl from recording
                  if (recording.audioUrl) {
                    const isVideo = isYouTubeUrl(recording.audioUrl) || recording.audioUrl.startsWith('data:video/');
                    if (isVideo) {
                      return (
                        <VideoPlayer
                          src={recording.audioUrl}
                          title={recording.title}
                          artist={recording.performers?.[0]?.name}
                          recording={recording}
                          showContainer={true}
                        />
                      );
                    } else {
                      return (
                        <AudioPlayer
                          src={recording.audioUrl}
                          title={recording.title}
                          artist={recording.performers?.[0]?.name}
                          recording={recording}
                          showContainer={true}
                        />
                      );
                    }
                  }

                  return null;
                })()}
              </div>
            </div>

            {/* Thích, Tải xuống, Chia sẻ */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Button variant="outline">
                <Heart className="h-5 w-5 mr-2" />
                Thích
              </Button>
              <Button variant="outline">
                <Download className="h-5 w-5 mr-2" />
                Tải xuống
              </Button>
              <Button variant="outline">
                <Share2 className="h-5 w-5 mr-2" />
                Chia sẻ
              </Button>
            </div>

            {/* Stats */}
            <div className="rounded-2xl border border-neutral-200 p-6 mb-6 shadow-md" style={{ backgroundColor: '#FFFCF5' }}>
              <div className="flex items-center space-x-8 text-neutral-700">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-primary-600" />
                  <span>{recording.viewCount} lượt xem</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-primary-600" />
                  <span>{recording.likeCount} lượt thích</span>
                </div>
                <div className="flex items-center">
                  <Download className="h-5 w-5 mr-2 text-primary-600" />
                  <span>{recording.downloadCount} lượt tải</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {recording.description && (
              <div className="rounded-2xl border border-neutral-200 p-6 mb-6 shadow-md" style={{ backgroundColor: '#FFFCF5' }}>
                <h2 className="text-xl font-semibold mb-4 text-neutral-900">Mô tả</h2>
                <p className="text-neutral-700 whitespace-pre-wrap">
                  {recording.description}
                </p>
              </div>
            )}

            {/* Metadata */}
            {recording.metadata && (
              recording.metadata.tuningSystem || 
              recording.metadata.modalStructure || 
              recording.metadata.ritualContext || 
              recording.metadata.culturalSignificance
            ) && (
              <div className="rounded-2xl border border-neutral-200 p-6 mb-6 shadow-md" style={{ backgroundColor: '#FFFCF5' }}>
                <h2 className="text-xl font-semibold mb-4 text-neutral-900">
                  Thông tin chuyên môn
                </h2>
                <dl className="space-y-3">
                  {recording.metadata.tuningSystem && (
                    <div>
                      <dt className="font-medium text-neutral-900">
                        Hệ thống điệu thức
                      </dt>
                      <dd className="text-neutral-700">
                        {recording.metadata.tuningSystem}
                      </dd>
                    </div>
                  )}
                  {recording.metadata.modalStructure && (
                    <div>
                      <dt className="font-medium text-neutral-900">
                        Cấu trúc giai điệu
                      </dt>
                      <dd className="text-neutral-700">
                        {recording.metadata.modalStructure}
                      </dd>
                    </div>
                  )}
                  {recording.metadata.ritualContext && (
                    <div>
                      <dt className="font-medium text-neutral-900">
                        Ngữ cảnh nghi lễ
                      </dt>
                      <dd className="text-neutral-700">
                        {recording.metadata.ritualContext}
                      </dd>
                    </div>
                  )}
                  {recording.metadata.culturalSignificance && (
                    <div>
                      <dt className="font-medium text-neutral-900">
                        Ý nghĩa văn hóa
                      </dt>
                      <dd className="text-neutral-700">
                        {recording.metadata.culturalSignificance}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Lyrics */}
            {recording.metadata?.lyrics && (
              <div className="rounded-2xl border border-neutral-200 p-6 shadow-md" style={{ backgroundColor: '#FFFCF5' }}>
                <h2 className="text-xl font-semibold mb-4 text-neutral-900">
                  Lời bài hát
                </h2>
                <p className="text-neutral-700 whitespace-pre-wrap mb-4">
                  {recording.metadata.lyrics}
                </p>
                {recording.metadata.lyricsTranslation && (
                  <>
                    <h3 className="font-medium text-neutral-900 mb-2">Dịch nghĩa</h3>
                    <p className="text-neutral-700 whitespace-pre-wrap">
                      {recording.metadata.lyricsTranslation}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="rounded-2xl border border-neutral-200 p-6 shadow-md" style={{ backgroundColor: '#FFFCF5' }}>
              <h3 className="font-semibold text-lg mb-4 text-neutral-900">
                Thông tin
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-neutral-500">Dân tộc</dt>
                  <dd className="font-medium text-neutral-900">
                    {recording.ethnicity.nameVietnamese}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Vùng miền</dt>
                  <dd className="font-medium text-neutral-900">
                    {(() => {
                      // Check if region was actually set by user (not a default placeholder)
                      // For local recordings, check if there was a region in the original data
                      const originalData = (recording as RecordingWithLocalData)._originalLocalData;
                      const hasRealRegion = originalData 
                        ? (originalData.region || originalData.culturalContext?.region)
                        : true; // For API recordings, assume region is real
                      
                      if (!hasRealRegion || !recording.region || !REGION_NAMES[recording.region]) {
                        return "Không xác định";
                      }
                      return REGION_NAMES[recording.region];
                    })()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Loại hình</dt>
                  <dd className="font-medium text-neutral-900">
                    {RECORDING_TYPE_NAMES[recording.recordingType]}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Thời lượng</dt>
                  <dd className="font-medium text-neutral-900">
                    {Math.floor(recording.duration / 60)}:
                    {(recording.duration % 60).toString().padStart(2, "0")}
                  </dd>
                </div>
                {recording.recordedDate && (
                  <div>
                    <dt className="text-sm text-neutral-500">Ngày thu âm</dt>
                    <dd className="font-medium text-neutral-900">
                      {format(new Date(recording.recordedDate), "PP")}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-neutral-500">Ngày tải lên</dt>
                  <dd className="font-medium text-neutral-900">
                    {format(new Date(recording.uploadedDate), "d/M/yyyy")}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Instruments */}
            {recording.instruments.length > 0 && (
              <div className="rounded-2xl border border-neutral-200 p-6 shadow-md" style={{ backgroundColor: '#FFFCF5' }}>
                <h3 className="font-semibold text-lg mb-4 text-neutral-900">
                  Nhạc cụ
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recording.instruments.map((instrument) => (
                    <Badge key={instrument.id} variant="primary">
                      {instrument.nameVietnamese}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Performers */}
            {recording.performers.length > 0 && (
              <div className="rounded-2xl border border-neutral-200 p-6 shadow-md" style={{ backgroundColor: '#FFFCF5' }}>
                <h3 className="font-semibold text-lg mb-4 text-neutral-900">
                  Nghệ nhân
                </h3>
                <ul className="space-y-2">
                  {recording.performers.map((performer) => (
                    <li
                      key={performer.id}
                      className="flex items-center text-neutral-700"
                    >
                      <User className="h-4 w-4 mr-2 text-primary-600" />
                      <span>{performer.name}</span>
                      {performer.title && (
                        <Badge variant="secondary" size="sm" className="ml-2">
                          {performer.title}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {(() => {
              // Collect all tags from AudioPlayer and VideoPlayer
              const allTags: JSX.Element[] = [];
              
              // Ethnicity tag (from AudioPlayer and VideoPlayer)
              if (recording.ethnicity &&
                  typeof recording.ethnicity === "object" &&
                  recording.ethnicity.name &&
                  recording.ethnicity.name !== "Không xác định" &&
                  recording.ethnicity.name.toLowerCase() !== "unknown" &&
                  recording.ethnicity.name.trim() !== "") {
                allTags.push(
                  <Badge key="ethnicity" variant="secondary" className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {recording.ethnicity.nameVietnamese || recording.ethnicity.name}
                  </Badge>
                );
              }
              
              // Region tag (from AudioPlayer and VideoPlayer)
              // AudioPlayer always shows region (even if "Không xác định"), VideoPlayer only shows if not RED_RIVER_DELTA
              // We'll show region like AudioPlayer does - always display
              const regionName = (() => {
                if (!recording.region || !REGION_NAMES[recording.region]) {
                  return "Không xác định";
                }
                const originalData = (recording as RecordingWithLocalData)._originalLocalData;
                if (originalData) {
                  const hasRealRegion = originalData.region || originalData.culturalContext?.region;
                  if (!hasRealRegion) {
                    return "Không xác định";
                  }
                }
                if (recording.region === Region.RED_RIVER_DELTA && !originalData) {
                  return "Không xác định";
                }
                return REGION_NAMES[recording.region];
              })();
              
              allTags.push(
                <Badge key="region" variant="secondary" className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {regionName}
                </Badge>
              );
              
              // Recording Type tag (from AudioPlayer) — bỏ "Khác"
              if (recording.recordingType && RECORDING_TYPE_NAMES[recording.recordingType] && RECORDING_TYPE_NAMES[recording.recordingType] !== "Khác") {
                allTags.push(
                  <Badge key="recordingType" variant="primary" className="inline-flex items-center gap-1">
                    <Music className="h-3 w-3" />
                    {RECORDING_TYPE_NAMES[recording.recordingType]}
                  </Badge>
                );
              }
              
              // Tags from recording.tags (from AudioPlayer) — icon cho "Dân ca"
              if (recording.tags && recording.tags.length > 0) {
                recording.tags.forEach((tag, idx) => {
                  if (tag && tag.trim() !== "") {
                    allTags.push(
                      <Badge key={`tag-${idx}`} variant="secondary" className="inline-flex items-center gap-1">
                        {tag.toLowerCase().includes("dân ca") && <Music className="h-3 w-3" />}
                        {tag}
                      </Badge>
                    );
                  }
                });
              }
              
              // Instruments tags (from AudioPlayer)
              if (recording.instruments && recording.instruments.length > 0) {
                recording.instruments.forEach((instrument) => {
                  allTags.push(
                    <Badge key={`instrument-${instrument.id}`} variant="secondary">
                      {instrument.nameVietnamese || instrument.name}
                    </Badge>
                  );
                });
              }
              
              return allTags.length > 0 ? (
                <div className="rounded-2xl border border-neutral-200 p-6 shadow-md" style={{ backgroundColor: '#FFFCF5' }}>
                  <h3 className="font-semibold text-lg mb-4 text-neutral-900">Thẻ</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Uploader */}
            <div className="rounded-2xl border border-neutral-200 p-6 shadow-md" style={{ backgroundColor: '#FFFCF5' }}>
              <h3 className="font-semibold text-lg mb-4 text-neutral-900">
                Người tải lên
              </h3>
              <div className="flex items-center">
                <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {recording.uploader.fullName}
                  </p>
                  <p className="text-sm text-neutral-500">
                    @{recording.uploader.username}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}