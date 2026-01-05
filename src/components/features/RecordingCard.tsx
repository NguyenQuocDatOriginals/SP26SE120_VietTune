import { Recording } from "@/types";
import { Play, Heart, Download, Eye } from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";
import Badge from "../common/Badge";
import { RECORDING_TYPE_NAMES } from "@/config/constants";

interface RecordingCardProps {
  recording: Recording;
}

export default function RecordingCard({ recording }: RecordingCardProps) {
  const { setCurrentRecording, setIsPlaying } = usePlayerStore();

  const handlePlay = () => {
    setCurrentRecording(recording);
    setIsPlaying(true);
  };

  return (
    <div
      className="backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 overflow-hidden hover:shadow-2xl transition-shadow"
      style={{
        boxShadow:
          "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
      }}
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-secondary-200">
        {recording.coverImage ? (
          <img
            src={recording.coverImage}
            alt={recording.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary-400">
            <div className="text-center">
              <p className="text-4xl mb-2">🎵</p>
              <p className="text-sm">No cover image</p>
            </div>
          </div>
        )}

        {/* Play button overlay */}
        <button
          onClick={handlePlay}
          className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center group"
        >
          <div className="bg-white rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-8 w-8 text-primary-600" />
          </div>
        </button>

        {/* Verification badge */}
        {recording.verificationStatus === "VERIFIED" && (
          <div className="absolute top-2 right-2">
            <Badge variant="success" size="sm">
              Verified
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-secondary-900 mb-1 line-clamp-1">
          {recording.title}
        </h3>
        {recording.titleVietnamese && (
          <p className="text-sm text-secondary-600 mb-2 line-clamp-1">
            {recording.titleVietnamese}
          </p>
        )}

        <div className="flex items-center space-x-2 mb-3">
          <Badge variant="primary" size="sm">
            {recording.ethnicity.nameVietnamese}
          </Badge>
          <Badge variant="secondary" size="sm">
            {RECORDING_TYPE_NAMES[recording.recordingType]}
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-secondary-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {recording.viewCount}
            </span>
            <span className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              {recording.likeCount}
            </span>
            <span className="flex items-center">
              <Download className="h-3 w-3 mr-1" />
              {recording.downloadCount}
            </span>
          </div>
          <span>
            {Math.floor(recording.duration / 60)}:
            {(recording.duration % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
