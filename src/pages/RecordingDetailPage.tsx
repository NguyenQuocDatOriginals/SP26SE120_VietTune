import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Recording } from "@/types";
import { recordingService } from "@/services/recordingService";
import { Play, Heart, Download, Share2, Eye, User } from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";
import Badge from "@/components/common/Badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";
import { RECORDING_TYPE_NAMES, REGION_NAMES } from "@/config/constants";
import { format } from "date-fns";

export default function RecordingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentRecording, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    if (id) {
      fetchRecording(id);
    }
  }, [id]);

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
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-secondary-900 mb-4">
          Recording not found
        </h1>
        <Link
          to="/recordings"
          className="text-primary-600 hover:text-primary-700"
        >
          ← Back to recordings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/recordings"
        className="text-primary-600 hover:text-primary-700 mb-6 inline-block"
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
                <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                  {recording.title}
                </h1>
                {recording.titleVietnamese && (
                  <p className="text-xl text-secondary-600">
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
          <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
            <div className="flex items-center space-x-8 text-secondary-600">
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
            <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-secondary-700 whitespace-pre-wrap">
                {recording.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          {recording.metadata && (
            <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Ethnomusicological Details
              </h2>
              <dl className="space-y-3">
                {recording.metadata.tuningSystem && (
                  <div>
                    <dt className="font-medium text-secondary-700">
                      Tuning System
                    </dt>
                    <dd className="text-secondary-600">
                      {recording.metadata.tuningSystem}
                    </dd>
                  </div>
                )}
                {recording.metadata.modalStructure && (
                  <div>
                    <dt className="font-medium text-secondary-700">
                      Modal Structure
                    </dt>
                    <dd className="text-secondary-600">
                      {recording.metadata.modalStructure}
                    </dd>
                  </div>
                )}
                {recording.metadata.ritualContext && (
                  <div>
                    <dt className="font-medium text-secondary-700">
                      Ritual Context
                    </dt>
                    <dd className="text-secondary-600">
                      {recording.metadata.ritualContext}
                    </dd>
                  </div>
                )}
                {recording.metadata.culturalSignificance && (
                  <div>
                    <dt className="font-medium text-secondary-700">
                      Cultural Significance
                    </dt>
                    <dd className="text-secondary-600">
                      {recording.metadata.culturalSignificance}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Lyrics */}
          {recording.metadata?.lyrics && (
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Lyrics</h2>
              <p className="text-secondary-700 whitespace-pre-wrap mb-4">
                {recording.metadata.lyrics}
              </p>
              {recording.metadata.lyricsTranslation && (
                <>
                  <h3 className="font-medium text-secondary-700 mb-2">
                    Translation
                  </h3>
                  <p className="text-secondary-600 whitespace-pre-wrap">
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
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-4">Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-secondary-500">Ethnicity</dt>
                <dd className="font-medium">
                  {recording.ethnicity.nameVietnamese}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-secondary-500">Region</dt>
                <dd className="font-medium">
                  {REGION_NAMES[recording.region]}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-secondary-500">Type</dt>
                <dd className="font-medium">
                  {RECORDING_TYPE_NAMES[recording.recordingType]}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-secondary-500">Duration</dt>
                <dd className="font-medium">
                  {Math.floor(recording.duration / 60)}:
                  {(recording.duration % 60).toString().padStart(2, "0")}
                </dd>
              </div>
              {recording.recordedDate && (
                <div>
                  <dt className="text-sm text-secondary-500">Recorded</dt>
                  <dd className="font-medium">
                    {format(new Date(recording.recordedDate), "PP")}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-secondary-500">Uploaded</dt>
                <dd className="font-medium">
                  {format(new Date(recording.uploadedDate), "PP")}
                </dd>
              </div>
            </dl>
          </div>

          {/* Instruments */}
          {recording.instruments.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-4">Instruments</h3>
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
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-4">Performers</h3>
              <ul className="space-y-2">
                {recording.performers.map((performer) => (
                  <li key={performer.id} className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-secondary-500" />
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
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-4">Tags</h3>
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
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-4">Uploaded by</h3>
            <div className="flex items-center">
              <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="font-medium">{recording.uploader.fullName}</p>
                <p className="text-sm text-secondary-500">
                  @{recording.uploader.username}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
