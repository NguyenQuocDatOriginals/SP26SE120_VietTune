import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Upload, Music, MapPin, FileAudio, Info, Shield, X, Check, Search, Plus, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";

// ===== CONSTANTS =====
const SUPPORTED_FORMATS = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/vnd.wave",
  "audio/flac",
  "audio/x-flac",
];

const GENRES = [
  "Dân ca",
  "Hát xẩm",
  "Ca trù",
  "Chầu văn",
  "Quan họ",
  "Hát then",
  "Cải lương",
  "Tuồng",
  "Chèo",
  "Nhã nhạc",
  "Ca Huế",
  "Đờn ca tài tử",
  "Hát bội",
  "Hò",
  "Lý",
  "Vọng cổ",
  "Hát ru",
  "Hát ví",
  "Hát giặm",
  "Bài chòi",
  "Khác",
];

const LANGUAGES = [
  "Tiếng Việt",
  "Tiếng Kinh",
  "Tiếng Thái",
  "Tiếng Tày",
  "Tiếng Nùng",
  "Tiếng H'Mông",
  "Tiếng Mường",
  "Tiếng Khmer",
  "Tiếng Chăm",
  "Tiếng Ê Đê",
  "Tiếng Ba Na",
  "Tiếng Gia Rai",
  "Tiếng Dao",
  "Tiếng Sán Chay",
  "Tiếng Cơ Ho",
  "Tiếng Xơ Đăng",
  "Tiếng Sán Dìu",
  "Tiếng Hrê",
  "Tiếng Mnông",
  "Tiếng Ra Glai",
  "Tiếng Giáy",
  "Tiếng Cơ Tu",
  "Tiếng Bru-Vân Kiều",
  "Tiếng Khác",
];

const ETHNICITIES = [
  "Kinh",
  "Tày",
  "Thái",
  "Mường",
  "Khmer",
  "H'Mông",
  "Nùng",
  "Hoa",
  "Dao",
  "Gia Rai",
  "Ê Đê",
  "Ba Na",
  "Xơ Đăng",
  "Sán Chay",
  "Cơ Ho",
  "Chăm",
  "Sán Dìu",
  "Hrê",
  "Mnông",
  "Ra Glai",
  "Giáy",
  "Stră",
  "Bru-Vân Kiều",
  "Cơ Tu",
  "Giẻ Triêng",
  "Tà Ôi",
  "Mạ",
  "Khơ Mú",
  "Co",
  "Chơ Ro",
  "Hà Nhì",
  "Xinh Mun",
  "Chu Ru",
  "Lào",
  "La Chí",
  "Kháng",
  "Phù Lá",
  "La Hủ",
  "La Ha",
  "Pà Thẻn",
  "Lự",
  "Ngái",
  "Chứt",
  "Lô Lô",
  "Mảng",
  "Cờ Lao",
  "Bố Y",
  "Cống",
  "Si La",
  "Pu Péo",
  "Rơ Măm",
  "Brâu",
  "Ơ Đu",
  "Khác",
];

const REGIONS = [
  "Trung du và miền núi Bắc Bộ",
  "Đồng bằng Bắc Bộ",
  "Bắc Trung Bộ",
  "Nam Trung Bộ",
  "Cao nguyên Trung Bộ",
  "Đông Nam Bộ",
  "Tây Nam Bộ",
];

// 34 tỉnh thành sau sắp xếp đơn vị hành chính 1/7/2025
const PROVINCES = [
  // 6 thành phố trực thuộc Trung ương
  "TP. Hà Nội",
  "TP. Hải Phòng",
  "TP. Huế",
  "TP. Đà Nẵng",
  "TP. Hồ Chí Minh",
  "TP. Cần Thơ",
  // 28 tỉnh (sắp xếp A-Z)
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Điện Biên",
  "Đắk Lắk",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Tĩnh",
  "Hưng Yên",
  "Khánh Hòa",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "Tuyên Quang",
  "Vĩnh Long",
];

