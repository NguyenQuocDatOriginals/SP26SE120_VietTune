import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, MapPin, Music, Filter, X, Plus } from "lucide-react";
import { createPortal } from "react-dom";
import { SearchFilters, Region, RecordingType, VerificationStatus } from "@/types";

// ===== CONSTANTS =====
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

const PROVINCES = [
  "TP. Hà Nội",
  "TP. Hải Phòng",
  "TP. Huế",
  "TP. Đà Nẵng",
  "TP. Hồ Chí Minh",
  "TP. Cần Thơ",
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
  { key: "acappella", label: "Chỉ giọng hát (Acappella)" },
  { key: "vocal_accompaniment", label: "Giọng hát có nhạc đệm" },
];

const VERIFICATION_STATUS = [
  { key: "VERIFIED", label: "Đã xác minh" },
  { key: "PENDING", label: "Đang chờ" },
  { key: "UNDER_REVIEW", label: "Đang kiểm duyệt" },
];

const INSTRUMENTS = [
  "Đàn bầu (Kinh)",
  "Đàn tranh (Kinh)",
  "Đàn nguyệt (Kinh)",
  "Đàn nhị (Kinh)",
  "Đàn tỳ bà (Kinh)",
  "Sáo ngang (Kinh)",
  "Tiêu (Kinh)",
  "Trống (Kinh)",
  "Khèn (H'Mông)",
  "Đàn t'rưng (Ba Na)",
  "Cồng, chiêng (Gia Rai)",
  "Tính tẩu (Thái)",
  "Đàn đá (Kinh)",
  "Khác",
];

const YEAR_RANGES = [
  { key: "before_1950", label: "Trước 1950" },
  { key: "1950_1975", label: "1950 - 1975" },
  { key: "1975_2000", label: "1975 - 2000" },
  { key: "2000_2010", label: "2000 - 2010" },
  { key: "2010_2020", label: "2010 - 2020" },
  { key: "after_2020", label: "Sau 2020" },
];

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
  placeholder = "Chọn...",
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

