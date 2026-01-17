import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Compass, Music2, Globe, Users, Filter, Search, ChevronDown, Play, Disc, MapPin, ArrowRight } from "lucide-react";
import { Recording } from "@/types";
import { recordingService } from "@/services/recordingService";
import { addSpotlightEffect } from "@/utils/spotlight";
import RecordingCard from "@/components/features/RecordingCard";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// ===== CONSTANTS =====
const GENRES = [
  "Tất cả",
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
  "Tất cả",
  "Trung du và miền núi Bắc Bộ",
  "Đồng bằng Bắc Bộ",
  "Bắc Trung Bộ",
  "Nam Trung Bộ",
  "Cao nguyên Trung Bộ",
  "Đông Nam Bộ",
  "Tây Nam Bộ",
];

const ETHNICITIES = [
  "Tất cả",
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

// ===== FILTER BUTTON COMPONENT =====
function FilterButton({
  label,
  value,
  options,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon: React.ElementType;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
          value !== "Tất cả"
            ? "bg-emerald-500 text-white"
            : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
        }`}
      >
        <Icon className="h-4 w-4" />
        {value !== "Tất cả" ? value : label}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-56 backdrop-blur-xl bg-white rounded-2xl shadow-2xl border border-white/40 overflow-hidden z-50"
          style={{
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  value === option
                    ? "bg-emerald-500 text-white font-medium"
                    : "text-secondary-900 hover:bg-emerald-100 hover:text-emerald-900"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
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
          ? "bg-emerald-500/20 border-emerald-500/40"
          : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}
    >
      <div className={`p-2 rounded-lg w-fit mb-3 ${isActive ? "bg-emerald-500/30" : "bg-white/10"}`}>
        <Icon className={`h-5 w-5 ${isActive ? "text-emerald-400" : "text-white/70"}`} />
      </div>
      <h3 className={`font-medium ${isActive ? "text-emerald-300" : "text-white"}`}>{title}</h3>
      <p className="text-sm text-white/50">{count.toLocaleString()} bản thu</p>
    </button>
  );
}

// ===== MAIN COMPONENT =====
export default function ExplorePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Filters
  const [selectedGenre, setSelectedGenre] = useState("Tất cả");
  const [selectedRegion, setSelectedRegion] = useState("Tất cả");
  const [selectedEthnicity, setSelectedEthnicity] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  // Categories data (mock)
  const categories = [
    { title: "Dân ca", count: 3245, icon: Music2 },
    { title: "Ca trù", count: 892, icon: Disc },
    { title: "Quan họ", count: 1567, icon: Users },
    { title: "Chầu văn", count: 734, icon: MapPin },
  ];

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    if (containerRef.current)
      cleanupFunctions.push(addSpotlightEffect(containerRef.current));
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, []);

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
    setSelectedGenre("Tất cả");
    setSelectedRegion("Tất cả");
    setSelectedEthnicity("Tất cả");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedGenre !== "Tất cả" ||
    selectedRegion !== "Tất cả" ||
    selectedEthnicity !== "Tất cả" ||
    searchQuery !== "";

  const features = [
    {
      icon: Music2,
      title: "Đa dạng thể loại",
      description: "Từ dân ca đến nhã nhạc cung đình",
    },
    {
      icon: Globe,
      title: "7 vùng miền",
      description: "Trải dài khắp đất nước Việt Nam",
    },
    {
      icon: Users,
      title: "54 dân tộc",
      description: "Âm nhạc đặc trưng của mỗi dân tộc",
    },
  ];

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl">
              <Compass className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Khám phá bản thu</h1>
          </div>
          <p className="text-white/60 ml-14">
            Khám phá kho tàng âm nhạc truyền thống phong phú của Việt Nam
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3"
            >
              <div className="p-2 bg-emerald-500/10 rounded-lg flex-shrink-0">
                <feature.icon className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">{feature.title}</h3>
                <p className="text-white/50 text-xs mt-0.5">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div
          ref={containerRef}
          className="spotlight-container backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          {/* Search & Filters Section */}
          <div className="border border-white/10 rounded-2xl p-6 bg-white/5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Filter className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Bộ lọc nhanh</h2>
                <p className="text-sm text-white/60">Lọc theo thể loại, vùng miền và dân tộc</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bản thu, nghệ nhân, nhạc cụ..."
                className="w-full pl-14 pr-5 py-3 bg-white text-secondary-900 placeholder-secondary-400 border border-secondary-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <FilterButton
                label="Thể loại"
                value={selectedGenre}
                options={GENRES}
                onChange={setSelectedGenre}
                icon={Music2}
              />
              <FilterButton
                label="Vùng miền"
                value={selectedRegion}
                options={REGIONS}
                onChange={setSelectedRegion}
                icon={MapPin}
              />
              <FilterButton
                label="Dân tộc"
                value={selectedEthnicity}
                options={ETHNICITIES}
                onChange={setSelectedEthnicity}
                icon={Users}
              />

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2.5 text-sm text-white/70 hover:text-white transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}

              <Link
                to="/search"
                className="ml-auto px-4 py-2.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                Tìm kiếm nâng cao
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Disc className="h-4 w-4 text-emerald-400" />
              Thể loại phổ biến
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
          <div className="flex items-center justify-between mb-6 pt-6 border-t border-white/10">
            <div>
              <h2 className="text-xl font-semibold text-white">Tất cả bản thu</h2>
              {!loading && (
                <p className="text-white/60 text-sm mt-1">
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
            <div className="p-12 text-center bg-white/5 rounded-xl border border-white/10">
              <div className="p-4 bg-white/10 rounded-full w-fit mx-auto mb-4">
                <Search className="h-8 w-8 text-white/50" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                Không tìm thấy bản thu
              </h3>
              <p className="text-white/60 max-w-md mx-auto">
                Thử thay đổi bộ lọc hoặc từ khóa để tìm kiếm kết quả phù hợp hơn
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
        <div className="mt-8 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Compass className="h-4 w-4 text-emerald-400" />
            Khám phá thêm
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/search"
              className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Search className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium group-hover:text-emerald-300 transition-colors">
                    Tìm kiếm nâng cao
                  </h4>
                  <p className="text-white/50 text-sm">
                    Lọc chi tiết theo nhạc cụ, sự kiện, năm ghi âm
                  </p>
                </div>
              </div>
            </Link>
            <Link
              to="/upload"
              className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Play className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium group-hover:text-emerald-300 transition-colors">
                    Đóng góp bản thu
                  </h4>
                  <p className="text-white/50 text-sm">
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