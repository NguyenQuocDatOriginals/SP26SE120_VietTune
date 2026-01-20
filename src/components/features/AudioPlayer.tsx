import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw } from "lucide-react";

// Module-scoped active audio so only one player plays at a time
let activeAudio: HTMLAudioElement | null = null;

type Props = {
  src: string;
  title?: string;
  artist?: string;
  compact?: boolean;
  className?: string;
};

export default function AudioPlayer({ 
  src, 
  title, 
  artist, 
  compact = false, 
  className = "" 
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [savedVolume, setSavedVolume] = useState(1); // Store volume before muting
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => {
      setDuration(isNaN(audio.duration) ? 0 : audio.duration || 0);
      setIsLoading(false);
    };
    const onVolume = () => {
      const newVol = audio.volume;
      setVolume(newVol);
      // Only update savedVolume if not muted (volume > 0)
      if (newVol > 0) {
        setSavedVolume(newVol);
      }
    };
    const onEnded = () => setPlaying(false);
    const onCanPlay = () => setIsLoading(false);
    const onWaiting = () => setIsLoading(true);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("volumechange", onVolume);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("waiting", onWaiting);

    // sync initial values
    setVolume(audio.volume);
    setDuration(isNaN(audio.duration) ? 0 : audio.duration || 0);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("volumechange", onVolume);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("waiting", onWaiting);
      if (activeAudio === audio) activeAudio = null;
    };
  }, [src]);

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const play = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (activeAudio && activeAudio !== audio) {
      try {
        activeAudio.pause();
      } catch (e) {
        /* ignore */
      }
    }
    try {
      await audio.play();
      setPlaying(true);
      activeAudio = audio;
    } catch (e) {
      console.warn("Play failed:", e);
    }
  };

  const pause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlaying(false);
    if (activeAudio === audio) activeAudio = null;
  };

  const togglePlay = () => (playing ? pause() : play());

  const seekTo = (val: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(val, duration || 0));
    setCurrentTime(audio.currentTime);
  };

  const seekBy = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Math.max(0, Math.min(duration, audio.currentTime + delta));
    audio.currentTime = next;
    setCurrentTime(next);
  };

  const handleVolume = (v: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = Math.max(0, Math.min(1, v));
    audio.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0) {
      setSavedVolume(newVolume); // Save non-zero volume
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      // Unmute: restore saved volume
      audio.volume = savedVolume > 0 ? savedVolume : 0.5;
      setVolume(audio.volume);
      setIsMuted(false);
    } else {
      // Mute: save current volume first
      setSavedVolume(volume);
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  // Compact version for cards
  if (compact) {
    return (
      <div className={`${className} w-full`}>
        <audio ref={audioRef} src={src} preload="metadata" />
        
        <div className="flex items-center gap-3">
          {/* Play Button */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-600 hover:bg-primary-500 transition-colors disabled:opacity-50 flex-shrink-0 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : playing ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </button>

          {/* Progress */}
          <div className="flex-1 min-w-0">
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
          </div>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className={`${className} w-full`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
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
        </div>

        {/* Controls */}
        <div className="relative flex items-center justify-center">
          {/* Center: Play/Pause */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => seekBy(-5)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-700 hover:text-neutral-900 bg-neutral-300 hover:bg-neutral-400 transition-colors relative shadow-sm hover:shadow-md"
              title="Lùi 5 giây"
            >
              <RotateCcw className="w-6 h-6" strokeWidth={2} />
              <span className="absolute text-[9px] font-bold" style={{ marginTop: '2px' }}>5</span>
            </button>
            
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-primary-600 hover:bg-primary-500 transition-all hover:scale-105 disabled:opacity-50 shadow-lg hover:shadow-xl shadow-primary-500/30"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : playing ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </button>

            <button
              onClick={() => seekBy(5)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-700 hover:text-neutral-900 bg-neutral-300 hover:bg-neutral-400 transition-colors relative shadow-sm hover:shadow-md"
              title="Tiến 5 giây"
            >
              <RotateCw className="w-6 h-6" strokeWidth={2} />
              <span className="absolute text-[9px] font-bold" style={{ marginTop: '2px' }}>5</span>
            </button>
          </div>

          {/* Right: Volume - Positioned absolutely */}
          <div className="absolute right-0 flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-800 bg-neutral-200 hover:bg-neutral-300 transition-colors shadow-sm hover:shadow-md"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <div 
              className="w-20 hidden sm:block relative"
              onMouseDown={(e) => {
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