// Form Field Wrapper
function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-white/90">
        {label}
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
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="p-2 bg-emerald-500/20 rounded-lg">
        <Icon className="h-5 w-5 text-emerald-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
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
  defaultOpen = true,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
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
            <h3 className="text-base font-semibold text-white">{title}</h3>
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
interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export default function SearchBar({ onSearch, initialFilters = {} }: SearchBarProps) {
  // Search query
  const [query, setQuery] = useState(initialFilters.query || "");

  // Basic filters
  const [genres, setGenres] = useState<string[]>([]);
  const [ethnicity, setEthnicity] = useState("");
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");

  // Advanced filters
  const [eventType, setEventType] = useState("");
  const [performanceType, setPerformanceType] = useState("");
  const [instruments, setInstruments] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (genres.length > 0) count++;
    if (ethnicity) count++;
    if (region) count++;
    if (province) count++;
    if (eventType) count++;
    if (performanceType) count++;
    if (instruments.length > 0) count++;
    if (yearRange) count++;
    if (verificationStatus) count++;
    return count;
  }, [genres, ethnicity, region, province, eventType, performanceType, instruments, yearRange, verificationStatus]);

  // Handle search
  const handleSearch = () => {
    const filters: SearchFilters = {
      query: query.trim() || undefined,
    };

    // Add filters to search
    if (genres.length > 0) {
      filters.recordingTypes = genres as RecordingType[];
    }
    if (region) {
      filters.regions = [region as Region];
    }
    if (verificationStatus) {
      filters.verificationStatus = [verificationStatus as VerificationStatus];
    }

    onSearch(filters);
  };

  // Handle clear all
  const handleClearAll = () => {
    setQuery("");
    setGenres([]);
    setEthnicity("");
    setRegion("");
    setProvince("");
    setEventType("");
    setPerformanceType("");
    setInstruments([]);
    setYearRange("");
    setVerificationStatus("");
    onSearch({});
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Search Input */}
      <div className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-sm">
        <SectionHeader
          icon={Search}
          title="Tìm kiếm bản thu"
          subtitle="Nhập từ khóa để tìm kiếm nhanh"
        />

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tìm kiếm bản thu, nhạc cụ, nghệ nhân,..."
              className="w-full pl-14 pr-5 py-3 bg-white text-secondary-900 placeholder-secondary-400 border border-secondary-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="btn-liquid-glass-primary px-6 py-3 rounded-full font-medium flex items-center gap-2"
          >
            <Search className="h-5 w-5" />
            Tìm kiếm
          </button>
          {(query || activeFilterCount > 0) && (
            <button
              type="button"
              onClick={handleClearAll}
              className="btn-liquid-glass-close w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full"
            >
              <X className="h-5 w-5 text-white" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {activeFilterCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-white/60">
              {activeFilterCount} bộ lọc đang áp dụng
            </span>
          </div>
        )}
      </div>

      {/* Basic Filters */}
      <div className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-sm">
        <SectionHeader
          icon={Music}
          title="Bộ lọc cơ bản"
          subtitle="Lọc theo thể loại và nguồn gốc"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Thể loại/Loại hình">
            <MultiSelectTags
              values={genres}
              onChange={setGenres}
              options={GENRES}
              placeholder="Chọn thể loại..."
            />
          </FormField>

          <FormField label="Dân tộc">
            <SearchableDropdown
              value={ethnicity}
              onChange={setEthnicity}
              options={["Tất cả dân tộc", ...ETHNICITIES]}
              placeholder="Tất cả dân tộc"
            />
          </FormField>

          <FormField label="Vùng miền">
            <SearchableDropdown
              value={region}
              onChange={setRegion}
              options={["Tất cả vùng", ...REGIONS]}
              placeholder="Tất cả vùng"
              searchable={false}
            />
          </FormField>

          <FormField label="Tỉnh/Thành phố">
            <SearchableDropdown
              value={province}
              onChange={setProvince}
              options={["Tất cả tỉnh thành", ...PROVINCES]}
              placeholder="Tất cả tỉnh thành"
            />
          </FormField>
        </div>
      </div>

      {/* Cultural Context Filters */}
      <CollapsibleSection
        icon={MapPin}
        title="Bộ lọc bối cảnh văn hóa"
        subtitle="Lọc theo sự kiện và hình thức biểu diễn"
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Loại sự kiện">
            <SearchableDropdown
              value={eventType}
              onChange={setEventType}
              options={["Tất cả sự kiện", ...EVENT_TYPES]}
              placeholder="Tất cả sự kiện"
            />
          </FormField>

          <FormField label="Loại hình biểu diễn">
            <SearchableDropdown
              value={performanceType}
              onChange={setPerformanceType}
              options={["Tất cả loại hình", ...PERFORMANCE_TYPES.map(p => p.label)]}
              placeholder="Tất cả loại hình"
              searchable={false}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Nhạc cụ" hint="Chọn một hoặc nhiều nhạc cụ">
              <MultiSelectTags
                values={instruments}
                onChange={setInstruments}
                options={INSTRUMENTS}
                placeholder="Tìm và chọn nhạc cụ..."
              />
            </FormField>
          </div>
        </div>
      </CollapsibleSection>

      {/* Time & Status Filters */}
      <CollapsibleSection
        icon={Filter}
        title="Bộ lọc thời gian và trạng thái"
        subtitle="Lọc theo năm ghi âm và trạng thái xác minh"
        defaultOpen={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Năm ghi âm">
            <SearchableDropdown
              value={yearRange}
              onChange={setYearRange}
              options={["Tất cả thời gian", ...YEAR_RANGES.map(y => y.label)]}
              placeholder="Tất cả thời gian"
              searchable={false}
            />
          </FormField>

          <FormField label="Trạng thái xác minh">
            <SearchableDropdown
              value={verificationStatus}
              onChange={setVerificationStatus}
              options={["Tất cả trạng thái", ...VERIFICATION_STATUS.map(s => s.label)]}
              placeholder="Tất cả trạng thái"
              searchable={false}
            />
          </FormField>
        </div>
      </CollapsibleSection>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={handleClearAll}
          className="px-6 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
        >
          Xóa bộ lọc
        </button>
        <button
          type="button"
          onClick={handleSearch}
          className="btn-liquid-glass-primary px-8 py-2.5 rounded-xl font-medium flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Áp dụng bộ lọc
        </button>
      </div>
    </div>
  );
}