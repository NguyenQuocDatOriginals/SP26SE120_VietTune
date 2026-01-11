import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

const SUPPORTED_FORMATS = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/vnd.wave",
];
const RECORDING_TYPES = [
  "Nhạc không lời",
  "Nhạc có lời",
  "Nhạc nghi lễ",
  "Dân ca",
  "Sử thi",
  "Hát ru",
  "Hát lao động",
  "Loại khác",
];

export default function UploadMusic() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<{
    name: string;
    size: number;
    type: string;
    duration: number;
    detectedType: string;
  } | null>(null);
  const [type, setType] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const inferMimeFromName = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (!ext) return "";
    if (ext === "mp3") return "audio/mpeg";
    if (ext === "wav") return "audio/wav";
    return "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const mime = selected.type || inferMimeFromName(selected.name);
    if (!SUPPORTED_FORMATS.includes(mime)) {
      setError("Chỉ hỗ trợ file mp3 hoặc wav.");
      setFile(null);
      setAnalysis(null);
      return;
    }

    setError("");
    setFile(selected);
    setIsAnalyzing(true);

    // Read actual duration using an Audio element
    const url = URL.createObjectURL(selected);
    const audio = new Audio();
    let cleanedUp = false;

    const onLoaded = () => {
      if (cleanedUp) return;
      const durationSeconds = isFinite(audio.duration)
        ? Math.round(audio.duration)
        : 0;
      setAnalysis({
        name: selected.name,
        size: selected.size,
        type: mime,
        duration: durationSeconds,
        detectedType:
          RECORDING_TYPES[Math.floor(Math.random() * RECORDING_TYPES.length)],
      });
      setType("");
      setIsAnalyzing(false);
      cleanup();
    };

    const onError = () => {
      if (cleanedUp) return;
      setError("Không thể phân tích tệp âm thanh. Hãy kiểm tra định dạng.");
      setFile(null);
      setAnalysis(null);
      setIsAnalyzing(false);
      cleanup();
    };

    const cleanup = () => {
      cleanedUp = true;
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
      audio.src = "";
      URL.revokeObjectURL(url);
    };

    audio.preload = "metadata";
    audio.src = url;
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !analysis || !type) {
      setError("Vui lòng chọn file và phân loại.");
      return;
    }

    // Lưu bản nhạc vào localStorage
    const reader = new FileReader();
    reader.onload = function (ev) {
      const audioData = ev.target?.result;
      if (!audioData) return;
      // Tạo object bản thu
      const newRecording = {
        id: Date.now(),
        name: analysis.name,
        type: analysis.type,
        size: analysis.size,
        duration: analysis.duration,
        detectedType: analysis.detectedType,
        userType: type,
        audioData,
        uploadedAt: new Date().toISOString(),
      };
      // Lấy danh sách bản thu hiện tại
      const recordings = JSON.parse(localStorage.getItem("localRecordings") || "[]");
      // Thêm bản thu mới lên đầu
      recordings.unshift(newRecording);
      // Giới hạn tối đa 10 bản thu
      if (recordings.length > 10) recordings.length = 10;
      localStorage.setItem("localRecordings", JSON.stringify(recordings));
      setSuccess(
        `Đã tải lên thành công!\nTên: ${analysis.name}\nPhân loại: ${type}`
      );
      setFile(null);
      setAnalysis(null);
      setType("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setSuccess(""), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Local Dropdown component matching SearchBar styles
  function Dropdown({
    value,
    onChange,
    options,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: { key: string; value: string }[];
  }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement | null>(null); // portal menu ref

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const clickedOutsideDropdown =
          dropdownRef.current && !dropdownRef.current.contains(target);
        const clickedOutsideMenu =
          menuRef.current && !menuRef.current.contains(target);

        // If clicked outside both the dropdown trigger and the portal menu, close
        if (
          clickedOutsideDropdown &&
          (menuRef.current ? clickedOutsideMenu : true)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.key === value);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

    useEffect(() => {
      const updateRect = () => {
        if (buttonRef.current)
          setMenuRect(buttonRef.current.getBoundingClientRect());
      };
      if (isOpen) updateRect();
      window.addEventListener("resize", updateRect);
      window.addEventListener("scroll", updateRect, true);
      return () => {
        window.removeEventListener("resize", updateRect);
        window.removeEventListener("scroll", updateRect, true);
      };
    }, [isOpen]);

    return (
      <div ref={dropdownRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-5 py-3 pr-10 bg-white text-secondary-900 border border-secondary-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors cursor-pointer text-left flex items-center justify-between"
        >
          <span>{selectedOption ? selectedOption.value : "-- Chọn --"}</span>
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen &&
          menuRect &&
          createPortal(
            <div
              ref={(el) => (menuRef.current = el)}
              className="backdrop-blur-xl bg-white rounded-2xl shadow-2xl border border-white/40 overflow-hidden"
              style={{
                position: "absolute",
                left: Math.max(8, menuRect.left + (window.scrollX ?? 0)),
                top: menuRect.bottom + (window.scrollY ?? 0) + 8,
                width: menuRect.width,
                zIndex: 200000,
                boxShadow:
                  "0 12px 48px 0 rgba(31, 38, 135, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
              }}
            >
              <div
                className="max-h-60 overflow-y-auto custom-scroll"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#10b981 rgba(255, 255, 255, 0.3)",
                }}
              >
                <style>{`
                  .custom-scroll::-webkit-scrollbar {
                    width: 8px;
                  }
                  .custom-scroll::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 10px;
                  }
                  .custom-scroll::-webkit-scrollbar-thumb {
                    background: #10b981;
                    border-radius: 10px;
                  }
                  .custom-scroll::-webkit-scrollbar-thumb:hover {
                    background: #059669;
                  }
                `}</style>

                {options.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      onChange(option.key);
                      setIsOpen(false);
                    }}
                    className={`w-full px-5 py-3 text-left transition-colors ${
                      value === option.key
                        ? "bg-emerald-500 text-white font-medium"
                        : "text-secondary-900 hover:bg-emerald-100 hover:text-emerald-900"
                    }`}
                  >
                    {option.value}
                  </button>
                ))}
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  }

  return (
    <div className="w-full text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center"
      >
        {/* Styled file chooser (hidden input + label button) */}
        <div className="mb-4 w-full flex flex-col items-center">
          <div className="flex items-center gap-4 justify-center w-full">
            <label
              htmlFor="file-upload"
              className={`btn-liquid-glass-secondary inline-flex items-center px-4 py-2 rounded-lg ${
                isAnalyzing ? "opacity-60 cursor-wait" : ""
              }`}
              aria-disabled={isAnalyzing}
            >
              Chọn tệp
            </label>
            <span className="text-white/90 truncate max-w-[60%] text-left">
              {file ? file.name : "Không tệp nào được chọn"}
            </span>
          </div>
          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav"
            onChange={handleFileChange}
            className="sr-only"
            disabled={isAnalyzing}
          />
        </div>

        {isAnalyzing && (
          <p className="text-white/70 mb-2">Đang phân tích tệp...</p>
        )}
        {error && <p className="text-red-400 mb-2">{error}</p>}
        {success && (
          <p className="text-green-400 mb-2 whitespace-pre-line">{success}</p>
        )}
        {analysis && (
          <div className="mb-4 w-full">
            <p>
              <strong>Tên file:</strong> {analysis.name}
            </p>
            <p>
              <strong>Định dạng:</strong> {analysis.type}
            </p>
            <p>
              <strong>Kích thước:</strong>{" "}
              {(analysis.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p>
              <strong>Thời lượng:</strong> {formatDuration(analysis.duration)} (
              {analysis.duration} giây)
            </p>
            <p>
              <strong>Phân loại hệ thống gợi ý:</strong> {analysis.detectedType}
            </p>
            <label className="block mt-2 w-full">
              <span className="font-semibold">Chọn phân loại:</span>
              <div className="mt-1 relative">
                {/* Custom dropdown styled like SearchBar */}
                <Dropdown
                  value={type}
                  onChange={(val: string) => setType(val)}
                  options={[
                    { key: "", value: "-- Chọn --" },
                    ...RECORDING_TYPES.map((t) => ({ key: t, value: t })),
                  ]}
                />
              </div>
            </label>
          </div>
        )}
        <button
          type="submit"
          className="btn-liquid-glass-primary px-6 py-2 mt-1 rounded-xl shadow-lg mx-auto"
          disabled={!file || !analysis || !type}
        >
          Tải lên
        </button>
      </form>
    </div>
  );
}
