import { Recording } from "@/types";
import { Play, Heart, Download, Eye } from "lucide-react";
import Badge from "../common/Badge";
import { RECORDING_TYPE_NAMES } from "@/config/constants";
import logo from "@/components/image/VietTune logo.png";
import { Link } from "react-router-dom";

interface RecordingCardProps {
  recording: Recording;
}

export default function RecordingCard({ recording }: RecordingCardProps) {
  if (!recording.id) {
    return null;
  }

  return (
    <Link to={`/recordings/${recording.id}`} className="block">
      <div className="rounded-2xl shadow-md border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow" style={{ backgroundColor: '#FFFCF5' }}>
        {/* Cover Image */}
        <div className="relative h-48 bg-neutral-100">
          {recording.coverImage ? (
            <img
              src={recording.coverImage}
              alt={recording.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <div className="text-center">
                <img 
                  src={logo} 
                  alt="VietTune Logo" 
                  className="w-24 h-24 mb-2 mx-auto object-contain opacity-40"
                />
                <p className="text-sm">Chưa có ảnh bìa</p>
              </div>
            </div>
          )}

          {/* Play button overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center group"
          >
            <div className="bg-white rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <Play className="h-8 w-8 text-primary-600" />
            </div>
          </div>

        {/* Verification badge */}
        {recording.verificationStatus === "VERIFIED" && (
          <div className="absolute top-2 right-2">
            <Badge variant="success" size="sm">
              Đã xác minh
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-neutral-800 mb-1 line-clamp-1">
          {recording.title}
        </h3>
        {recording.titleVietnamese && (
          <p className="text-sm text-neutral-500 mb-2 line-clamp-1">
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
        <div className="flex items-center justify-between text-xs text-neutral-500">
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
    </Link>
  );
}