const EVENT_TYPES = [
  "Đám cưới",
  "Đám tang",
  "Lễ hội đình",
  "Lễ hội chùa",
  "Tết Nguyên Đán",
  "Hội xuân",
  "Lễ cầu mùa",
  "Lễ cúng tổ tiên",
  "Lễ cấp sắc",
  "Lễ hội đâm trâu",
  "Lễ hội cồng chiêng",
  "Sinh hoạt cộng đồng",
  "Biểu diễn nghệ thuật",
  "Ghi âm studio",
  "Ghi âm thực địa",
  "Khác",
];

const PERFORMANCE_TYPES = [
  { key: "instrumental", label: "Chỉ nhạc cụ (Instrumental)" },
  { key: "acappella", label: "Chỉ giọng hát không đệm (Acappella)" },
  { key: "vocal_accompaniment", label: "Giọng hát có nhạc đệm (Vocal with accompaniment)" },
];

const INSTRUMENTS = [
  "Alal (Ba Na)",
  "Aráp (Ba Na)",
  "Aráp (Ca Dong)",
  "Aráp (Gia Rai)",
  "Aráp (Rơ Năm)",
  "Aráp (Stră)",
  "Biên khánh (Kinh)",
  "Bro (Ba Na)",
  "Bro (Gia Rai)",
  "Bro (Giẻ Triêng)",
  "Bro (Xơ Đăng)",
  "Bẳng bu (Thái)",
  "Chul (Ba Na)",
  "Chul (Gia Rai)",
  "Chênh Kial (Ba Na)",
  "Cò ke (Mường)",
  "Cồng, chiêng (Ba Na)",
  "Cồng, chiêng (Gia Rai)",
  "Cồng, chiêng (Giẻ Triêng)",
  "Cồng, chiêng (Hrê)",
  "Cồng, chiêng (Ê Đê)",
  "Dàn nhạc ngũ âm (Khmer)",
  "Goong (Ba Na)",
  "Goong (Gia Rai)",
  "Goong (Giẻ Triêng)",
  "Goong đe (Ba Na)",
  "Hơgơr (Ê Đê)",
  "Hơgơr cân (Mnâm)",
  "Hơgơr cân (Rơ Năm)",
  "Hơgơr prong (Gia Rai)",
  "Hơgơr tuôn (Hà Lang)",
  "Hơgơr tăk (Ba Na)",
  "Khinh khung (Ba Na)",
  "Khinh khung (Gia Rai)",
  "Khèn (H'Mông)",
  "Khèn (Ta Ôi)",
  "Khèn (Ê Đê)",
  "Khên (Vân Kiều)",
  "Knăh ring (Ba Na)",
  "Knăh ring (Gia Rai)",
  "K'lông put (Gia Rai)",
  "K'ny (Ba Na)",
  "K'ny (Gia Rai)",
  "K'ny (Rơ Ngao)",
  "K'ny (Xơ Đăng)",
  "Kèn bầu (Chăm)",
  "Kèn bầu (Kinh)",
  "Kèn bầu (Thái)",
  "Kềnh (H'Mông)",
  "M'linh (Dao)",
  "M'linh (Mường)",
  "M'nhum (Gia Rai)",
  "Mõ (Kinh)",
  "Phách (Kinh)",
  "Pí cổng (Thái)",
  "Pí lè (Thái)",
  "Pí lè (Tày)",
  "Pí một lao (Kháng)",
  "Pí một lao (Khơ Mú)",
  "Pí một lao (La Ha)",
  "Pí một lao (Thái)",
  "Pí pặp (Thái)",
  "Pí phướng (Thái)",
  "Pí đôi (Thái)",
  "Púa (H'Mông)",
  "Púa (Lô Lô)",
  "Qeej (H'Mông)",
  "Rang leh (Ca Dong)",
  "Rang leh (Stră)",
  "Rang rai (Ba Na)",
  "Rang rai (Gia Rai)",
  "Song lang (Kinh)",
  "Sáo ngang (Kinh)",
  "Sênh tiền (Kinh)",
  "T'rum (Gia Rai)",
  "Ta in (Hà Nhì)",
  "Ta lư (Vân Kiều)",
  "Ta pòl (Ba Na)",
  "Ta pòl (Brâu)",
  "Ta pòl (Gia Rai)",
  "Ta pòl (Rơ Năm)",
  "Tam thập lục (Kinh)",
  "Teh ding (Gia Rai)",
  "Tiêu (Kinh)",
  "Tol alao (Ca Dong)",
  "Tông đing (Ba Na)",
  "Tông đing (Ca Dong)",
  "Tơ nốt (Ba Na)",
  "Trống bộc (Kinh)",
  "Trống cái (Kinh)",
  "Trống chầu (Kinh)",
  "Trống cơm (Kinh)",
  "Trống dẹt (Kinh)",
  "Trống khẩu (Kinh)",
  "Trống lắng (Kinh)",
  "Trống mảnh (Kinh)",
  "Trống quần (Kinh)",
  "Trống đế (Kinh)",
  "Trống đồng (Kinh)",
  "Tính tẩu (Thái)",
  "Tính tẩu (Tày)",
  "Vang (Gia Rai)",
  "Đinh Duar (Giẻ Triêng)",
  "Đinh Khén (Xơ Đăng)",
  "Đinh tuk (Ba Na)",
  "Đao đao (Khơ Mú)",
  "Đuk đik (Giẻ Triêng)",
  "Đàn bầu (Kinh)",
  "Đàn môi (H'Mông)",
  "Đàn nguyệt (Kinh)",
  "Đàn nhị (Chăm)",
  "Đàn nhị (Dao)",
  "Đàn nhị (Giáy)",
  "Đàn nhị (Kinh)",
  "Đàn nhị (Nùng)",
  "Đàn nhị (Tày)",
  "Đàn t'rưng (Ba Na)",
  "Đàn t'rưng (Gia Rai)",
  "Đàn tam (Kinh)",
  "Đàn tranh (Kinh)",
  "Đàn tứ (Kinh)",
  "Đàn tỳ bà (Kinh)",
  "Đàn đá (Kinh)",
  "Đàn đáy (Kinh)",
];

