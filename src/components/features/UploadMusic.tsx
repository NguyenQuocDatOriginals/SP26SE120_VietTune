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
  "Khác",
];

const ETHNICITIES = [
  "Kinh", "Tày", "Thái", "Mường", "Khmer", "H'Mông", "Nùng", "Hoa", "Dao", "Gia Rai",
  "Ê Đê", "Ba Na", "Xơ Đăng", "Sán Chay", "Cơ Ho", "Chăm", "Sán Dìu", "Hrê", "Mnông", "Ra Glai",
  "Giáy", "Stră", "Bru-Vân Kiều", "Cơ Tu", "Giẻ Triêng", "Tà Ôi", "Mạ", "Khơ Mú", "Co", "Chơ Ro",
  "Hà Nhì", "Xinh Mun", "Chu Ru", "Lào", "La Chí", "Kháng", "Phù Lá", "La Hủ", "La Ha", "Pà Thẻn",
  "Lự", "Ngái", "Chứt", "Lô Lô", "Mảng", "Cờ Lao", "Bố Y", "Cống", "Si La", "Pu Péo",
  "Rơ Măm", "Brâu", "Ơ Đu", "Khác",
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

const PROVINCES = [
  "TP. Hà Nội", "TP. Hải Phòng", "TP. Huế", "TP. Đà Nẵng", "TP. Hồ Chí Minh", "TP. Cần Thơ",
  "An Giang", "Bắc Ninh", "Cà Mau", "Cao Bằng", "Điện Biên", "Đắk Lắk", "Đồng Nai", "Đồng Tháp",
  "Gia Lai", "Hà Tĩnh", "Hưng Yên", "Khánh Hòa", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai",
  "Nghệ An", "Ninh Bình", "Phú Thọ", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sơn La", "Tây Ninh",
  "Thái Nguyên", "Thanh Hóa", "Tuyên Quang", "Vĩnh Long",
];

const EVENT_TYPES = [
  "Đám cưới", "Đám tang", "Lễ hội đình", "Lễ hội chùa", "Tết Nguyên đán", "Hội xuân",
  "Lễ cầu mùa", "Lễ cúng tổ tiên", "Lễ cấp sắc", "Lễ hội đâm trâu", "Lễ hội cồng chiêng",
  "Sinh hoạt cộng đồng", "Biểu diễn nghệ thuật", "Ghi âm studio", "Ghi âm thực địa", "Khác",
];

const PERFORMANCE_TYPES = [
  { key: "instrumental", label: "Chỉ nhạc cụ (Instrumental)" },
  { key: "acappella", label: "Chỉ giọng hát không đệm (Acappella)" },
  { key: "vocal_accompaniment", label: "Giọng hát có nhạc đệm (Vocal with accompaniment)" },
];

const INSTRUMENTS = [
  "Alal (Ba Na)", "Aráp (Ba Na)", "Aráp (Ca Dong)", "Aráp (Gia Rai)", "Aráp (Rơ Năm)", "Aráp (Stră)",
  "Biên khánh (Kinh)", "Bro (Ba Na)", "Bro (Gia Rai)", "Bro (Giẻ Triêng)", "Bro (Xơ Đăng)", "Bẳng bu (Thái)",
  "Chul (Ba Na)", "Chul (Gia Rai)", "Chênh Kial (Ba Na)", "Cò ke (Mường)", "Cồng, chiêng (Ba Na)",
  "Cồng, chiêng (Gia Rai)", "Cồng, chiêng (Giẻ Triêng)", "Cồng, chiêng (Hrê)", "Cồng, chiêng (Ê Đê)",
  "Dàn nhạc ngũ âm (Khmer)", "Goong (Ba Na)", "Goong (Gia Rai)", "Goong (Giẻ Triêng)", "Goong đe (Ba Na)",
  "Hơgơr (Ê Đê)", "Hơgơr cân (Mnâm)", "Hơgơr cân (Rơ Năm)", "Hơgơr prong (Gia Rai)", "Hơgơr tuôn (Hà Lang)",
  "Hơgơr tăk (Ba Na)", "Khinh khung (Ba Na)", "Khinh khung (Gia Rai)", "Khèn (H'Mông)", "Khèn (Ta Ôi)",
  "Khèn (Ê Đê)", "Khên (Vân Kiều)", "Knăh ring (Ba Na)", "Knăh ring (Gia Rai)", "K'lông put (Gia Rai)",
  "K'ny (Ba Na)", "K'ny (Gia Rai)", "K'ny (Rơ Ngao)", "K'ny (Xơ Đăng)", "Kèn bầu (Chăm)", "Kèn bầu (Kinh)",
  "Kèn bầu (Thái)", "Kềnh (H'Mông)", "M'linh (Dao)", "M'linh (Mường)", "M'nhum (Gia Rai)", "Mõ (Kinh)",
  "Phách (Kinh)", "Pí cổng (Thái)", "Pí lè (Thái)", "Pí lè (Tày)", "Pí một lao (Kháng)", "Pí một lao (Khơ Mú)",
  "Pí một lao (La Ha)", "Pí một lao (Thái)", "Pí pặp (Thái)", "Pí phướng (Thái)", "Pí đôi (Thái)",
  "Púa (H'Mông)", "Púa (Lô Lô)", "Qeej (H'Mông)", "Rang leh (Ca Dong)", "Rang leh (Stră)", "Rang rai (Ba Na)",
  "Rang rai (Gia Rai)", "Song lang (Kinh)", "Sáo ngang (Kinh)", "Sênh tiền (Kinh)", "T'rum (Gia Rai)",
  "Ta in (Hà Nhì)", "Ta lư (Vân Kiều)", "Ta pòl (Ba Na)", "Ta pòl (Brâu)", "Ta pòl (Gia Rai)",
  "Ta pòl (Rơ Năm)", "Tam thập lục (Kinh)", "Teh ding (Gia Rai)", "Tiêu (Kinh)", "Tol alao (Ca Dong)",
  "Tông đing (Ba Na)", "Tông đing (Ca Dong)", "Tơ nốt (Ba Na)", "Trống bộc (Kinh)", "Trống cái (Kinh)",
  "Trống chầu (Kinh)", "Trống cơm (Kinh)", "Trống dẹt (Kinh)", "Trống khẩu (Kinh)", "Trống lắng (Kinh)",
  "Trống mảnh (Kinh)", "Trống quần (Kinh)", "Trống đế (Kinh)", "Trống đồng (Kinh)", "Tính tẩu (Thái)",
  "Tính tẩu (Tày)", "Vang (Gia Rai)", "Đinh Duar (Giẻ Triêng)", "Đinh Khén (Xơ Đăng)", "Đinh tuk (Ba Na)",
  "Đao đao (Khơ Mú)", "Đuk đik (Giẻ Triêng)", "Đàn bầu (Kinh)", "Đàn môi (H'Mông)", "Đàn nguyệt (Kinh)",
  "Đàn nhị (Chăm)", "Đàn nhị (Dao)", "Đàn nhị (Giáy)", "Đàn nhị (Kinh)", "Đàn nhị (Nùng)", "Đàn nhị (Tày)",
  "Đàn t'rưng (Ba Na)", "Đàn t'rưng (Gia Rai)", "Đàn tam (Kinh)", "Đàn tranh (Kinh)", "Đàn tứ (Kinh)",
  "Đàn tỳ bà (Kinh)", "Đàn đá (Kinh)", "Đàn đáy (Kinh)",
];

// Mapping genre to typical ethnicity
const GENRE_ETHNICITY_MAP: Record<string, string[]> = {
  "Ca trù": ["Kinh"],
  "Quan họ": ["Kinh"],
  "Chầu văn": ["Kinh"],
  "Nhã nhạc": ["Kinh"],
  "Ca Huế": ["Kinh"],
  "Đờn ca tài tử": ["Kinh"],
  "Hát bội": ["Kinh"],
  "Cải lương": ["Kinh"],
  "Tuồng": ["Kinh"],
  "Chèo": ["Kinh"],
  "Hát xẩm": ["Kinh"],
  "Hát then": ["Tày", "Nùng"],
  "Khèn": ["H'Mông"],
  "Cồng chiêng": ["Ba Na", "Gia Rai", "Ê Đê", "Xơ Đăng", "Giẻ Triêng"],
};

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

function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày/tháng/năm",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);

  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const date = new Date(value);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const selectedDate = value ? new Date(value) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(target);
      const clickedOutsideMenu =
        menuRef.current && !menuRef.current.contains(target);
      if (clickedOutsideDropdown && (menuRef.current ? clickedOutsideMenu : true)) {
        setIsOpen(false);
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const days = getDaysInMonth(viewDate);
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const handleDateClick = (day: number) => {
    const year = viewDate.getFullYear();
    const month = (viewDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const isoString = `${year}-${month}-${dayStr}`;
    onChange(isoString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

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
          {value ? formatDisplayDate(value) : placeholder}
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
              width: Math.max(320, menuRect.width),
              zIndex: 200000,
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="p-3 border-b border-secondary-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 hover:bg-emerald-100 rounded-full transition-colors"
              >
                <ChevronDown className="h-4 w-4 text-secondary-700 rotate-90" />
              </button>
              <span className="text-sm font-medium text-secondary-900">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 hover:bg-emerald-100 rounded-full transition-colors"
              >
                <ChevronDown className="h-4 w-4 text-secondary-700 -rotate-90" />
              </button>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-secondary-500 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} />;
                  }

                  const isSelected =
                    selectedDate &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === viewDate.getMonth() &&
                    selectedDate.getFullYear() === viewDate.getFullYear();

                  const today = new Date();
                  const isToday =
                    today.getDate() === day &&
                    today.getMonth() === viewDate.getMonth() &&
                    today.getFullYear() === viewDate.getFullYear();

                  const dayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                  const isFuture = dayDate > today;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => !isFuture && handleDateClick(day)}
                      disabled={isFuture}
                      className={`aspect-square rounded-lg text-sm transition-colors ${
                        isFuture
                          ? "text-secondary-300 cursor-not-allowed"
                          : isSelected
                          ? "bg-emerald-500 text-white font-medium"
                          : isToday
                          ? "bg-emerald-100 text-emerald-900 font-medium"
                          : "text-secondary-900 hover:bg-emerald-50"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

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
      <label className="block text-sm font-medium text-white">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-white/60">{hint}</p>}
    </div>
  );
}

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
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2 bg-emerald-500/20 rounded-lg">
        <Icon className="h-5 w-5 text-emerald-400" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          {title}
          {optional && (
            <span className="text-xs font-normal text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
              Tùy chọn
            </span>
          )}
        </h3>
        {subtitle && <p className="text-sm text-white/70 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

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
        className="w-full p-6 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Icon className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              {title}
              {optional && (
                <span className="text-xs font-normal text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                  Tùy chọn
                </span>
              )}
            </h3>
            {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-white/70 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="p-6 pt-2 space-y-4">{children}</div>}
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function UploadMusic() {
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

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [artistUnknown, setArtistUnknown] = useState(false);
  const [composer, setComposer] = useState("");
  const [composerUnknown, setComposerUnknown] = useState(false);
  const [language, setLanguage] = useState("");
  const [noLanguage, setNoLanguage] = useState(false);
  const [customLanguage, setCustomLanguage] = useState("");
  const [genre, setGenre] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [recordingDate, setRecordingDate] = useState("");
  const [dateEstimated, setDateEstimated] = useState(false);
  const [dateNote, setDateNote] = useState("");
  const [recordingLocation, setRecordingLocation] = useState("");

  const [ethnicity, setEthnicity] = useState("");
  const [customEthnicity, setCustomEthnicity] = useState("");
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [eventType, setEventType] = useState("");
  const [customEventType, setCustomEventType] = useState("");
  const [performanceType, setPerformanceType] = useState("");
  const [instruments, setInstruments] = useState<string[]>([]);

  const [description, setDescription] = useState("");
  const [fieldNotes, setFieldNotes] = useState("");
  const [transcription, setTranscription] = useState("");
  const [lyricsFile, setLyricsFile] = useState<File | null>(null);

  const [collector, setCollector] = useState("");
  const [copyright, setCopyright] = useState("");
  const [archiveOrg, setArchiveOrg] = useState("");
  const [catalogId, setCatalogId] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiresInstruments = performanceType === "instrumental" || performanceType === "vocal_accompaniment";
  const allowsLyrics = performanceType === "acappella" || performanceType === "vocal_accompaniment";

  // Check for genre-ethnicity mismatch
  const genreEthnicityWarning = useMemo(() => {
    if (!genre || !ethnicity) return null;

    const expectedEthnicities = GENRE_ETHNICITY_MAP[genre];
    if (expectedEthnicities && !expectedEthnicities.includes(ethnicity)) {
      return `Lưu ý: Thể loại "${genre}" thường là đặc trưng của người ${expectedEthnicities.join(", ")}. Tuy nhiên, giao lưu văn hóa giữa các dân tộc là điều bình thường.`;
    }
    return null;
  }, [genre, ethnicity]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Kiểm tra kích thước file (giới hạn 50MB như đã ghi trong UI)
    const maxSizeInBytes = 50 * 1024 * 1024; // 50MB
    if (selected.size > maxSizeInBytes) {
      setErrors((prev) => ({ ...prev, file: "File quá lớn. Vui lòng chọn file nhỏ hơn 50MB" }));
      setFile(null);
      setAudioInfo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const mime = selected.type || inferMimeFromName(selected.name);
    if (!SUPPORTED_FORMATS.includes(mime)) {
      setErrors((prev) => ({ ...prev, file: "Chỉ hỗ trợ file MP3, WAV hoặc FLAC" }));
      setFile(null);
      setAudioInfo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleLyricsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setLyricsFile(selected);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!file) newErrors.file = "Vui lòng chọn file âm thanh";
    if (!title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";
    if (!artistUnknown && !artist.trim()) {
      newErrors.artist = "Vui lòng nhập tên nghệ sĩ hoặc chọn 'Không rõ'";
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      setSubmitStatus("error");
      setSubmitMessage("Vui lòng điền đầy đủ thông tin bắt buộc");
      setTimeout(() => {
        setSubmitStatus("idle");
        setSubmitMessage("");
      }, 5000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

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
        artist: artistUnknown ? "Không rõ nghệ sĩ" : artist,
        composer: composerUnknown ? "Dân gian/Không rõ tác giả" : composer,
        language: language === "Khác" ? customLanguage : language,
        genre: genre === "Khác" ? customGenre : genre,
        recordingDate,
        dateEstimated,
        dateNote,
        recordingLocation,
      },
      culturalContext: {
        ethnicity: ethnicity === "Khác" ? customEthnicity : ethnicity,
        region,
        province,
        eventType: eventType === "Khác" ? customEventType : eventType,
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

    const reader = new FileReader();
    reader.onload = function (ev) {
      const audioData = ev.target?.result;
      if (!audioData) {
        setIsSubmitting(false);
        setSubmitStatus("error");
        setSubmitMessage("Lỗi khi đọc file. Vui lòng thử lại.");
        return;
      }

      const newRecording = {
        ...formData,
        audioData,
      };

      try {
        // Lấy danh sách recordings hiện tại
        let recordings = [];
        try {
          const stored = localStorage.getItem("localRecordings");
          recordings = stored ? JSON.parse(stored) : [];
        } catch (parseError) {
          console.warn("Không thể đọc dữ liệu cũ, sẽ tạo mới:", parseError);
          recordings = [];
        }

        // Thêm recording mới vào đầu danh sách
        recordings.unshift(newRecording);

        // Giữ tối đa 5 bản ghi (giảm từ 10 để tránh vượt quá giới hạn localStorage)
        if (recordings.length > 5) {
          recordings = recordings.slice(0, 5);
        }

        // Thử lưu vào localStorage
        const dataToSave = JSON.stringify(recordings);

        // Kiểm tra kích thước (localStorage limit thường là 5-10MB)
        const sizeInMB = new Blob([dataToSave]).size / (1024 * 1024);

        if (sizeInMB > 8) {
          // Nếu quá lớn, chỉ giữ lại 2 bản ghi mới nhất
          const reducedRecordings = recordings.slice(0, 2);
          localStorage.setItem("localRecordings", JSON.stringify(reducedRecordings));

          setSubmitStatus("success");
          setSubmitMessage(`Đã đóng góp bản thu thành công: ${title} (Đã tự động xóa các bản ghi cũ do giới hạn bộ nhớ)`);
        } else {
          localStorage.setItem("localRecordings", dataToSave);

          setSubmitStatus("success");
          setSubmitMessage(`Đã đóng góp bản thu thành công: ${title}`);
        }

        setTimeout(() => {
          resetForm();
          setIsSubmitting(false);
        }, 3000);
      } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error);
        setIsSubmitting(false);
        setSubmitStatus("error");

        // Cung cấp thông báo lỗi chi tiết hơn
        if (error instanceof Error) {
          if (error.name === "QuotaExceededError" || error.message.includes("quota")) {
            setSubmitMessage("Dung lượng lưu trữ đã đầy. Vui lòng xóa một số bản ghi cũ hoặc sử dụng file nhỏ hơn.");
          } else {
            setSubmitMessage(`Lỗi: ${error.message}. Vui lòng thử lại hoặc sử dụng file nhỏ hơn.`);
          }
        } else {
          setSubmitMessage("Lỗi không xác định khi lưu dữ liệu. Vui lòng thử lại với file nhỏ hơn.");
        }
      }
    };

    reader.onerror = () => {
      setIsSubmitting(false);
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
    setArtistUnknown(false);
    setComposer("");
    setComposerUnknown(false);
    setLanguage("");
    setNoLanguage(false);
    setCustomLanguage("");
    setGenre("");
    setCustomGenre("");
    setRecordingDate("");
    setDateEstimated(false);
    setDateNote("");
    setRecordingLocation("");
    setEthnicity("");
    setCustomEthnicity("");
    setRegion("");
    setProvince("");
    setEventType("");
    setCustomEventType("");
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
    setIsSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Required Fields Note */}
      <div className="flex items-center gap-2 text-sm text-white/60">
        <span className="text-red-400">*</span>
        <span>Trường bắt buộc</span>
      </div>

      {submitStatus === "success" && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl">
          <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-200">{submitMessage}</p>
        </div>
      )}
      
      {submitStatus === "error" && (
        <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200">{submitMessage}</p>
        </div>
      )}

      <div className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm">
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
                <div className="p-3 bg-emerald-500/20 rounded-2xl w-fit mx-auto">
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
                  className="text-sm text-white/60 hover:text-red-400 transition-colors"
                >
                  Chọn file khác
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/20 rounded-2xl w-fit mx-auto">
                  <Upload className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white">Kéo thả file hoặc click để chọn</p>
                  <p className="text-sm text-white/60 mt-1">MP3, WAV, FLAC - Tối đa 50MB</p>
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

      <div className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm">
        <SectionHeader
          icon={Music}
          title="Thông tin mô tả cơ bản"
          subtitle="Thông tin chính về bản nhạc"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="space-y-2">
            <FormField label="Nghệ sĩ/Người biểu diễn" required={!artistUnknown}>
              <TextInput
                value={artist}
                onChange={setArtist}
                placeholder="Tên người hát hoặc chơi nhạc cụ"
                required={!artistUnknown}
                disabled={artistUnknown}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input
                type="checkbox"
                checked={artistUnknown}
                onChange={(e) => {
                  setArtistUnknown(e.target.checked);
                  if (e.target.checked) setArtist("");
                }}
                className="w-4 h-4 rounded border-secondary-300 bg-white text-emerald-500 focus:ring-emerald-500"
              />
              Không rõ
            </label>
            {errors.artist && (
              <p className="text-sm text-red-400">{errors.artist}</p>
            )}
          </div>

          <div className="space-y-2">
            <FormField label="Nhạc sĩ/Tác giả" required={!composerUnknown}>
              <TextInput
                value={composer}
                onChange={setComposer}
                placeholder="Tên người sáng tác"
                disabled={composerUnknown}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
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

          <div className="space-y-2">
            <FormField label="Ngôn ngữ">
              <SearchableDropdown
                value={language}
                onChange={(val) => {
                  setLanguage(val);
                  if (val !== "Khác") setCustomLanguage("");
                }}
                options={LANGUAGES}
                placeholder="Chọn ngôn ngữ"
                disabled={noLanguage}
              />
            </FormField>
            {language === "Khác" && !noLanguage && (
              <TextInput
                value={customLanguage}
                onChange={setCustomLanguage}
                placeholder="Nhập tên ngôn ngữ khác..."
              />
            )}
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input
                type="checkbox"
                checked={noLanguage}
                onChange={(e) => {
                  setNoLanguage(e.target.checked);
                  if (e.target.checked) {
                    setLanguage("");
                    setCustomLanguage("");
                  }
                }}
                className="w-4 h-4 rounded border-secondary-300 bg-white text-emerald-500 focus:ring-emerald-500"
              />
              Không có ngôn ngữ
            </label>
          </div>

          <div className="space-y-2">
            <FormField label="Thể loại/Loại hình" required>
              <SearchableDropdown
                value={genre}
                onChange={(val) => {
                  setGenre(val);
                  if (val !== "Khác") setCustomGenre("");
                }}
                options={GENRES}
                placeholder="Chọn thể loại"
              />
              {errors.genre && (
                <p className="text-sm text-red-400">{errors.genre}</p>
              )}
            </FormField>
            {genre === "Khác" && (
              <TextInput
                value={customGenre}
                onChange={setCustomGenre}
                placeholder="Nhập tên thể loại khác..."
              />
            )}
          </div>

          <div className="space-y-2">
            <FormField label="Ngày ghi âm">
              <DatePicker
                value={recordingDate}
                onChange={setRecordingDate}
                placeholder="Chọn ngày/tháng/năm"
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
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
                placeholder="Ghi chú về ngày tháng (Ví dụ: khoảng năm 1990)"
              />
            )}
          </div>

          <FormField label="Địa điểm ghi âm" hint="Ví dụ: Đình làng X, Nhà văn hóa Y">
            <TextInput
              value={recordingLocation}
              onChange={setRecordingLocation}
              placeholder="Nhập địa điểm cụ thể"
            />
          </FormField>
        </div>
      </div>

      <CollapsibleSection
        icon={MapPin}
        title="Thông tin bối cảnh văn hóa"
        subtitle="Thông tin về nguồn gốc và bối cảnh biểu diễn"
      >
        {/* Genre-Ethnicity Warning */}
        {genreEthnicityWarning && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-yellow-500/20 border border-yellow-500/40 rounded-2xl">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-200 text-sm leading-relaxed">{genreEthnicityWarning}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <FormField label="Thuộc tính dân tộc">
              <SearchableDropdown
                value={ethnicity}
                onChange={(val) => {
                  setEthnicity(val);
                  if (val !== "Khác") setCustomEthnicity("");
                }}
                options={ETHNICITIES}
                placeholder="Chọn dân tộc"
              />
            </FormField>
            {ethnicity === "Khác" && (
              <TextInput
                value={customEthnicity}
                onChange={setCustomEthnicity}
                placeholder="Nhập tên dân tộc khác..."
              />
            )}
          </div>

          <FormField label="Khu vực">
            <SearchableDropdown
              value={region}
              onChange={setRegion}
              options={REGIONS}
              placeholder="Chọn khu vực"
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

          <div className="space-y-2">
            <FormField label="Loại sự kiện">
              <SearchableDropdown
                value={eventType}
                onChange={(val) => {
                  setEventType(val);
                  if (val !== "Khác") setCustomEventType("");
                }}
                options={EVENT_TYPES}
                placeholder="Chọn loại sự kiện"
              />
            </FormField>
            {eventType === "Khác" && (
              <TextInput
                value={customEventType}
                onChange={setCustomEventType}
                placeholder="Nhập loại sự kiện khác..."
              />
            )}
          </div>

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
                        : "bg-white/10 text-white/70 hover:bg-white/15 border-0"
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
              <FormField label="Tải lên lời bài hát (nếu có)" hint="File .txt hoặc .docx">
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

      <CollapsibleSection
        icon={Shield}
        title="Thông tin quản trị và bản quyền"
        optional
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Đặt lại
          </button>
          <button
            type="submit"
            disabled={!file || isAnalyzing || isSubmitting}
            className="btn-liquid-glass-primary px-8 py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Đóng góp
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}