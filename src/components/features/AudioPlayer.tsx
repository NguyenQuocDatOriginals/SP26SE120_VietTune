import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const {
    currentRecording,
    isPlaying,
    volume,
    currentTime,
    duration,
    setIsPlaying,
    setVolume,
    setCurrentTime,
    setDuration,
    playNext,
    playPrevious,
  } = usePlayerStore();

  useEffect(() => {
    setShowPlayer(!!currentRecording);
  }, [currentRecording]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!showPlayer || !currentRecording) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 shadow-lg z-50">
      <audio
        ref={audioRef}
        src={currentRecording.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
      />

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-4">
          {/* Recording Info */}
          <div className="flex items-center space-x-3 flex-shrink-0 w-64">
            {currentRecording.coverImage && (
              <img
                src={currentRecording.coverImage}
                alt={currentRecording.title}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 truncate">
                {currentRecording.title}
              </p>
              <p className="text-xs text-secondary-500 truncate">
                {currentRecording.ethnicity.name}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-4">
              <button
                onClick={playPrevious}
                className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center space-x-2">
              <span className="text-xs text-secondary-500 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-secondary-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-secondary-500 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Close */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <button onClick={() => setVolume(volume === 0 ? 0.7 : 0)}>
                {volume === 0 ? (
                  <VolumeX className="h-5 w-5 text-secondary-600" />
                ) : (
                  <Volume2 className="h-5 w-5 text-secondary-600" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-secondary-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => setShowPlayer(false)}
              className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
