import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Recording } from "@/types";
import { recordingService } from "@/services/recordingService";
import { Play, Heart, Download, Share2, Eye, User } from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";
import Badge from "@/components/common/Badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";
import { RECORDING_TYPE_NAMES, REGION_NAMES } from "@/config/constants";
import { format } from "date-fns";
import { addSpotlightEffect } from "@/utils/spotlight";

export default function RecordingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentRecording, setIsPlaying } = usePlayerStore();

  const statsRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const metadataRef = useRef<HTMLDivElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const basicInfoRef = useRef<HTMLDivElement>(null);
  const instrumentsRef = useRef<HTMLDivElement>(null);
  const performersRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchRecording(id);
    }
  }, [id]);

  useEffect(() => {
    if (recording) {
      const cleanupFunctions: (() => void)[] = [];
      if (statsRef.current)
        cleanupFunctions.push(addSpotlightEffect(statsRef.current));
      if (descriptionRef.current)
        cleanupFunctions.push(addSpotlightEffect(descriptionRef.current));
      if (metadataRef.current)
        cleanupFunctions.push(addSpotlightEffect(metadataRef.current));
      if (lyricsRef.current)
        cleanupFunctions.push(addSpotlightEffect(lyricsRef.current));
      if (basicInfoRef.current)
        cleanupFunctions.push(addSpotlightEffect(basicInfoRef.current));
      if (instrumentsRef.current)
        cleanupFunctions.push(addSpotlightEffect(instrumentsRef.current));
      if (performersRef.current)
        cleanupFunctions.push(addSpotlightEffect(performersRef.current));
      if (tagsRef.current)
        cleanupFunctions.push(addSpotlightEffect(tagsRef.current));
      if (uploaderRef.current)
        cleanupFunctions.push(addSpotlightEffect(uploaderRef.current));
      return () => cleanupFunctions.forEach((cleanup) => cleanup());
    }
  }, [recording]);

  const fetchRecording = async (recordingId: string) => {
    try {
      const response = await recordingService.getRecordingById(recordingId);
      setRecording(response.data);
    } catch (error) {
      console.error("Error fetching recording:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (recording) {
      setCurrentRecording(recording);
      setIsPlaying(true);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Recording not found
          </h1>
          <Link to="/recordings" className="text-white hover:text-green-300">
            ← Back to recordings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/recordings"
          className="text-white hover:text-green-300 mb-6 inline-block"
        >
          ← Back to recordings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Cover Image */}
            <div className="bg-secondary-200 rounded-lg overflow-hidden mb-6">
              {recording.coverImage ? (
                <img
                  src={recording.coverImage}
                  alt={recording.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-secondary-400">
                  <div className="text-center">
                    <p className="text-6xl mb-4">🎵</p>
                    <p>No cover image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Title and Actions */}
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {recording.title}
                  </h1>
                  {recording.titleVietnamese && (
                    <p className="text-xl text-white">
                      {recording.titleVietnamese}
                    </p>
                  )}
                </div>
                <Badge
                  variant={
                    recording.verificationStatus === "VERIFIED"
                      ? "success"
                      : "warning"
                  }
                >
                  {recording.verificationStatus}
                </Badge>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handlePlay} variant="primary">
                  <Play className="h-5 w-5 mr-2" />
                  Play
                </Button>
                <Button variant="outline">
                  <Heart className="h-5 w-5 mr-2" />
                  Like ({recording.likeCount})
                </Button>
                <Button variant="outline">
                  <Download className="h-5 w-5 mr-2" />
                  Download
                </Button>
                <Button variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div
              ref={statsRef}
              className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl border border-white/40 p-6 mb-6 shadow-2xl"
              style={{
                boxShadow:
                  "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
              }}
            >
              <div className="flex items-center space-x-8 text-white">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  <span>{recording.viewCount} views</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  <span>{recording.likeCount} likes</span>
                </div>
                <div className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  <span>{recording.downloadCount} downloads</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {recording.description && (
              <div
                ref={descriptionRef}
                className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl border border-white/40 p-6 mb-6 shadow-2xl"
                style={{
                  boxShadow:
                    "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
                }}
              >
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Description
                </h2>
                <p className="text-white whitespace-pre-wrap">
                  {recording.description}
                </p>
              </div>
            )}

            {/* Metadata */}
            {recording.metadata && (
              <div
                ref={metadataRef}
                className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl border border-white/40 p-6 mb-6 shadow-2xl"
                style={{
                  boxShadow:
                    "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
                }}
              >
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Ethnomusicological details
                </h2>
                <dl className="space-y-3">
                  {recording.metadata.tuningSystem && (
                    <div>
                      <dt className="font-medium text-white">Tuning system</dt>
                      <dd className="text-white">
                        {recording.metadata.tuningSystem}
                      </dd>
                    </div>
                  )}
                  {recording.metadata.modalStructure && (
                    <div>
                      <dt className="font-medium text-white">
                        Modal structure
                      </dt>
                      <dd className="text-white">
                        {recording.metadata.modalStructure}
                      </dd>
                    </div>
                  )}
                  {recording.metadata.ritualContext && (
                    <div>
                      <dt className="font-medium text-white">Ritual context</dt>
                      <dd className="text-white">
                        {recording.metadata.ritualContext}
                      </dd>
                    </div>
                  )}
                  {recording.metadata.culturalSignificance && (
                    <div>
                      <dt className="font-medium text-white">
                        Cultural significance
                      </dt>
                      <dd className="text-white">
                        {recording.metadata.culturalSignificance}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Lyrics */}
            {recording.metadata?.lyrics && (
              <div
                ref={lyricsRef}
                className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl border border-white/40 p-6 shadow-2xl"
                style={{
                  boxShadow:
                    "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
                }}
              >
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Lyrics
                </h2>
                <p className="text-white whitespace-pre-wrap mb-4">
                  {recording.metadata.lyrics}
                </p>
                {recording.metadata.lyricsTranslation && (
                  <>
                    <h3 className="font-medium text-white mb-2">Translation</h3>
                    <p className="text-white whitespace-pre-wrap">
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
            <div
              ref={basicInfoRef}
              className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl border border-white/40 p-6 shadow-2xl"
              style={{
                boxShadow:
                  "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
              }}
            >
              <h3 className="font-semibold text-lg mb-4 text-white">
                Information
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-white">Ethnicity</dt>
                  <dd className="font-medium text-white">
                    {recording.ethnicity.nameVietnamese}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-white">Region</dt>
                  <dd className="font-medium text-white">
                    {REGION_NAMES[recording.region]}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-white">Type</dt>
                  <dd className="font-medium text-white">
                    {RECORDING_TYPE_NAMES[recording.recordingType]}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-white">Duration</dt>
                  <dd className="font-medium text-white">
                    {Math.floor(recording.duration / 60)}:
                    {(recording.duration % 60).toString().padStart(2, "0")}
                  </dd>
                </div>
                {recording.recordedDate && (
                  <div>
                    <dt className="text-sm text-white">Recorded</dt>
                    <dd className="font-medium text-white">
                      {format(new Date(recording.recordedDate), "PP")}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-white">Uploaded</dt>
                  <dd className="font-medium text-white">
                    {format(new Date(recording.uploadedDate), "PP")}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Instruments */}
            {recording.instruments.length > 0 && (
              <div
                ref={instrumentsRef}
                className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl border border-white/40 p-6 shadow-2xl"
                style={{
                  boxShadow:
                    "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
                }}
              >
                <h3 className="font-semibold text-lg mb-4 text-white">
                  Instruments
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
              <div
                ref={performersRef}
                className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl border border-white/40 p-6 shadow-2xl"
                style={{
                  boxShadow:
                    "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
                }}
              >
                <h3 className="font-semibold text-lg mb-4 text-white">
                  Performers
                </h3>
                <ul className="space-y-2">
                  {recording.performers.map((performer) => (
                    <li
                      key={performer.id}
                      className="flex items-center text-white"
                    >
                      <User className="h-4 w-4 mr-2 text-white" />
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
            {recording.tags.length > 0 && (
              <div
                ref={tagsRef}
                className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl border border-white/40 p-6 shadow-2xl"
                style={{
                  boxShadow:
                    "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
                }}
              >
                <h3 className="font-semibold text-lg mb-4 text-white">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {recording.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Uploader */}
            <div
              ref={uploaderRef}
              className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl border border-white/40 p-6 shadow-2xl"
              style={{
                boxShadow:
                  "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
              }}
            >
              <h3 className="font-semibold text-lg mb-4 text-white">
                Uploaded by
              </h3>
              <div className="flex items-center">
                <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    {recording.uploader.fullName}
                  </p>
                  <p className="text-sm text-white">
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
