import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Compass, Music2, Globe, Users, Filter, Search, ChevronDown, Play, Disc, MapPin, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { Recording } from "@/types";
import { recordingService } from "@/services/recordingService";
import RecordingCard from "@/components/features/RecordingCard";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// ===== CONSTANTS =====
const GENRES = [
  "Tất cả thể loại",
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
  "Khác",
];

const REGIONS = [
  "Tất cả khu vực",
  "Trung du và miền núi Bắc Bộ",
  "Đồng bằng Bắc Bộ",
  "Bắc Trung Bộ",
  "Nam Trung Bộ",
  "Cao nguyên Trung Bộ",
  "Đông Nam Bộ",
  "Tây Nam Bộ",
];

const ETHNICITIES = [
  "Tất cả dân tộc",
  "Kinh",
  "Tày",
  "Thái",
  "Mường",
  "Khmer",
  "H'Mông",
  "Nùng",
  "Dao",
  "Gia Rai",
  "Ê Đê",
  "Ba Na",
  "Chăm",
  "Khác",
];

// Mapping genre to typical ethnicity (same as UploadMusic)
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

// Check if click is on scrollbar
const isClickOnScrollbar = (event: MouseEvent): boolean => {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0 && event.clientX >= document.documentElement.clientWidth) {
    return true;
  }
  return false;
};

// ===== SEARCHABLE DROPDOWN COMPONENT =====
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
      if (isClickOnScrollbar(event)) return;
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
        className={`w-full px-5 py-3 pr-10 bg-white text-neutral-900 border border-neutral-400 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-left flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className={value ? "text-neutral-900" : "text-neutral-400"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-neutral-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen &&
        menuRect &&
        createPortal(
          <div
            ref={(el) => (menuRef.current = el)}
            className="bg-white rounded-2xl shadow-xl border border-neutral-300 overflow-hidden"
            style={{
              position: "absolute",
              left: Math.max(8, menuRect.left + (window.scrollX ?? 0)),
              top: menuRect.bottom + (window.scrollY ?? 0) + 8,
              width: menuRect.width,
              zIndex: 40,
            }}
          >
            {searchable && (
              <div className="p-3 border-b border-neutral-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 text-neutral-900 placeholder-neutral-500 border border-neutral-400 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    autoFocus
                  />
                </div>
              </div>
            )}
            <div
              className="max-h-60 overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#dc2626 rgba(255, 255, 255, 0.3)",
              }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-5 py-3 text-neutral-400 text-sm text-center">
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
                        ? "bg-primary-600 text-neutral-800 font-medium"
                        : "text-neutral-900 hover:bg-primary-100 hover:text-primary-700"
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

// ===== CATEGORY CARD COMPONENT =====
function CategoryCard({
  title,
  count,
  icon: Icon,
  onClick,
  isActive,
}: {
  title: string;
  count: number;
  icon: React.ElementType;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all text-left ${
        isActive
          ? "bg-primary-50 border-primary-300"
          : "bg-white border-neutral-200 hover:bg-neutral-50"
      }`}
    >
      <div className={`p-2 rounded-lg w-fit mb-3 ${isActive ? "bg-primary-600/20" : "bg-neutral-100"}`}>
        <Icon className={`h-5 w-5 ${isActive ? "text-primary-600" : "text-neutral-500"}`} />
      </div>
      <h3 className={`font-medium ${isActive ? "text-primary-700" : "text-neutral-800"}`}>{title}</h3>
      <p className="text-sm text-neutral-500">{count.toLocaleString()} bản thu</p>
    </button>
  );
}