// ===== UTILITY FUNCTIONS =====
const inferMimeFromName = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  if (!ext) return "";
  if (ext === "mp3") return "audio/mpeg";
  if (ext === "wav") return "audio/wav";
  if (ext === "flac") return "audio/flac";
  return "";
};

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

// ===== REUSABLE COMPONENTS =====

// Dropdown with search - UI matching SearchBar style
function SearchableDropdown({
  value,
  onChange,
  options,
  placeholder = "-- Chọn --",
  searchable = true,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(target);
      const clickedOutsideMenu =
        menuRef.current && !menuRef.current.contains(target);
      if (clickedOutsideDropdown && (menuRef.current ? clickedOutsideMenu : true)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateRect = () => {
      if (buttonRef.current) setMenuRect(buttonRef.current.getBoundingClientRect());
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
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-5 py-3 pr-10 bg-white text-secondary-900 border border-secondary-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-left flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className={value ? "text-secondary-900" : "text-secondary-400"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-secondary-500 transition-transform duration-200 ${
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
                "0 8px 32px 0 rgba(31, 38, 135, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            {searchable && (
              <div className="p-3 border-b border-secondary-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full pl-9 pr-3 py-2 bg-secondary-50 text-secondary-900 placeholder-secondary-400 border border-secondary-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    autoFocus
                  />
                </div>
              </div>
            )}
            <div
              className="max-h-60 overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#10b981 rgba(255, 255, 255, 0.3)",
              }}
            >
              <style>{`
                .dropdown-scroll::-webkit-scrollbar {
                  width: 8px;
                }
                .dropdown-scroll::-webkit-scrollbar-track {
                  background: rgba(255, 255, 255, 0.3);
                  border-radius: 10px;
                }
                .dropdown-scroll::-webkit-scrollbar-thumb {
                  background: #10b981;
                  border-radius: 10px;
                }
                .dropdown-scroll::-webkit-scrollbar-thumb:hover {
                  background: #059669;
                }
              `}</style>
              {filteredOptions.length === 0 ? (
                <div className="px-5 py-3 text-secondary-400 text-sm text-center">
                  Không tìm thấy kết quả
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-5 py-3 text-left text-sm transition-colors ${
                      value === option
                        ? "bg-emerald-500 text-white font-medium"
                        : "text-secondary-900 hover:bg-emerald-100 hover:text-emerald-900"
                    }`}
                  >
                    {option}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

// Multi-select with tags - UI matching SearchBar style
function MultiSelectTags({
  values,
  onChange,
  options,
  placeholder = "Chọn nhạc cụ...",
  disabled = false,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

  const filteredOptions = useMemo(() => {
    const available = options.filter((opt) => !values.includes(opt));
    if (!search) return available;
    return available.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, values, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideContainer =
        containerRef.current && !containerRef.current.contains(target);
      const clickedOutsideMenu =
        menuRef.current && !menuRef.current.contains(target);
      if (clickedOutsideContainer && (menuRef.current ? clickedOutsideMenu : true)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateRect = () => {
      if (inputRef.current) setMenuRect(inputRef.current.getBoundingClientRect());
    };
    if (isOpen) updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen]);

  const removeTag = (tag: string) => {
    onChange(values.filter((v) => v !== tag));
  };

  const addTag = (tag: string) => {
    onChange([...values, tag]);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={inputRef}
        onClick={() => !disabled && setIsOpen(true)}
        className={`min-h-[48px] px-4 py-2.5 bg-white border border-secondary-300 rounded-2xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"
        }`}
      >
        <div className="flex flex-wrap gap-1.5">
          {values.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white text-xs rounded-full font-medium"
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  className="hover:bg-emerald-600 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {!disabled && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={values.length === 0 ? placeholder : ""}
              className="flex-1 min-w-[120px] bg-transparent text-secondary-900 placeholder-secondary-400 text-sm focus:outline-none py-1"
            />
          )}
        </div>
      </div>

      {isOpen &&
        menuRect &&
        !disabled &&
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
                "0 8px 32px 0 rgba(31, 38, 135, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div
              className="max-h-60 overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#10b981 rgba(255, 255, 255, 0.3)",
              }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-5 py-3 text-secondary-400 text-sm text-center">
                  {search ? "Không tìm thấy kết quả" : "Đã chọn tất cả"}
                </div>
              ) : (
                filteredOptions.slice(0, 50).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => addTag(option)}
                    className="w-full px-5 py-3 text-left text-sm text-secondary-900 hover:bg-emerald-100 hover:text-emerald-900 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4 text-emerald-500" />
                    {option}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

// Text Input - UI matching SearchBar style
function TextInput({
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  multiline = false,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  const baseClasses = `w-full px-5 py-3 bg-white text-secondary-900 placeholder-secondary-400 border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
    disabled ? "opacity-50 cursor-not-allowed" : ""
  }`;

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`${baseClasses} rounded-2xl resize-none`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`${baseClasses} rounded-full`}
    />
  );
}

// Form Field Wrapper
function FormField({
  label,
  required = false,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-white/90">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-white/50">{hint}</p>}
    </div>
  );
}

// Section Header
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  optional = false,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="p-2 bg-emerald-500/20 rounded-lg">
        <Icon className="h-5 w-5 text-emerald-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {title}
          {optional && (
            <span className="text-xs font-normal text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
              Tùy chọn
            </span>
          )}
        </h3>
        {subtitle && <p className="text-sm text-white/60 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// Collapsible Section
function CollapsibleSection({
  icon: Icon,
  title,
  subtitle,
  optional = false,
  defaultOpen = true,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  optional?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Icon className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              {title}
              {optional && (
                <span className="text-xs font-normal text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                  Tùy chọn
                </span>
              )}
            </h3>
            {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-white/70 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="p-4 pt-2 space-y-4">{children}</div>}
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function UploadMusic() {
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [audioInfo, setAudioInfo] = useState<{
    name: string;
    size: number;
    type: string;
    duration: number;
    bitrate?: number;
    sampleRate?: number;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Basic info
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [composer, setComposer] = useState("");
  const [composerUnknown, setComposerUnknown] = useState(false);
  const [language, setLanguage] = useState("");
  const [genre, setGenre] = useState("");
  const [recordingDate, setRecordingDate] = useState("");
  const [dateEstimated, setDateEstimated] = useState(false);
  const [dateNote, setDateNote] = useState("");
  const [recordingLocation, setRecordingLocation] = useState("");

  // Cultural context
  const [ethnicity, setEthnicity] = useState("");
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [eventType, setEventType] = useState("");
  const [performanceType, setPerformanceType] = useState("");
  const [instruments, setInstruments] = useState<string[]>([]);

  // Additional notes
  const [description, setDescription] = useState("");
  const [fieldNotes, setFieldNotes] = useState("");
  const [transcription, setTranscription] = useState("");
  const [lyricsFile, setLyricsFile] = useState<File | null>(null);

  // Admin & copyright
  const [collector, setCollector] = useState("");
  const [copyright, setCopyright] = useState("");
  const [archiveOrg, setArchiveOrg] = useState("");
  const [catalogId, setCatalogId] = useState("");

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  // Derived states
  const requiresInstruments = performanceType === "instrumental" || performanceType === "vocal_accompaniment";
  const allowsLyrics = performanceType === "acappella" || performanceType === "vocal_accompaniment";

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const mime = selected.type || inferMimeFromName(selected.name);
    if (!SUPPORTED_FORMATS.includes(mime)) {
      setErrors((prev) => ({ ...prev, file: "Chỉ hỗ trợ file MP3, WAV hoặc FLAC" }));
      setFile(null);
      setAudioInfo(null);
      return;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.file;
      return newErrors;
    });
    setFile(selected);
    setIsAnalyzing(true);

    const url = URL.createObjectURL(selected);
    const audio = new Audio();
    let cleanedUp = false;

    const onLoaded = () => {
      if (cleanedUp) return;
      const durationSeconds = isFinite(audio.duration) ? Math.round(audio.duration) : 0;
      
      // Estimate bitrate from file size and duration
      const bitrate = durationSeconds > 0 
        ? Math.round((selected.size * 8) / durationSeconds / 1000) 
        : undefined;

      setAudioInfo({
        name: selected.name,
        size: selected.size,
        type: mime,
        duration: durationSeconds,
        bitrate,
      });
      
      // Auto-fill title from filename
      if (!title) {
        const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
      
      setIsAnalyzing(false);
      cleanup();
    };

    const onError = () => {
      if (cleanedUp) return;
      setErrors((prev) => ({ ...prev, file: "Không thể phân tích file âm thanh" }));
      setFile(null);
      setAudioInfo(null);
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

  // Handle lyrics file
  const handleLyricsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setLyricsFile(selected);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!file) newErrors.file = "Vui lòng chọn file âm thanh";
    if (!title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";
    if (!artist.trim()) newErrors.artist = "Vui lòng nhập tên nghệ sĩ";
    if (!composerUnknown && !composer.trim()) {
      newErrors.composer = "Vui lòng nhập tên tác giả hoặc chọn 'Dân gian/Không rõ'";
    }
    if (!genre) newErrors.genre = "Vui lòng chọn thể loại";
    if (requiresInstruments && instruments.length === 0) {
      newErrors.instruments = "Vui lòng chọn ít nhất một nhạc cụ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus("error");
      setSubmitMessage("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Prepare data
    const formData = {
      id: Date.now(),
      file: {
        name: audioInfo?.name,
        type: audioInfo?.type,
        size: audioInfo?.size,
        duration: audioInfo?.duration,
        bitrate: audioInfo?.bitrate,
      },
      basicInfo: {
        title,
        artist,
        composer: composerUnknown ? "Dân gian/Không rõ tác giả" : composer,
        language,
        genre,
        recordingDate,
        dateEstimated,
        dateNote,
        recordingLocation,
      },
      culturalContext: {
        ethnicity,
        region,
        province,
        eventType,
        performanceType,
        instruments,
      },
      additionalNotes: {
        description,
        fieldNotes,
        transcription,
        hasLyricsFile: !!lyricsFile,
      },
      adminInfo: {
        collector,
        copyright,
        archiveOrg,
        catalogId,
      },
      uploadedAt: new Date().toISOString(),
    };

    // Save to localStorage (in real app, this would be an API call)
    const reader = new FileReader();
    reader.onload = function (ev) {
      const audioData = ev.target?.result;
      if (!audioData) return;

      const newRecording = {
        ...formData,
        audioData,
      };

      const recordings = JSON.parse(localStorage.getItem("localRecordings") || "[]");
      recordings.unshift(newRecording);
      if (recordings.length > 10) recordings.length = 10;
      localStorage.setItem("localRecordings", JSON.stringify(recordings));

      setSubmitStatus("success");
      setSubmitMessage(`Đã tải lên thành công: ${title}`);
      
      // Reset form
      setTimeout(() => {
        resetForm();
      }, 3000);
    };
    
    reader.onerror = () => {
      setSubmitStatus("error");
      setSubmitMessage("Lỗi khi đọc file. Vui lòng thử lại.");
    };

    reader.readAsDataURL(file!);
  };

  const resetForm = () => {
    setFile(null);
    setAudioInfo(null);
    setTitle("");
    setArtist("");
    setComposer("");
    setComposerUnknown(false);
    setLanguage("");
    setGenre("");
    setRecordingDate("");
    setDateEstimated(false);
    setDateNote("");
    setRecordingLocation("");
    setEthnicity("");
    setRegion("");
    setProvince("");
    setEventType("");
    setPerformanceType("");
    setInstruments([]);
    setDescription("");
    setFieldNotes("");
    setTranscription("");
    setLyricsFile(null);
    setCollector("");
    setCopyright("");
    setArchiveOrg("");
    setCatalogId("");
    setErrors({});
    setSubmitStatus("idle");
    setSubmitMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Status Messages */}
      {submitStatus === "success" && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
          <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-200">{submitMessage}</p>
        </div>
      )}
      
      {submitStatus === "error" && (
        <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200">{submitMessage}</p>
        </div>
      )}

      {/* File Upload Section */}
      <div className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-sm">
        <SectionHeader
          icon={Upload}
          title="Tải lên file âm thanh"
          subtitle="Hỗ trợ định dạng MP3, WAV, FLAC"
        />
        
        <div className="mt-4">
          <div
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              errors.file 
                ? "border-red-500/50 bg-red-500/5" 
                : file 
                  ? "border-emerald-500/50 bg-emerald-500/5" 
                  : "border-white/20 hover:border-emerald-500/30 hover:bg-white/5"
            } ${isAnalyzing ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.flac"
              onChange={handleFileChange}
              className="sr-only"
              disabled={isAnalyzing}
            />
            
            {isAnalyzing ? (
              <div className="space-y-3">
                <div className="animate-spin h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto" />
                <p className="text-white/70">Đang phân tích file...</p>
              </div>
            ) : file && audioInfo ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/20 rounded-full w-fit mx-auto">
                  <FileAudio className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{audioInfo.name}</p>
                  <div className="flex items-center justify-center gap-4 mt-2 text-sm text-white/60">
                    <span>{formatFileSize(audioInfo.size)}</span>
                    <span>•</span>
                    <span>{formatDuration(audioInfo.duration)}</span>
                    {audioInfo.bitrate && (
                      <>
                        <span>•</span>
                        <span>~{audioInfo.bitrate} kbps</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setAudioInfo(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-sm text-white/50 hover:text-red-400 transition-colors"
                >
                  Chọn file khác
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-white/10 rounded-full w-fit mx-auto">
                  <Upload className="h-8 w-8 text-white/50" />
                </div>
                <div>
                  <p className="text-white">Kéo thả file hoặc click để chọn</p>
                  <p className="text-sm text-white/50 mt-1">MP3, WAV, FLAC - Tối đa 50MB</p>
                </div>
              </div>
            )}
          </div>
          {errors.file && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.file}
            </p>
          )}
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-sm">
        <SectionHeader
          icon={Music}
          title="Thông tin mô tả cơ bản"
          subtitle="Thông tin chính về bản nhạc"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tiêu đề/Tên bản nhạc" required>
            <TextInput
              value={title}
              onChange={setTitle}
              placeholder="Nhập tên bản nhạc"
              required
            />
            {errors.title && (
              <p className="text-sm text-red-400">{errors.title}</p>
            )}
          </FormField>

          <FormField label="Nghệ sĩ/Người biểu diễn" required>
            <TextInput
              value={artist}
              onChange={setArtist}
              placeholder="Tên người hát hoặc chơi nhạc cụ"
              required
            />
            {errors.artist && (
              <p className="text-sm text-red-400">{errors.artist}</p>
            )}
          </FormField>

          <div className="space-y-2">
            <FormField label="Nhạc sĩ/Tác giả" required={!composerUnknown}>
              <TextInput
                value={composer}
                onChange={setComposer}
                placeholder="Tên người sáng tác"
                disabled={composerUnknown}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-white/90 cursor-pointer">
              <input
                type="checkbox"
                checked={composerUnknown}
                onChange={(e) => {
                  setComposerUnknown(e.target.checked);
                  if (e.target.checked) setComposer("");
                }}
                className="w-4 h-4 rounded border-secondary-300 bg-white text-emerald-500 focus:ring-emerald-500"
              />
              Dân gian/Không rõ tác giả
            </label>
            {errors.composer && (
              <p className="text-sm text-red-400">{errors.composer}</p>
            )}
          </div>

          <FormField label="Ngôn ngữ">
            <SearchableDropdown
              value={language}
              onChange={setLanguage}
              options={LANGUAGES}
              placeholder="Chọn ngôn ngữ"
            />
          </FormField>

          <FormField label="Thể loại/Loại hình" required>
            <SearchableDropdown
              value={genre}
              onChange={setGenre}
              options={GENRES}
              placeholder="Chọn thể loại"
            />
            {errors.genre && (
              <p className="text-sm text-red-400">{errors.genre}</p>
            )}
          </FormField>

          <div className="space-y-2">
            <FormField label="Ngày ghi âm">
              <input
                type="date"
                value={recordingDate}
                onChange={(e) => setRecordingDate(e.target.value)}
                className="w-full px-5 py-3 bg-white text-secondary-900 border border-secondary-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-white/90 cursor-pointer">
              <input
                type="checkbox"
                checked={dateEstimated}
                onChange={(e) => setDateEstimated(e.target.checked)}
                className="w-4 h-4 rounded border-secondary-300 bg-white text-emerald-500 focus:ring-emerald-500"
              />
              Ngày ước tính/không chính xác
            </label>
            {dateEstimated && (
              <TextInput
                value={dateNote}
                onChange={setDateNote}
                placeholder="Ghi chú về ngày tháng (VD: khoảng năm 1990)"
              />
            )}
          </div>

          <FormField label="Địa điểm ghi âm" hint="VD: Đình làng X, Nhà văn hóa Y">
            <TextInput
              value={recordingLocation}
              onChange={setRecordingLocation}
              placeholder="Nhập địa điểm cụ thể"
            />
          </FormField>
        </div>
      </div>

      {/* Cultural Context Section */}
      <CollapsibleSection
        icon={MapPin}
        title="Thông tin bối cảnh văn hóa"
        subtitle="Thông tin về nguồn gốc và bối cảnh biểu diễn"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Thuộc tính dân tộc">
            <SearchableDropdown
              value={ethnicity}
              onChange={setEthnicity}
              options={ETHNICITIES}
              placeholder="Chọn dân tộc"
            />
          </FormField>

          <FormField label="Vùng miền">
            <SearchableDropdown
              value={region}
              onChange={setRegion}
              options={REGIONS}
              placeholder="Chọn vùng miền"
              searchable={false}
            />
          </FormField>

          <FormField label="Tỉnh/Thành phố">
            <SearchableDropdown
              value={province}
              onChange={setProvince}
              options={PROVINCES}
              placeholder="Chọn tỉnh thành"
            />
          </FormField>

          <FormField label="Loại sự kiện">
            <SearchableDropdown
              value={eventType}
              onChange={setEventType}
              options={EVENT_TYPES}
              placeholder="Chọn loại sự kiện"
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Loại hình biểu diễn">
              <div className="flex flex-wrap gap-2">
                {PERFORMANCE_TYPES.map((pt) => (
                  <button
                    key={pt.key}
                    type="button"
                    onClick={() => {
                      setPerformanceType(pt.key);
                      if (pt.key === "acappella") {
                        setInstruments([]);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      performanceType === pt.key
                        ? "bg-emerald-500 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          {requiresInstruments && (
            <div className="md:col-span-2">
              <FormField 
                label="Nhạc cụ sử dụng" 
                required={requiresInstruments}
                hint="Chọn một hoặc nhiều nhạc cụ"
              >
                <MultiSelectTags
                  values={instruments}
                  onChange={setInstruments}
                  options={INSTRUMENTS}
                  placeholder="Tìm và chọn nhạc cụ..."
                />
                {errors.instruments && (
                  <p className="text-sm text-red-400">{errors.instruments}</p>
                )}
              </FormField>
            </div>
          )}

          {allowsLyrics && (
            <div className="md:col-span-2">
              <FormField label="Upload lời bài hát" hint="File .txt hoặc .doc">
                <div className="flex items-center gap-3">
                  <label className="btn-liquid-glass-secondary px-4 py-2 rounded-xl cursor-pointer text-sm">
                    Chọn file
                    <input
                      type="file"
                      accept=".txt,.doc,.docx"
                      onChange={handleLyricsFileChange}
                      className="sr-only"
                    />
                  </label>
                  <span className="text-white/60 text-sm">
                    {lyricsFile ? lyricsFile.name : "Chưa chọn file"}
                  </span>
                </div>
              </FormField>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Additional Notes Section */}
      <CollapsibleSection
        icon={Info}
        title="Ghi chú bổ sung"
        optional
        defaultOpen={false}
      >
        <div className="space-y-4">
          <FormField label="Mô tả nội dung" hint="Lời bài hát, chủ đề, ý nghĩa văn hóa">
            <TextInput
              value={description}
              onChange={setDescription}
              placeholder="Mô tả chi tiết về bản nhạc..."
              multiline
              rows={4}
            />
          </FormField>

          <FormField label="Ghi chú thực địa" hint="Quan sát về bối cảnh, phong cách trình diễn">
            <TextInput
              value={fieldNotes}
              onChange={setFieldNotes}
              placeholder="Những quan sát đặc biệt..."
              multiline
              rows={3}
            />
          </FormField>

          <FormField label="Phiên âm/Bản dịch" hint="Nếu sử dụng ngôn ngữ dân tộc thiểu số">
            <TextInput
              value={transcription}
              onChange={setTranscription}
              placeholder="Phiên âm hoặc bản dịch tiếng Việt..."
              multiline
              rows={3}
            />
          </FormField>
        </div>
      </CollapsibleSection>

      {/* Admin & Copyright Section */}
      <CollapsibleSection
        icon={Shield}
        title="Thông tin quản trị và bản quyền"
        optional
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Người thu thập/Ghi âm">
            <TextInput
              value={collector}
              onChange={setCollector}
              placeholder="Tên người hoặc tổ chức ghi âm"
            />
          </FormField>

          <FormField label="Bản quyền">
            <TextInput
              value={copyright}
              onChange={setCopyright}
              placeholder="Thông tin về quyền sở hữu, giấy phép"
            />
          </FormField>

          <FormField label="Tổ chức lưu trữ">
            <TextInput
              value={archiveOrg}
              onChange={setArchiveOrg}
              placeholder="Nơi bảo quản bản gốc"
            />
          </FormField>

          <FormField label="Mã định danh" hint="ISRC hoặc mã catalog riêng">
            <TextInput
              value={catalogId}
              onChange={setCatalogId}
              placeholder="VD: ISRC-VN-XXX-00-00000"
            />
          </FormField>
        </div>
      </CollapsibleSection>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <p className="text-sm text-white/50">
          <span className="text-red-400">*</span> Trường bắt buộc
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
          >
            Đặt lại
          </button>
          <button
            type="submit"
            disabled={!file || isAnalyzing}
            className="btn-liquid-glass-primary px-8 py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Tải lên
          </button>
        </div>
      </div>
    </form>
  );
}