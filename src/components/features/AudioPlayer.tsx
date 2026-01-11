import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

// Module-scoped active audio so only one player plays at a time
let activeAudio: HTMLAudioElement | null = null;

type Props = {
  src: string;
  compact?: boolean; // when true, use a more compact layout for narrow areas
  className?: string;
};

export default function AudioPlayer({ src, className = "" }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => {
      setDuration(isNaN(audio.duration) ? 0 : audio.duration || 0);
    };
    const onVolume = () => setVolume(audio.volume);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("volumechange", onVolume);
    audio.addEventListener("ended", onEnded);

    // sync initial values
    setVolume(audio.volume);
    setDuration(isNaN(audio.duration) ? 0 : audio.duration || 0);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("volumechange", onVolume);
      audio.removeEventListener("ended", onEnded);
      // If this instance was the active one, clear it on unmount
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
    // pause other players
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
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`${className} w-full max-w-full bg-white/6 rounded-xl shadow-lg px-3 py-3 mt-3 z-10 overflow-hidden`}
    >
      <style>{`
        .audio-range { -webkit-appearance: none; appearance: none; height: 8px; border-radius: 999px; background: linear-gradient(90deg, #22c55e ${progressPercent}%, rgba(255,255,255,0.08) ${progressPercent}%); }
        .audio-range::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 6px rgba(34,197,94,0.12); cursor: pointer; }
        .audio-range::-moz-range-thumb { width:14px; height:14px; border-radius:50%; background:#22c55e; cursor:pointer; }
        .vol-range { -webkit-appearance:none; appearance:none; height:6px; border-radius:999px; background: linear-gradient(90deg, #10b981 ${
          volume * 100
        }%, rgba(255,255,255,0.08) ${volume * 100}%);} 
        .vol-range::-webkit-slider-thumb { -webkit-appearance:none; width:12px; height:12px; border-radius:50%; background:#10b981; box-shadow:0 0 0 4px rgba(16,185,129,0.12); cursor:pointer }
        .vol-range::-moz-range-thumb { width:12px; height:12px; border-radius:50%; background:#10b981; cursor:pointer }
      `}</style>

      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-4 w-full flex-row flex-nowrap">
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            aria-label="Rewind 5 seconds"
            title="Rewind 5s"
            onClick={() => seekBy(-5)}
            className="inline-flex w-10 h-10 rounded-full items-center justify-center text-white relative z-20 ring-1 ring-white/10 transition transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <span className="text-white font-semibold text-sm">-5s</span>
          </button>

          <button
            aria-label={playing ? "Pause" : "Play"}
            title={playing ? "Pause" : "Play"}
            onClick={togglePlay}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                togglePlay();
              }
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-white bg-gradient-to-tr from-green-400 to-green-600 hover:scale-105 transition transform duration-150 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            {playing ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            aria-label="Forward 5 seconds"
            title="Forward 5s"
            onClick={() => seekBy(5)}
            className="inline-flex w-10 h-10 rounded-full items-center justify-center text-white relative z-20 ring-1 ring-white/10 transition transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <span className="text-white font-semibold text-sm">+5s</span>
          </button>
        </div>

        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 min-w-0">
          <div className="text-white text-sm font-mono min-w-[72px] text-center hidden sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.01}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              aria-label="Seek"
              className="audio-range w-full"
            />
          </div>

          <div className="flex items-center gap-2 ml-2">
            <Volume2 className="w-5 h-5 text-white" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => handleVolume(Number(e.target.value))}
              aria-label="Volume"
              className="vol-range w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
