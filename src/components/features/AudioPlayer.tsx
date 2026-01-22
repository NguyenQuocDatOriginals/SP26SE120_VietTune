import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw, Trash2, Users, MapPin, Clock, Repeat, Music } from "lucide-react";
import { isYouTubeUrl, getYouTubeId } from "../../utils/youtube";
import { useAuthStore } from "@/stores/authStore";
import { UserRole } from "@/types";

// Props type for AudioPlayer

import type { Recording } from "@/types";
type Props = {
  src?: string;
  title?: string;
  artist?: string;
  compact?: boolean;
  className?: string;
  recording?: Recording;
  onDelete?: (id: string) => void;
  showContainer?: boolean;
};

// Global active audio element for pausing other players
let activeAudio: HTMLAudioElement | null = null;

export default function AudioPlayer({
  src,
  title,
  artist,
  compact = false,
  className = "",
  recording,
  onDelete,
  showContainer = false
}: Props) {
  // All hooks and variables must be declared before any hook or return
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showYoutubePlayer, setShowYoutubePlayer] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [savedVolume, setSavedVolume] = useState(1); // Store volume before muting
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { user } = useAuthStore();
  const isExpert = String(user?.role) === UserRole.EXPERT;
  const isYoutube = isYouTubeUrl(src);
  const youtubeId = isYoutube ? getYouTubeId(src || "") : null;
  const isVideo = src && typeof src === 'string' && src.startsWith('data:video/');
  const mediaRef = isVideo ? videoRef : audioRef;

  useEffect(() => {
    const media = isVideo ? videoRef.current : audioRef.current;
    if (!media) return;

    const onTime = () => setCurrentTime(media.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onMeta = () => {
      setDuration(isNaN(media.duration) ? 0 : media.duration || 0);
      setIsLoading(false);
    };
    const onVolume = () => {
      const newVol = media.volume;
      setVolume(newVol);
      if (newVol > 0) {
        setSavedVolume(newVol);
      }
    };
    const onEnded = () => setPlaying(false);
    const onCanPlay = () => setIsLoading(false);
    const onWaiting = () => setIsLoading(true);

    media.addEventListener("timeupdate", onTime);
    media.addEventListener("play", onPlay);
    media.addEventListener("pause", onPause);
    media.addEventListener("loadedmetadata", onMeta);
    media.addEventListener("volumechange", onVolume);
    media.addEventListener("ended", onEnded);
    media.addEventListener("canplay", onCanPlay);
    media.addEventListener("waiting", onWaiting);

    setVolume(media.volume);
    setDuration(isNaN(media.duration) ? 0 : media.duration || 0);

    return () => {
      media.removeEventListener("timeupdate", onTime);
      media.removeEventListener("play", onPlay);
      media.removeEventListener("pause", onPause);
      media.removeEventListener("loadedmetadata", onMeta);
      media.removeEventListener("volumechange", onVolume);
      media.removeEventListener("ended", onEnded);
      media.removeEventListener("canplay", onCanPlay);
      media.removeEventListener("waiting", onWaiting);
      if (!isVideo && activeAudio === media) activeAudio = null;
    };
  }, [src, isVideo]);

  // If YouTube, render only the YouTube player (with title/artist if present)
  if (isYoutube && youtubeId) {
    return (
      <div className={className}>
        {(title || artist) && (
          <div className="mb-4">
            {title && <h4 className="text-neutral-800 font-medium truncate">{title}</h4>}
            {artist && <p className="text-neutral-500 text-sm truncate">{artist}</p>}
          </div>
        )}
        <div className="w-full aspect-[16/9] rounded-md overflow-hidden">
          <iframe
            title="YouTube video"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
            frameBorder="0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-md"
          />
        </div>
      </div>
    );
  }

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const play = async () => {
    if (isYoutube) {
      setShowYoutubePlayer(true);
      setPlaying(true);
      setIsLoading(false); // Always ensure spinner is off for YouTube
      return;
    }

    const media = mediaRef.current;
    if (!media) return;
    if (!isVideo && activeAudio && activeAudio !== media) {
      try {
        activeAudio.pause();
      } catch (e) {
        /* ignore */
      }
    }
    try {
      await media.play();
      setPlaying(true);
      if (!isVideo) activeAudio = media as HTMLAudioElement;
    } catch (e) {
      console.warn("Play failed:", e);
    }
  };

  const pause = () => {
    const media = mediaRef.current;
    if (!media) return;
    media.pause();
    setPlaying(false);
    if (!isVideo && activeAudio === media) activeAudio = null;
  };

  const togglePlay = () => (playing ? pause() : play());

  const seekTo = (val: number) => {
    const media = mediaRef.current;
    if (!media) return;
    media.currentTime = Math.max(0, Math.min(val, duration || 0));
    setCurrentTime(media.currentTime);
  };

  const seekBy = (delta: number) => {
    const media = mediaRef.current;
    if (!media) return;
    const next = Math.max(0, Math.min(duration, media.currentTime + delta));
    media.currentTime = next;
    setCurrentTime(next);
  };

  const handleVolume = (v: number) => {
    const media = mediaRef.current;
    if (!media) return;
    const newVolume = Math.max(0, Math.min(1, v));
    media.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0) {
      setSavedVolume(newVolume); // Save non-zero volume
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;
    if (isMuted) {
      // Unmute: restore saved volume
      media.volume = savedVolume > 0 ? savedVolume : 0.5;
      setVolume(media.volume);
      setIsMuted(false);
    } else {
      // Mute: save current volume first
      setSavedVolume(volume);
      media.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleLoop = () => {
    const media = mediaRef.current;
    if (!media) return;
    media.loop = !isLooping;
    setIsLooping(!isLooping);
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  // Container version with delete button and metadata
  if (showContainer && recording) {
    return (
      <div className={className}>
        <div
          className="p-5 rounded-xl border border-neutral-200"
          style={{ backgroundColor: '#FFFCF5' }}
        >
          {/* Audio Player (Full Version) */}
          <div className="w-full">
            {isYoutube ? (
              !showYoutubePlayer ? (
                <div className="relative rounded-md overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
                  {youtubeId ? (
                    <>
                      <img src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} alt="YouTube thumbnail" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setShowYoutubePlayer(true); setPlaying(true); setIsLoading(false); }}
                        className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg"
                        aria-label="Phát video YouTube"
                      >
                        <Play className="w-6 h-6" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full bg-black" />
                  )}
                </div>
              ) : (
                <div className="w-full aspect-[16/9] rounded-md overflow-hidden">
                  <iframe
                    title="YouTube video"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-md"
                  />
                </div>
              )
            ) : isVideo ? (
              <video ref={videoRef} src={src} preload="metadata" className="w-full rounded-md" />
            ) : (
              <audio ref={audioRef} src={src} preload="metadata" />
            )}

            <div className="p-4 border border-neutral-200 rounded-2xl" style={{ backgroundColor: '#FFFCF5' }}>
              {/* Title & Artist */}
              {(title || artist) && (
                <div className="mb-4">
                  {title && (
                    <h4 className="text-neutral-800 font-medium truncate">{title}</h4>
                  )}
                  {artist && (
                    <p className="text-neutral-500 text-sm truncate">{artist}</p>
                  )}
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-4">
                {isYoutube ? (
                  <div className="h-2 bg-neutral-200 rounded-full opacity-50" />
                ) : (
                  <>
                    <div
                      className="relative h-2 bg-neutral-200 rounded-full cursor-pointer group"
                      onMouseDown={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const updateProgress = (clientX: number) => {
                          const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                          seekTo(percent * duration);
                        };
                        updateProgress(e.clientX);

                        const onMouseMove = (moveEvent: MouseEvent) => {
                          updateProgress(moveEvent.clientX);
                        };
                        const onMouseUp = () => {
                          document.removeEventListener('mousemove', onMouseMove);
                          document.removeEventListener('mouseup', onMouseUp);
                        };
                        document.addEventListener('mousemove', onMouseMove);
                        document.addEventListener('mouseup', onMouseUp);
                      }}
                    >
                      <div
                        className="h-full bg-primary-600 rounded-full transition-none"
                        style={{ width: `${progressPercent}%` }}
                      />
                      {/* Thumb */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary-600 rounded-full shadow-md border-2 border-white cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                        style={{ left: `calc(${progressPercent}% - 8px)` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-neutral-500 font-mono">{formatTime(currentTime)}</span>
                      <span className="text-xs text-neutral-500 font-mono">{formatTime(duration)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Controls */}
              <div className="relative flex items-center justify-between">
                {/* Left: Empty space for balance */}
                <div className="flex items-center">
                </div>

                {/* Center: Play Controls: Lùi, Play/Pause, Tiến */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <button
                    onClick={() => !isYoutube && seekBy(-5)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-neutral-700 hover:text-neutral-900 bg-neutral-300 hover:bg-neutral-400 transition-colors relative shadow-sm hover:shadow-md ${isYoutube ? 'opacity-50 pointer-events-none' : ''}`}
                    title="Lùi 5 giây"
                  >
                    <RotateCcw className="w-6 h-6" strokeWidth={2} />
                    <span className="absolute text-[9px] font-bold" style={{ marginTop: '2px' }}>5</span>
                  </button>

                  <button
                    onClick={togglePlay}
                    disabled={isYoutube ? false : isLoading}
                    className="w-14 h-14 rounded-full flex items-center justify-center bg-primary-600 hover:bg-primary-500 transition-all hover:scale-105 disabled:opacity-50 shadow-lg hover:shadow-xl shadow-primary-500/30"
                  >
                    {(isYoutube || showYoutubePlayer)
                      ? (playing ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />)
                      : isLoading
                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : playing
                          ? <Pause className="w-6 h-6 text-white" />
                          : <Play className="w-6 h-6 text-white ml-1" />
                    }
                  </button>

                  <button
                    onClick={() => !isYoutube && seekBy(5)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-neutral-700 hover:text-neutral-900 bg-neutral-300 hover:bg-neutral-400 transition-colors relative shadow-sm hover:shadow-md ${isYoutube ? 'opacity-50 pointer-events-none' : ''}`}
                    title="Tiến 5 giây"
                  >
                    <RotateCw className="w-6 h-6" strokeWidth={2} />
                    <span className="absolute text-[9px] font-bold" style={{ marginTop: '2px' }}>5</span>
                  </button>
                </div>

                {/* Right: Repeat & Volume */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleLoop}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm hover:shadow-md ${isLooping
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-200 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-300'
                      } ${isYoutube ? 'opacity-50 pointer-events-none' : ''}`}
                    title={isLooping ? "Tắt lặp lại" : "Bật lặp lại"}
                    disabled={isYoutube}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleMute}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-800 bg-neutral-200 hover:bg-neutral-300 transition-colors shadow-sm hover:shadow-md ${isYoutube ? 'opacity-50 pointer-events-none' : ''}`}
                    disabled={isYoutube}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <div
                    className={`w-20 hidden sm:block relative ${isYoutube ? 'opacity-50 pointer-events-none' : ''}`}
                    onMouseDown={isYoutube ? undefined : (e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const updateVolume = (clientX: number) => {
                        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                        handleVolume(percent);
                      };
                      updateVolume(e.clientX);

                      const onMouseMove = (moveEvent: MouseEvent) => {
                        updateVolume(moveEvent.clientX);
                      };
                      const onMouseUp = () => {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                      };
                      document.addEventListener('mousemove', onMouseMove);
                      document.addEventListener('mouseup', onMouseUp);
                    }}
                  >
                    <div className="relative h-1.5 bg-neutral-200 rounded-full cursor-pointer">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-none"
                        style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                      />
                      {/* Thumb */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-600 rounded-full shadow-sm border-2 border-white cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                        style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-neutral-200">
            {recording?.ethnicity &&
              typeof recording.ethnicity === "object" &&
              recording.ethnicity.name &&
              recording.ethnicity.name !== "Không xác định" &&
              recording.ethnicity.name.toLowerCase() !== "unknown" &&
              recording.ethnicity.name.trim() !== "" && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-secondary-100 text-secondary-700 rounded-full">
                  <Users className="h-3 w-3" />
                  {recording.ethnicity.nameVietnamese || recording.ethnicity.name}
                </span>
              )}
            {recording?.region && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                <MapPin className="h-3 w-3" />
                {recording.region}
              </span>
            )}
            {recording?.recordingType && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full">
                <Music className="h-3 w-3" />
                {recording.recordingType}
              </span>
            )}
            {recording?.tags && recording.tags.length > 0 && recording.tags.map((tag, idx) => (
              tag && tag.trim() !== "" && (
                <span key={idx} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                  {tag}
                </span>
              )
            ))}
            {recording?.instruments && recording.instruments.length > 0 && recording.instruments.map((instrument) => (
              <span key={instrument.id} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                {instrument.nameVietnamese || instrument.name}
              </span>
            ))}
            {recording?.uploadedDate && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-neutral-100 text-neutral-500 rounded-full ml-auto">
                <Clock className="h-3 w-3" />
                {new Date(recording.uploadedDate).toLocaleDateString("vi-VN")}
              </span>
            )}
          </div>
        </div>
      </div >
    );
  }

  // Compact version for cards
  if (compact) {
    return (
      <div className={`${className} w-full`}>
        {isYoutube ? (
          !showYoutubePlayer ? (
            <div className="relative rounded-md overflow-hidden bg-black h-20">
              {youtubeId ? (
                <>
                  <img src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} alt="YouTube thumbnail" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setShowYoutubePlayer(true); setPlaying(true); setIsLoading(false); }}
                    className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg"
                    aria-label="Phát video YouTube"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full bg-black" />
              )}
            </div>
          ) : (
            <iframe
              title="YouTube video"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="w-full h-20 rounded-md"
            />
          )
        ) : isVideo ? (
          <video ref={videoRef} src={src} preload="metadata" className="w-full rounded-md" />
        ) : (
          <audio ref={audioRef} src={src} preload="metadata" />
        )}

        <div className="flex items-center gap-3">
          {/* Play Button */}
          <button
            onClick={togglePlay}
            disabled={isYoutube ? false : isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-600 hover:bg-primary-500 transition-colors disabled:opacity-50 flex-shrink-0 shadow-md hover:shadow-lg"
          >
            {(isYoutube || showYoutubePlayer)
              ? (playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />)
              : isLoading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : playing
                  ? <Pause className="w-4 h-4 text-white" />
                  : <Play className="w-4 h-4 text-white ml-0.5" />
            }
          </button>

          {/* Progress */}
          <div className="flex-1 min-w-0">
            {isYoutube ? (
              <div className="h-1.5 bg-neutral-200 rounded-full opacity-50" />
            ) : (
              <>
                <div
                  className="relative h-1.5 bg-neutral-200 rounded-full cursor-pointer"
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const updateProgress = (clientX: number) => {
                      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                      seekTo(percent * duration);
                    };
                    updateProgress(e.clientX);

                    const onMouseMove = (moveEvent: MouseEvent) => {
                      updateProgress(moveEvent.clientX);
                    };
                    const onMouseUp = () => {
                      document.removeEventListener('mousemove', onMouseMove);
                      document.removeEventListener('mouseup', onMouseUp);
                    };
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                  }}
                >
                  <div
                    className="h-full bg-primary-600 rounded-full transition-none"
                    style={{ width: `${progressPercent}%` }}
                  />
                  {/* Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-600 rounded-full shadow-sm border-2 border-white cursor-grab active:cursor-grabbing"
                    style={{ left: `calc(${progressPercent}% - 6px)` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-neutral-500">{formatTime(currentTime)}</span>
                  <span className="text-xs text-neutral-500">{formatTime(duration)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className={`${className} w-full`}>
      {isYoutube ? (
        !showYoutubePlayer ? (
          <div className="relative rounded-md overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
            {youtubeId ? (
              <>
                <img src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} alt="YouTube thumbnail" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setShowYoutubePlayer(true); setPlaying(true); setIsLoading(false); }}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg"
                  aria-label="Phát video YouTube"
                >
                  <Play className="w-6 h-6" />
                </button>
              </>
            ) : (
              <div className="w-full h-full bg-black" />
            )}
          </div>
        ) : (
          <div className="w-full aspect-[16/9] rounded-md overflow-hidden">
            <iframe
              title="YouTube video"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-md"
            />
          </div>
        )
      ) : isVideo ? (
        <video ref={videoRef} src={src} preload="metadata" className="w-full rounded-md" />
      ) : (
        <audio ref={audioRef} src={src} preload="metadata" />
      )}
      <div className="p-4 border border-neutral-200 rounded-2xl" style={{ backgroundColor: '#FFFCF5' }}>
        {/* Title & Artist */}
        {(title || artist) && (
          <div className="mb-4">
            {title && (
              <h4 className="text-neutral-800 font-medium truncate">{title}</h4>
            )}
            {artist && (
              <p className="text-neutral-500 text-sm truncate">{artist}</p>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          {isYoutube ? (
            <div className="h-2 bg-neutral-200 rounded-full opacity-50" />
          ) : (
            <>
              <div
                className="relative h-2 bg-neutral-200 rounded-full cursor-pointer group"
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const updateProgress = (clientX: number) => {
                    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                    seekTo(percent * duration);
                  };
                  updateProgress(e.clientX);

                  const onMouseMove = (moveEvent: MouseEvent) => {
                    updateProgress(moveEvent.clientX);
                  };
                  const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };
                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}
              >
                <div
                  className="h-full bg-primary-600 rounded-full transition-none"
                  style={{ width: `${progressPercent}%` }}
                />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary-600 rounded-full shadow-md border-2 border-white cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                  style={{ left: `calc(${progressPercent}% - 8px)` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-neutral-500 font-mono">{formatTime(currentTime)}</span>
                <span className="text-xs text-neutral-500 font-mono">{formatTime(duration)}</span>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="relative flex items-center justify-center">
          {/* Center: Play/Pause */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => !isYoutube && seekBy(-5)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-neutral-700 hover:text-neutral-900 bg-neutral-300 hover:bg-neutral-400 transition-colors relative shadow-sm hover:shadow-md ${isYoutube ? 'opacity-50 pointer-events-none' : ''}`}
              title="Lùi 5 giây"
            >
              <RotateCcw className="w-6 h-6" strokeWidth={2} />
              <span className="absolute text-[9px] font-bold" style={{ marginTop: '2px' }}>5</span>
            </button>

            <button
              onClick={togglePlay}
              disabled={isYoutube ? false : isLoading}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-primary-600 hover:bg-primary-500 transition-all hover:scale-105 disabled:opacity-50 shadow-lg hover:shadow-xl shadow-primary-500/30"
            >
              {isYoutube
                ? (playing ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />)
                : isLoading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : playing
                    ? <Pause className="w-6 h-6 text-white" />
                    : <Play className="w-6 h-6 text-white ml-1" />
              }
            </button>

            <button
              onClick={() => !isYoutube && seekBy(5)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-neutral-700 hover:text-neutral-900 bg-neutral-300 hover:bg-neutral-400 transition-colors relative shadow-sm hover:shadow-md ${isYoutube ? 'opacity-50 pointer-events-none' : ''}`}
              title="Tiến 5 giây"
            >
              <RotateCw className="w-6 h-6" strokeWidth={2} />
              <span className="absolute text-[9px] font-bold" style={{ marginTop: '2px' }}>5</span>
            </button>
          </div>

          {/* Left: Delete Button (Expert only) - Positioned absolutely */}
          {isExpert && onDelete && recording && (
            <div className="absolute left-0">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5">
                  <span className="text-xs text-red-700 font-medium">Xác nhận?</span>
                  <button
                    onClick={() => {
                      const idToDelete = recording?.id ?? "";
                      if (idToDelete !== "" && idToDelete !== undefined) {
                        onDelete(String(idToDelete));
                      }
                      setShowDeleteConfirm(false);
                    }}
                    className="text-xs text-red-700 hover:text-red-900 font-semibold"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-xs text-neutral-600 hover:text-neutral-800"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 transition-colors shadow-sm hover:shadow-md"
                  title="Xóa bản thu (Chuyên gia)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Right: Repeat & Volume - Positioned absolutely */}
          <div className="absolute right-0 flex items-center gap-2">
            <button
              onClick={toggleLoop}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm hover:shadow-md ${isLooping
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-200 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-300'
                } ${isYoutube ? 'opacity-50 pointer-events-none' : ''}`}
              title={isLooping ? "Tắt lặp lại" : "Bật lặp lại"}
              disabled={isYoutube}
            >
              <Repeat className="w-4 h-4" />
            </button>
            <button
              onClick={toggleMute}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-800 bg-neutral-200 hover:bg-neutral-300 transition-colors shadow-sm hover:shadow-md ${isYoutube ? 'opacity-50 pointer-events-none' : ''}`}
              disabled={isYoutube}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <div
              className={`w-20 hidden sm:block relative ${isYoutube ? 'opacity-50 pointer-events-none' : ''}`}
              onMouseDown={isYoutube ? undefined : (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const updateVolume = (clientX: number) => {
                  const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                  handleVolume(percent);
                };
                updateVolume(e.clientX);

                const onMouseMove = (moveEvent: MouseEvent) => {
                  updateVolume(moveEvent.clientX);
                };
                const onMouseUp = () => {
                  document.removeEventListener('mousemove', onMouseMove);
                  document.removeEventListener('mouseup', onMouseUp);
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
              }}
            >
              <div className="relative h-1.5 bg-neutral-200 rounded-full cursor-pointer">
                <div
                  className="h-full bg-primary-600 rounded-full transition-none"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-600 rounded-full shadow-sm border-2 border-white cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                  style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}