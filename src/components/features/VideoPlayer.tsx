import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Users,
  MapPin,
  Music,
  Repeat,
  Maximize,
  Minimize,
} from "lucide-react";
import type { Recording } from "@/types";
import { Region } from "@/types";
import { REGION_NAMES, RECORDING_TYPE_NAMES } from "@/config/constants";
import type { LocalRecording } from "@/pages/ApprovedRecordingsPage";

/** Throttle interval for time updates (ms) - reduces re-renders during playback */
const TIME_UPDATE_THROTTLE_MS = 200;

// Extended Recording type that may include original local data
type RecordingWithLocalData = Recording & {
  _originalLocalData?: LocalRecording & {
    culturalContext?: {
      region?: string;
    };
  };
};

// Props type for VideoPlayer
type Props = {
  src?: string;
  title?: string;
  artist?: string;
  compact?: boolean;
  className?: string;
  recording?: Recording;
  showContainer?: boolean;
};

export default function VideoPlayer({
  src,
  title,
  artist,
  compact = false,
  className = "",
  recording,
  showContainer = false
}: Props) {
  // All hooks and variables must be declared before any return
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRootRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimeoutRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [savedVolume, setSavedVolume] = useState(1); // Store volume before muting
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [dragVolume, setDragVolume] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const animationFrameRef = useRef<number | null>(null);
  const volumeAnimationFrameRef = useRef<number | null>(null);
  const lastTimeUpdateRef = useRef<number>(0);
  const latestTimeRef = useRef<number>(0);
  const blobUrlRef = useRef<string | null>(null);
  const [resolvedVideoSrc, setResolvedVideoSrc] = useState<string | undefined>(undefined);

  const navigate = useNavigate();
  // Check if src is a video data URL or video file
  const isVideo = src && typeof src === 'string' && (src.startsWith('data:video/') || src.match(/\.(mp4|mov|avi|webm|mkv|mpeg|mpg|wmv|3gp|flv)$/i));

  // Resolve data:video/ URLs to Blob URL for smoother playback (offloads decoding from main thread)
  useEffect(() => {
    if (!src || typeof src !== "string" || !src.startsWith("data:video/")) {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setResolvedVideoSrc(undefined);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(src);
        if (cancelled || !res.ok) return;
        const blob = await res.blob();
        if (cancelled) return;
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        if (!cancelled) setResolvedVideoSrc(url);
      } catch {
        if (!cancelled) setResolvedVideoSrc(src);
      }
    })();
    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setResolvedVideoSrc(undefined);
    };
  }, [src]);

  // Use blob URL when ready for data:video/ to avoid main-thread decode; otherwise use src
  const isDataVideo = Boolean(src && typeof src === "string" && src.startsWith("data:video/"));
  const effectiveVideoSrc = isDataVideo ? resolvedVideoSrc : (isVideo ? src : undefined);
  const videoSrcReady = isVideo && (isDataVideo ? resolvedVideoSrc != null : true);

  // Handle click to navigate to detail page (excluding buttons and progress bar)
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isButton = target.closest('button') !== null;
    const isProgressBar = target.closest('.progress-bar-container') !== null;
    const isVolumeControl = target.closest('.volume-control-container') !== null;
    if (!isButton && !isProgressBar && !isVolumeControl && recording?.id) {
      navigate(`/recordings/${recording.id}`);
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const clearHideControlsTimer = () => {
    if (hideControlsTimeoutRef.current !== null) {
      window.clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
  };

  const showControlsTemporarily = () => {
    if (!isFullscreen) return;
    setControlsVisible(true);
    clearHideControlsTimer();
    hideControlsTimeoutRef.current = window.setTimeout(() => {
      setControlsVisible(false);
      hideControlsTimeoutRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    // Track fullscreen changes (incl. vendor-prefixed variants)
    const onFsChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
        msFullscreenElement?: Element | null;
      };
      const fsEl =
        document.fullscreenElement ??
        doc.webkitFullscreenElement ??
        doc.msFullscreenElement ??
        null;
      setIsFullscreen(fsEl === playerRootRef.current);
    };

    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange as EventListener);
    document.addEventListener("MSFullscreenChange", onFsChange as EventListener);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange as EventListener);
      document.removeEventListener("MSFullscreenChange", onFsChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isFullscreen) {
      setControlsVisible(true);
      clearHideControlsTimer();
      return;
    }
    showControlsTemporarily();
    return () => clearHideControlsTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

  useEffect(() => {
    const media = videoRef.current;
    if (!media) return;

    // Throttled time update to avoid 60fps re-renders (reduces lag during playback)
    const updateTime = () => {
      if (!isDragging && media) {
        const now = Date.now();
        latestTimeRef.current = media.currentTime;
        if (now - lastTimeUpdateRef.current >= TIME_UPDATE_THROTTLE_MS) {
          setCurrentTime(latestTimeRef.current);
          lastTimeUpdateRef.current = now;
        }
      }
      if (!isDragging) {
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    const onTime = () => {
      if (!isDragging) {
        if (animationFrameRef.current === null) {
          animationFrameRef.current = requestAnimationFrame(updateTime);
        }
      }
    };
    const onPlay = () => {
      lastTimeUpdateRef.current = Date.now();
      setPlaying(true);
    };
    const onPause = () => {
      if (media) setCurrentTime(media.currentTime);
      setPlaying(false);
    };
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

    // Start animation frame loop
    if (!isDragging) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      media.removeEventListener("timeupdate", onTime);
      media.removeEventListener("play", onPlay);
      media.removeEventListener("pause", onPause);
      media.removeEventListener("loadedmetadata", onMeta);
      media.removeEventListener("volumechange", onVolume);
      media.removeEventListener("ended", onEnded);
      media.removeEventListener("canplay", onCanPlay);
      media.removeEventListener("waiting", onWaiting);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (volumeAnimationFrameRef.current !== null) {
        cancelAnimationFrame(volumeAnimationFrameRef.current);
        volumeAnimationFrameRef.current = null;
      }
    };
  }, [src, isDragging, videoSrcReady]);


  const play = async () => {
    const media = videoRef.current;
    if (!media) return;
    try {
      await media.play();
      setPlaying(true);
    } catch (e) {
      console.warn("Play failed:", e);
    }
  };

  const pause = () => {
    const media = videoRef.current;
    if (!media) return;
    media.pause();
    setPlaying(false);
  };

  const togglePlay = () => (playing ? pause() : play());

  const seekTo = (val: number) => {
    const media = videoRef.current;
    if (!media) return;
    media.currentTime = Math.max(0, Math.min(val, duration || 0));
    setCurrentTime(media.currentTime);
  };

  const seekBy = (delta: number) => {
    const media = videoRef.current;
    if (!media) return;
    const next = Math.max(0, Math.min(duration, media.currentTime + delta));
    media.currentTime = next;
    setCurrentTime(next);
  };

  const handleVolume = (v: number) => {
    const media = videoRef.current;
    if (!media) return;
    const newVolume = Math.max(0, Math.min(1, v));
    media.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0) {
      setSavedVolume(newVolume);
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return "00:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Use dragTime when dragging, otherwise use currentTime for smooth updates
  const displayTime = isDragging && dragTime !== null ? dragTime : currentTime;
  // Use dragVolume when dragging, otherwise use volume for smooth updates
  const displayVolume = isDraggingVolume && dragVolume !== null ? dragVolume : volume;
  const progressPercent = duration ? (displayTime / duration) * 100 : 0;

  const toggleMute = () => {
    const media = videoRef.current;
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
    const media = videoRef.current;
    if (!media) return;
    media.loop = !isLooping;
    setIsLooping(!isLooping);
  };

  const toggleFullscreen = async () => {
    const root = playerRootRef.current;
    if (!root) return;

    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void> | void;
      msExitFullscreen?: () => Promise<void> | void;
    };

    if (isFullscreen) {
      const exit = document.exitFullscreen ?? doc.webkitExitFullscreen ?? doc.msExitFullscreen;
      if (exit) {
        try {
          await exit.call(document);
        } catch {
          // ignore
        }
      }
      return;
    }

    const el = root as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
      msRequestFullscreen?: () => Promise<void> | void;
    };
    const request = el.requestFullscreen ?? el.webkitRequestFullscreen ?? el.msRequestFullscreen;
    if (request) {
      try {
        await request.call(el);
      } catch {
        // ignore
      }
    } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
      // iOS Safari fallback for <video>
      try {
        (videoRef.current as any).webkitEnterFullscreen();
      } catch {
        // ignore
      }
    }
  };


  // Container version with metadata
  if (showContainer && recording) {
    // Nếu không phải YouTube, hiển thị đầy đủ controls như cũ
    return (
      <div className={className}>
        <div
          className="p-5 rounded-xl border border-neutral-200 cursor-pointer"
          style={{ backgroundColor: '#FFFCF5' }}
          onClick={handleContainerClick}
        >
          <div
            ref={playerRootRef}
            className="relative"
            onMouseMove={isFullscreen ? showControlsTemporarily : undefined}
          >
            {/* Video Player (Full Version) - wrapper với overflow-hidden để góc bo tròn không bị nhô vuông */}
            <div className="w-full rounded-md overflow-hidden" style={{ contain: "layout paint" }}>
              {isVideo ? (
                videoSrcReady ? (
                  <video ref={videoRef} src={effectiveVideoSrc ?? undefined} preload="auto" playsInline className="w-full block" controls={false} />
                ) : (
                  <div className="w-full aspect-video bg-neutral-200 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
                  </div>
                )
              ) : (
                <div className="w-full aspect-[16/9] bg-neutral-200 flex items-center justify-center">
                  <p className="text-neutral-500">Không có video để phát</p>
                </div>
              )}
            </div>

            <div
              className={`${isFullscreen ? "absolute left-4 right-4 bottom-4 z-20 bg-white/80" : "mt-5"} pt-7 px-7 pb-10 border border-neutral-200/80 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${isFullscreen ? (controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none") : ""}`}
              style={{ backgroundColor: '#FFFCF5' }}
            >
              {/* Title & Artist */}
              {(title || artist) && (
                <div className="mb-5">
                  {title && (
                    <h4 className="text-neutral-900 font-semibold text-lg mb-1 truncate leading-tight">{title}</h4>
                  )}
                  {artist && (
                    <p className="text-neutral-600 text-sm font-medium truncate">{artist}</p>
                  )}
                </div>
              )}

              {/* Progress Bar — same UI/UX as volume bar */}
              <div className="mb-8 w-full" onClick={stopPropagation}>
                <div
                  className="progress-bar-container w-full"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsDragging(true);
                    const rect = e.currentTarget.getBoundingClientRect();

                    const updateProgress = (clientX: number) => {
                      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                      const newTime = percent * duration;
                      setDragTime(newTime);

                      if (animationFrameRef.current === null) {
                        animationFrameRef.current = requestAnimationFrame(() => {
                          animationFrameRef.current = null;
                        });
                      }
                    };

                    updateProgress(e.clientX);

                    const onMouseMove = (moveEvent: MouseEvent) => {
                      moveEvent.preventDefault();
                      updateProgress(moveEvent.clientX);
                    };

                    const onMouseUp = () => {
                      if (dragTime !== null) {
                        seekTo(dragTime);
                      }
                      setIsDragging(false);
                      setDragTime(null);
                      document.removeEventListener('mousemove', onMouseMove);
                      document.removeEventListener('mouseup', onMouseUp);
                      document.removeEventListener('mouseleave', onMouseUp);
                    };

                    document.addEventListener('mousemove', onMouseMove, { passive: false });
                    document.addEventListener('mouseup', onMouseUp);
                    document.addEventListener('mouseleave', onMouseUp);
                  }}
                >
                  <div className="relative h-2 bg-neutral-200/80 rounded-full cursor-pointer group/progress transition-all duration-200 hover:h-2.5 will-change-[height]">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full shadow-sm will-change-[width]"
                      style={{
                        width: `${progressPercent}%`,
                        transition: isDragging ? 'none' : 'width 0.1s linear'
                      }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary-600 rounded-full shadow-md border-2 border-white cursor-grab active:cursor-grabbing hover:scale-125 hover:shadow-lg transition-transform duration-200 will-change-transform pointer-events-none"
                      style={{
                        left: `calc(${progressPercent}% - 7px)`,
                        opacity: isDragging ? 1 : 0,
                        transition: isDragging ? 'opacity 0s, transform 0.2s' : 'opacity 0.2s, transform 0.2s'
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-2.5">
                  <span className="text-xs text-neutral-600 font-medium tabular-nums">
                    {formatTime(displayTime)}
                  </span>
                  <span className="text-xs text-neutral-600 font-medium tabular-nums">
                    -{formatTime(Math.max(0, duration - displayTime))}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="relative flex items-center justify-center">
                {/* Left: Repeat & Volume */}
                <div className="absolute left-0 flex items-center gap-2">
                  <button
                    onClick={toggleLoop}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 cursor-pointer ${isLooping
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/40'
                      : 'bg-neutral-200/80 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-300'
                      }`}
                    title={isLooping ? "Tắt lặp lại" : "Bật lặp lại"}
                  >
                    <Repeat className="w-4.5 h-4.5" strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-800 bg-neutral-200/80 hover:bg-neutral-300 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4.5 h-4.5" strokeWidth={2.5} />
                    ) : (
                      <Volume2 className="w-4.5 h-4.5" strokeWidth={2.5} />
                    )}
                  </button>
                  <div
                    className="w-20 hidden sm:block relative volume-control-container"
                    onClick={stopPropagation}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsDraggingVolume(true);
                      const rect = e.currentTarget.getBoundingClientRect();

                      const updateVolume = (clientX: number) => {
                        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                        const newVolume = percent;
                        setDragVolume(newVolume);

                        // Use requestAnimationFrame for smooth visual updates
                        if (volumeAnimationFrameRef.current === null) {
                          volumeAnimationFrameRef.current = requestAnimationFrame(() => {
                            volumeAnimationFrameRef.current = null;
                          });
                        }
                      };

                      updateVolume(e.clientX);

                      const onMouseMove = (moveEvent: MouseEvent) => {
                        moveEvent.preventDefault();
                        updateVolume(moveEvent.clientX);
                      };

                      const onMouseUp = () => {
                        if (dragVolume !== null) {
                          handleVolume(dragVolume);
                        }
                        setIsDraggingVolume(false);
                        setDragVolume(null);
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                        document.removeEventListener('mouseleave', onMouseUp);
                      };

                      document.addEventListener('mousemove', onMouseMove, { passive: false });
                      document.addEventListener('mouseup', onMouseUp);
                      document.addEventListener('mouseleave', onMouseUp);
                    }}
                  >
                    <div className="relative h-2 bg-neutral-200/80 rounded-full cursor-pointer group/volume transition-all duration-200 hover:h-2.5 will-change-[height]">
                      <div
                        className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full shadow-sm will-change-[width]"
                        style={{
                          width: `${(isMuted ? 0 : displayVolume) * 100}%`,
                          transition: isDraggingVolume ? 'none' : 'width 0.1s linear'
                        }}
                      />
                      {/* Thumb */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary-600 rounded-full shadow-md border-2 border-white cursor-grab active:cursor-grabbing hover:scale-125 hover:shadow-lg transition-transform duration-200 will-change-transform"
                        style={{
                          left: `calc(${(isMuted ? 0 : displayVolume) * 100}% - 7px)`,
                          opacity: isDraggingVolume ? 1 : 0,
                          transition: isDraggingVolume ? 'opacity 0s, transform 0.2s' : 'opacity 0.2s, transform 0.2s'
                        }}
                      />
                    </div>
                  </div>

                </div>

                {/* Center: Play Controls: Lùi, Play/Pause, Tiến */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <button
                    onClick={() => seekBy(-5)}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-neutral-700 hover:text-neutral-900 bg-neutral-200/80 hover:bg-neutral-300 transition-all duration-200 relative shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                    title="Lùi 5 giây"
                  >
                    <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
                    <span className="absolute text-[10px] font-bold text-neutral-800" style={{ marginTop: '1px' }}>5</span>
                  </button>

                  <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 shadow-xl hover:shadow-2xl shadow-primary-600/40 cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary-500/50"
                  >
                    {isLoading
                      ? <div className="w-6 h-6 border-3 border-white/40 border-t-white rounded-full animate-spin" />
                      : playing
                        ? <Pause className="w-7 h-7 text-white" strokeWidth={2.5} />
                        : <Play className="w-7 h-7 text-white ml-0.5" strokeWidth={2.5} />
                    }
                  </button>

                  <button
                    onClick={() => seekBy(5)}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-neutral-700 hover:text-neutral-900 bg-neutral-200/80 hover:bg-neutral-300 transition-all duration-200 relative shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                    title="Tiến 5 giây"
                  >
                    <RotateCw className="w-5 h-5" strokeWidth={2.5} />
                    <span className="absolute text-[10px] font-bold text-neutral-800" style={{ marginTop: '1px' }}>5</span>
                  </button>
                </div>

                {/* Right: Fullscreen */}
                <div className="absolute right-0 flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void toggleFullscreen();
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-800 bg-neutral-200/80 hover:bg-neutral-300 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 cursor-pointer ${!isVideo ? "opacity-50 pointer-events-none" : ""}`}
                    title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                    disabled={!isVideo}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-4.5 h-4.5" strokeWidth={2.5} />
                    ) : (
                      <Maximize className="w-4.5 h-4.5" strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Tags */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-5 border-t border-neutral-200/60">
            {recording?.ethnicity &&
              typeof recording.ethnicity === "object" &&
              recording.ethnicity.name &&
              recording.ethnicity.name !== "Không xác định" &&
              recording.ethnicity.name.toLowerCase() !== "unknown" &&
              recording.ethnicity.name.trim() !== "" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-secondary-100/90 text-secondary-800 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">
                  <Users className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {recording.ethnicity.nameVietnamese || recording.ethnicity.name}
                </span>
              )}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-neutral-100/90 text-neutral-700 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2.5} />
              {(() => {
                if (!recording?.region || !REGION_NAMES[recording.region]) return "Không xác định";
                const originalData = (recording as RecordingWithLocalData)._originalLocalData;
                if (originalData) {
                  const hasRealRegion = originalData.region || originalData.culturalContext?.region;
                  if (!hasRealRegion) return "Không xác định";
                }
                if (recording.region === Region.RED_RIVER_DELTA && !originalData) return "Không xác định";
                return REGION_NAMES[recording.region];
              })()}
            </span>
            {recording?.recordingType && RECORDING_TYPE_NAMES[recording.recordingType] && RECORDING_TYPE_NAMES[recording.recordingType] !== "Khác" && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-primary-100/90 text-primary-800 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">
                <Music className="h-3.5 w-3.5" strokeWidth={2.5} />
                {RECORDING_TYPE_NAMES[recording.recordingType]}
              </span>
            )}
            {recording?.tags?.map((tag, idx) =>
              tag && tag.trim() !== "" ? (
                <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-neutral-100/90 text-neutral-700 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">
                  {tag.toLowerCase().includes("dân ca") && <Music className="h-3.5 w-3.5" strokeWidth={2.5} />}
                  {tag}
                </span>
              ) : null
            )}
            {recording?.instruments?.map((instrument) => (
              <span key={instrument.id} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-neutral-100/90 text-neutral-700 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200">
                {instrument.nameVietnamese || instrument.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Compact version for cards
  if (compact) {
    return (
      <div className={`${className} w-full cursor-pointer`} onClick={handleContainerClick}>
        {isVideo ? (
          <div className="w-full h-20 rounded-md overflow-hidden">
            {videoSrcReady ? (
              <video
                ref={videoRef}
                src={effectiveVideoSrc ?? undefined}
                preload="auto"
                playsInline
                className="w-full block"
                controls={false}
              />
            ) : (
              <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-20 rounded-md overflow-hidden bg-neutral-200 flex items-center justify-center">
            <p className="text-neutral-500 text-sm">Không có video</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Play Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            disabled={!isVideo || isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-600 hover:bg-primary-500 transition-colors disabled:opacity-50 flex-shrink-0 shadow-md hover:shadow-lg"
            aria-label={playing ? "Tạm dừng" : "Phát"}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : playing ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </button>

          {/* Progress — same interaction areas as AudioPlayer (no waveform) */}
          <div className="flex-1 min-w-0 progress-bar-container" onClick={stopPropagation}>
            {isVideo ? (
              <div
                className="h-12 flex items-center"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsDragging(true);
                  const rect = e.currentTarget.getBoundingClientRect();

                  const updateProgress = (clientX: number) => {
                    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                    const newTime = percent * duration;
                    setDragTime(newTime);
                    if (animationFrameRef.current === null) {
                      animationFrameRef.current = requestAnimationFrame(() => {
                        animationFrameRef.current = null;
                      });
                    }
                  };

                  updateProgress(e.clientX);

                  const onMouseMove = (moveEvent: MouseEvent) => {
                    moveEvent.preventDefault();
                    updateProgress(moveEvent.clientX);
                  };

                  const onMouseUp = () => {
                    if (dragTime !== null) seekTo(dragTime);
                    setIsDragging(false);
                    setDragTime(null);
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                    document.removeEventListener("mouseleave", onMouseUp);
                  };

                  document.addEventListener("mousemove", onMouseMove, { passive: false });
                  document.addEventListener("mouseup", onMouseUp);
                  document.addEventListener("mouseleave", onMouseUp);
                }}
              >
                <div className="relative w-full h-2 bg-neutral-200/80 rounded-full cursor-pointer transition-all duration-200 hover:h-2.5">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full shadow-sm"
                    style={{
                      width: `${progressPercent}%`,
                      transition: isDragging ? "none" : "width 0.1s linear",
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary-600 rounded-full shadow-md border-2 border-white pointer-events-none"
                    style={{
                      left: `calc(${progressPercent}% - 7px)`,
                      opacity: isDragging ? 1 : 0,
                      transition: isDragging ? "opacity 0s" : "opacity 0.2s",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="h-1.5 bg-neutral-200 rounded-full opacity-50 w-full" />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div
      ref={playerRootRef}
      className={`${className} w-full relative cursor-pointer`}
      onMouseMove={isFullscreen ? showControlsTemporarily : undefined}
      onClick={handleContainerClick}
    >
      {isVideo ? (
        <div className="w-full rounded-md overflow-hidden" style={{ contain: "layout paint" }}>
          {videoSrcReady ? (
            <video
              ref={videoRef}
              src={effectiveVideoSrc ?? undefined}
              preload="auto"
              playsInline
              className="w-full block"
              controls={false}
            />
          ) : (
            <div className="w-full aspect-[16/9] bg-neutral-200 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="w-full aspect-[16/9] rounded-md overflow-hidden bg-neutral-200 flex items-center justify-center">
          <p className="text-neutral-500">Không có video để phát</p>
        </div>
      )}

      <div
        className={`${isFullscreen ? "absolute left-4 right-4 bottom-4 z-20 bg-white/80" : "mt-5"} p-6 border border-neutral-200/80 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${isFullscreen ? (controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none") : ""}`}
        style={{ backgroundColor: "#FFFCF5" }}
      >
        {/* Title & Artist */}
        {(title || artist) && (
          <div className="mb-5">
            {title && <h4 className="text-neutral-900 font-semibold text-lg mb-1 truncate leading-tight">{title}</h4>}
            {artist && <p className="text-neutral-600 text-sm font-medium truncate">{artist}</p>}
          </div>
        )}

        {/* Progress Bar — same UI/UX as volume bar */}
        <div className="mb-5 w-full" onClick={stopPropagation}>
          {isVideo ? (
            <div
              className="progress-bar-container w-full"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsDragging(true);
                const rect = e.currentTarget.getBoundingClientRect();

                const updateProgress = (clientX: number) => {
                  const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                  const newTime = percent * duration;
                  setDragTime(newTime);

                  if (animationFrameRef.current === null) {
                    animationFrameRef.current = requestAnimationFrame(() => {
                      animationFrameRef.current = null;
                    });
                  }
                };

                updateProgress(e.clientX);

                const onMouseMove = (moveEvent: MouseEvent) => {
                  moveEvent.preventDefault();
                  updateProgress(moveEvent.clientX);
                };

                const onMouseUp = () => {
                  if (dragTime !== null) {
                    seekTo(dragTime);
                  }
                  setIsDragging(false);
                  setDragTime(null);
                  document.removeEventListener("mousemove", onMouseMove);
                  document.removeEventListener("mouseup", onMouseUp);
                  document.removeEventListener("mouseleave", onMouseUp);
                };

                document.addEventListener("mousemove", onMouseMove, { passive: false });
                document.addEventListener("mouseup", onMouseUp);
                document.addEventListener("mouseleave", onMouseUp);
              }}
            >
              <div className="relative h-2 bg-neutral-200/80 rounded-full cursor-pointer group/progress transition-all duration-200 hover:h-2.5 will-change-[height]">
                <div
                  className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full shadow-sm will-change-[width]"
                  style={{
                    width: `${progressPercent}%`,
                    transition: isDragging ? "none" : "width 0.1s linear",
                  }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary-600 rounded-full shadow-md border-2 border-white cursor-grab active:cursor-grabbing hover:scale-125 hover:shadow-lg transition-transform duration-200 will-change-transform pointer-events-none"
                  style={{
                    left: `calc(${progressPercent}% - 7px)`,
                    opacity: isDragging ? 1 : 0,
                    transition: isDragging ? "opacity 0s, transform 0.2s" : "opacity 0.2s, transform 0.2s",
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="h-2.5 bg-neutral-200/60 rounded-full opacity-50" />
          )}

          {isVideo && (
            <div className="flex justify-between mt-2.5">
              <span className="text-xs text-neutral-600 font-medium tabular-nums">{formatTime(displayTime)}</span>
              <span className="text-xs text-neutral-600 font-medium tabular-nums">
                -{formatTime(Math.max(0, duration - displayTime))}
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="relative flex items-center justify-center">
          {/* Left: Repeat & Volume */}
          <div className="absolute left-0 flex items-center gap-2">
            <button
              onClick={toggleLoop}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 cursor-pointer ${isLooping
                ? "bg-primary-600 text-white shadow-lg shadow-primary-600/40"
                : "bg-neutral-200/80 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-300"} ${!isVideo ? "opacity-50 pointer-events-none" : ""}`}
              title={isLooping ? "Tắt lặp lại" : "Bật lặp lại"}
              disabled={!isVideo}
            >
              <Repeat className="w-4.5 h-4.5" strokeWidth={2.5} />
            </button>
            <button
              onClick={toggleMute}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-800 bg-neutral-200/80 hover:bg-neutral-300 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 cursor-pointer ${!isVideo ? "opacity-50 pointer-events-none" : ""}`}
              disabled={!isVideo}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4.5 h-4.5" strokeWidth={2.5} />
              ) : (
                <Volume2 className="w-4.5 h-4.5" strokeWidth={2.5} />
              )}
            </button>
            <div
              className={`w-20 hidden sm:block relative volume-control-container ${!isVideo ? "opacity-50 pointer-events-none" : ""}`}
              onClick={stopPropagation}
              onMouseDown={!isVideo ? undefined : (e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsDraggingVolume(true);
                const rect = e.currentTarget.getBoundingClientRect();

                const updateVolume = (clientX: number) => {
                  const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                  const newVolume = percent;
                  setDragVolume(newVolume);

                  // Use requestAnimationFrame for smooth visual updates
                  if (volumeAnimationFrameRef.current === null) {
                    volumeAnimationFrameRef.current = requestAnimationFrame(() => {
                      volumeAnimationFrameRef.current = null;
                    });
                  }
                };

                updateVolume(e.clientX);

                const onMouseMove = (moveEvent: MouseEvent) => {
                  moveEvent.preventDefault();
                  updateVolume(moveEvent.clientX);
                };

                const onMouseUp = () => {
                  if (dragVolume !== null) {
                    handleVolume(dragVolume);
                  }
                  setIsDraggingVolume(false);
                  setDragVolume(null);
                  document.removeEventListener("mousemove", onMouseMove);
                  document.removeEventListener("mouseup", onMouseUp);
                  document.removeEventListener("mouseleave", onMouseUp);
                };

                document.addEventListener("mousemove", onMouseMove, { passive: false });
                document.addEventListener("mouseup", onMouseUp);
                document.addEventListener("mouseleave", onMouseUp);
              }}
            >
              <div className="relative h-2 bg-neutral-200/80 rounded-full cursor-pointer group/volume transition-all duration-200 hover:h-2.5 will-change-[height]">
                <div
                  className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full shadow-sm will-change-[width]"
                  style={{
                    width: `${(isMuted ? 0 : displayVolume) * 100}%`,
                    transition: isDraggingVolume ? "none" : "width 0.1s linear",
                  }}
                />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary-600 rounded-full shadow-md border-2 border-white cursor-grab active:cursor-grabbing hover:scale-125 hover:shadow-lg transition-transform duration-200 will-change-transform"
                  style={{
                    left: `calc(${(isMuted ? 0 : displayVolume) * 100}% - 7px)`,
                    opacity: isDraggingVolume ? 1 : 0,
                    transition: isDraggingVolume ? "opacity 0s, transform 0.2s" : "opacity 0.2s, transform 0.2s",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Center: Play/Pause */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => isVideo && seekBy(-5)}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-neutral-700 hover:text-neutral-900 bg-neutral-200/80 hover:bg-neutral-300 transition-all duration-200 relative shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer ${!isVideo ? "opacity-50 pointer-events-none" : ""}`}
              title="Lùi 5 giây"
              disabled={!isVideo}
            >
              <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
              <span className="absolute text-[10px] font-bold text-neutral-800" style={{ marginTop: "1px" }}>5</span>
            </button>

            <button
              onClick={togglePlay}
              disabled={!isVideo || isLoading}
              className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 shadow-xl hover:shadow-2xl shadow-primary-600/40 cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary-500/50"
              aria-label={playing ? "Tạm dừng" : "Phát"}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/40 border-t-white rounded-full animate-spin" />
              ) : playing ? (
                <Pause className="w-7 h-7 text-white" strokeWidth={2.5} />
              ) : (
                <Play className="w-7 h-7 text-white ml-0.5" strokeWidth={2.5} />
              )}
            </button>

            <button
              onClick={() => isVideo && seekBy(5)}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-neutral-700 hover:text-neutral-900 bg-neutral-200/80 hover:bg-neutral-300 transition-all duration-200 relative shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer ${!isVideo ? "opacity-50 pointer-events-none" : ""}`}
              title="Tiến 5 giây"
              disabled={!isVideo}
            >
              <RotateCw className="w-5 h-5" strokeWidth={2.5} />
              <span className="absolute text-[10px] font-bold text-neutral-800" style={{ marginTop: "1px" }}>5</span>
            </button>
          </div>

          {/* Right: Fullscreen */}
          <div className="absolute right-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                void toggleFullscreen();
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-800 bg-neutral-200/80 hover:bg-neutral-300 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 cursor-pointer ${!isVideo ? "opacity-50 pointer-events-none" : ""}`}
              title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
              disabled={!isVideo}
            >
              {isFullscreen ? (
                <Minimize className="w-4.5 h-4.5" strokeWidth={2.5} />
              ) : (
                <Maximize className="w-4.5 h-4.5" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
