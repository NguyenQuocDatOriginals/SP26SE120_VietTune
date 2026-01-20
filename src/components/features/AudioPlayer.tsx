import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack } from "lucide-react";

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
    const onVolume = () => setVolume(audio.volume);
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
    audio.volume = Math.max(0, Math.min(1, v));
    setVolume(audio.volume);
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume > 0 ? volume : 0.5;
      setIsMuted(false);
    } else {
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
            className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-600 hover:bg-primary-500 transition-colors disabled:opacity-50 flex-shrink-0"
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
              className="h-1.5 bg-neutral-200 rounded-full overflow-hidden cursor-pointer"
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
            className="h-2 bg-neutral-200 rounded-full overflow-hidden cursor-pointer group"
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
              className="h-full bg-primary-600 rounded-full transition-none relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-neutral-500 font-mono">{formatTime(currentTime)}</span>
            <span className="text-xs text-neutral-500 font-mono">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Left: Skip buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => seekBy(-10)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
              title="Lùi 10 giây"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          </div>

          {/* Center: Play/Pause */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => seekBy(-5)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 transition-colors text-xs font-medium"
              title="Lùi 5 giây"
            >
              -5s
            </button>
            
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-primary-600 hover:bg-primary-500 transition-all hover:scale-105 disabled:opacity-50 shadow-lg shadow-primary-500/30"
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
              className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 transition-colors text-xs font-medium"
              title="Tiến 5 giây"
            >
              +5s
            </button>
          </div>

          {/* Right: Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <div 
              className="w-20 hidden sm:block"
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
              <div 
                className="h-1.5 bg-neutral-200 rounded-full overflow-hidden cursor-pointer"
              >
                <div 
                  className="h-full bg-primary-600 rounded-full transition-none"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}