// ===== MAIN COMPONENT =====
export default function ExplorePage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Filters
  const [selectedGenre, setSelectedGenre] = useState("Tất cả thể loại");
  const [selectedRegion, setSelectedRegion] = useState("Tất cả khu vực");
  const [selectedEthnicity, setSelectedEthnicity] = useState("Tất cả dân tộc");
  const [searchQuery, setSearchQuery] = useState("");

  // Categories data (mock)
  const categories = [
    { title: "Dân ca", count: 3245, icon: Music2 },
    { title: "Ca trù", count: 892, icon: Disc },
    { title: "Quan họ", count: 1567, icon: Users },
    { title: "Chầu văn", count: 734, icon: MapPin },
  ];

  // Check for genre-ethnicity mismatch
  const genreEthnicityWarning = useMemo(() => {
    if (selectedGenre && selectedGenre !== "Tất cả thể loại" && 
        selectedEthnicity && selectedEthnicity !== "Tất cả dân tộc") {
      const expectedEthnicities = GENRE_ETHNICITY_MAP[selectedGenre];
      if (expectedEthnicities && !expectedEthnicities.includes(selectedEthnicity)) {
        return `Lưu ý: Thể loại "${selectedGenre}" thường là đặc trưng của người ${expectedEthnicities.join(", ")}. Tuy nhiên, giao lưu văn hóa giữa các dân tộc là điều bình thường.`;
      }
    }
    return null;
  }, [selectedGenre, selectedEthnicity]);

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await recordingService.getRecordings(currentPage, 12);
      setRecordings(response.items);
      setTotalPages(response.totalPages);
      setTotalResults(response.total);
    } catch (error) {
      console.error("Error fetching recordings:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  const handleClearFilters = () => {
    setSelectedGenre("Tất cả thể loại");
    setSelectedRegion("Tất cả khu vực");
    setSelectedEthnicity("Tất cả dân tộc");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedGenre !== "Tất cả thể loại" ||
    selectedRegion !== "Tất cả khu vực" ||
    selectedEthnicity !== "Tất cả dân tộc" ||
    searchQuery !== "";

  const features = [
    {
      icon: Music2,
      title: "Đa dạng thể loại",
      description: "Từ dân ca đến nhã nhạc cung đình",
    },
    {
      icon: Globe,
      title: "7 khu vực",
      description: "Trải dài khắp đất nước Việt Nam",
    },
    {
      icon: Users,
      title: "54 dân tộc",
      description: "Âm nhạc đặc trưng của mỗi dân tộc",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">
            Khám phá bản thu
          </h1>
          <p className="text-neutral-600 leading-relaxed">
            Duyệt qua kho tàng âm nhạc truyền thống phong phú từ khắp mọi miền đất nước
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-md"
            >
              <div className="p-3 bg-primary-600/20 rounded-xl w-fit mb-4">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-neutral-800 font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-8 mb-8">
          {/* Search & Filters Section */}
          <div className="border border-neutral-200 rounded-2xl p-8 bg-neutral-50 mb-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="p-2 bg-primary-600/20 rounded-lg">
                <Filter className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-800">Bộ lọc nhanh</h2>
                <p className="text-sm text-neutral-800/70 mt-1">Lọc theo thể loại, khu vực và dân tộc</p>
              </div>
            </div>

            {/* Genre-Ethnicity Warning */}
            {genreEthnicityWarning && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-300 rounded-2xl">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-700 text-sm leading-relaxed">{genreEthnicityWarning}</p>
              </div>
            )}

            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bản thu, nghệ nhân, nhạc cụ,..."
                className="w-full pl-14 pr-5 py-3 bg-white text-neutral-900 placeholder-neutral-500 border border-neutral-400 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-800">Thể loại</label>
                <SearchableDropdown
                  value={selectedGenre}
                  onChange={setSelectedGenre}
                  options={GENRES}
                  placeholder="Chọn thể loại"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-800">Khu vực</label>
                <SearchableDropdown
                  value={selectedRegion}
                  onChange={setSelectedRegion}
                  options={REGIONS}
                  placeholder="Chọn khu vực"
                  searchable={false}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-800">Dân tộc</label>
                <SearchableDropdown
                  value={selectedEthnicity}
                  onChange={setSelectedEthnicity}
                  options={ETHNICITIES}
                  placeholder="Chọn dân tộc"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-xl transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Popular Categories */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-primary-600/20 rounded-lg">
                <Disc className="h-5 w-5 text-primary-600" />
              </div>
              Thể loại phổ biến
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <CategoryCard
                  key={index}
                  title={category.title}
                  count={category.count}
                  icon={category.icon}
                  onClick={() => setSelectedGenre(category.title)}
                  isActive={selectedGenre === category.title}
                />
              ))}
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6 pt-8 border-t border-neutral-200">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800">Tất cả bản thu</h2>
              {!loading && (
                <p className="text-neutral-500 mt-1">
                  Hiển thị {recordings.length} trong số {totalResults.toLocaleString()} bản thu
                </p>
              )}
            </div>
          </div>

          {/* Results Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : recordings.length === 0 ? (
            <div className="p-12 text-center bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="p-4 bg-primary-600/20 rounded-2xl w-fit mx-auto mb-4">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                Không tìm thấy bản thu
              </h3>
              <p className="text-neutral-600 mx-auto leading-relaxed">
                Thử thay đổi bộ lọc hoặc từ khóa để tìm kiếm kết quả phù hợp hơn
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {recordings.map((recording) => (
                  <RecordingCard key={recording.id} recording={recording} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>

        {/* Explore More Section */}
        <div className="bg-secondary-50 border border-neutral-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6 text-neutral-800 flex items-center gap-3">
            <div className="p-2 bg-primary-600/20 rounded-lg">
              <Compass className="h-5 w-5 text-primary-600" />
            </div>
            Khám phá thêm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/search"
              className="p-6 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-600/20 rounded-lg">
                  <Search className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="text-neutral-800 font-semibold text-lg group-hover:text-primary-600 transition-colors">
                    Tìm kiếm bản thu
                  </h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Lọc chi tiết theo nhạc cụ, sự kiện, năm ghi âm
                  </p>
                </div>
              </div>
            </Link>
            <Link
              to="/upload"
              className="p-6 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-600/20 rounded-lg">
                  <Play className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="text-neutral-800 font-semibold text-lg group-hover:text-primary-600 transition-colors">
                    Đóng góp bản thu
                  </h4>
                  <p className="text-neutral-600 leading-relaxed">
                    Chia sẻ bản thu âm nhạc truyền thống của bạn
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}