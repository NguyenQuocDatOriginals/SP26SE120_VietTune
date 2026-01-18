import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Music2, Globe, Filter } from "lucide-react";
import { Recording, SearchFilters } from "@/types";
import { recordingService } from "@/services/recordingService";
import { addSpotlightEffect } from "@/utils/spotlight";
import RecordingCard from "@/components/features/RecordingCard";
import SearchBar from "@/components/features/SearchBar";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function SearchPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const guidelinesRef = useRef<HTMLDivElement>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({});

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    if (containerRef.current)
      cleanupFunctions.push(addSpotlightEffect(containerRef.current));
    if (guidelinesRef.current)
      cleanupFunctions.push(addSpotlightEffect(guidelinesRef.current));
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, []);

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (Object.keys(filters).length > 0) {
        response = await recordingService.searchRecordings(
          filters,
          currentPage,
          20
        );
      } else {
        response = await recordingService.getRecordings(currentPage, 20);
      }
      setRecordings(response.items);
      setTotalPages(response.totalPages);
      setTotalResults(response.total);
    } catch (error) {
      console.error("Error fetching recordings:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    if (hasSearched) {
      fetchRecordings();
    }
  }, [fetchRecordings, hasSearched]);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setHasSearched(true);
  };

  const features = [
    {
      icon: Music2,
      title: "Đa dạng bản thu",
      description: "Kho tàng âm nhạc truyền thống phong phú",
    },
    {
      icon: Globe,
      title: "54 dân tộc",
      description: "Đa dạng văn hóa âm nhạc Việt Nam",
    },
    {
      icon: Filter,
      title: "Bộ lọc thông minh",
      description: "Tìm kiếm chính xác theo nhiều tiêu chí",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Tìm kiếm bản thu
          </h1>
          <p className="text-white leading-relaxed">
            Tìm kiếm theo thể loại, dân tộc, khu vực, nhạc cụ và nhiều tiêu chí khác
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="backdrop-blur-xl bg-white/20 border border-white/40 rounded-2xl p-6 shadow-2xl"
              style={{
                boxShadow:
                  "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
              }}
            >
              <div className="p-3 bg-emerald-500/20 rounded-xl w-fit mb-4">
                <feature.icon className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-white/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Main Search Form */}
        <div
          ref={containerRef}
          className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <SearchBar onSearch={handleSearch} initialFilters={filters} />
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Kết quả tìm kiếm
                </h2>
                {!loading && (
                  <p className="text-white/70 mt-1">
                    Tìm thấy {totalResults} bản thu
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
              <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                <div className="p-4 bg-emerald-500/20 rounded-2xl w-fit mx-auto mb-4">
                  <Search className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Không tìm thấy bản thu
                </h3>
                <p className="text-white/70 max-w-md mx-auto leading-relaxed">
                  Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm kết quả phù hợp hơn
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        )}

        {/* Initial State - Search Tips */}
        {!hasSearched && (
          <div
            ref={guidelinesRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 border border-white/40 rounded-2xl p-8 shadow-2xl"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Search className="h-5 w-5 text-emerald-400" />
              </div>
              Mẹo tìm kiếm
            </h2>
            <ul className="space-y-3 text-white leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 flex-shrink-0">•</span>
                <span>Sử dụng từ khóa cụ thể như tên bài hát, nghệ nhân, hoặc nhạc cụ</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 flex-shrink-0">•</span>
                <span>Kết hợp nhiều bộ lọc để thu hẹp kết quả tìm kiếm</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 flex-shrink-0">•</span>
                <span>Thử tìm theo vùng miền hoặc dân tộc để khám phá âm nhạc đặc trưng</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 flex-shrink-0">•</span>
                <span>Bộ lọc "Đã xác minh" giúp tìm các bản thu đã được kiểm chứng</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}