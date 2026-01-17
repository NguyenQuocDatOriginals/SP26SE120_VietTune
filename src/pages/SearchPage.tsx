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
      title: "Hơn 10,000 bản thu",
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
    <div className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl">
              <Search className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Tìm kiếm bản thu</h1>
          </div>
          <p className="text-white/60 ml-14">
            Khám phá kho tàng âm nhạc truyền thống Việt Nam với bộ lọc nâng cao
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

        {/* Main Search Form */}
        <div
          ref={containerRef}
          className="spotlight-container backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <SearchBar onSearch={handleSearch} initialFilters={filters} />
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="mt-8">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Kết quả tìm kiếm
                </h2>
                {!loading && (
                  <p className="text-white/60 text-sm mt-1">
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
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                <div className="p-4 bg-white/10 rounded-full w-fit mx-auto mb-4">
                  <Search className="h-8 w-8 text-white/50" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">
                  Không tìm thấy bản thu
                </h3>
                <p className="text-white/60 max-w-md mx-auto">
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
          <div className="mt-8 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-emerald-400" />
              Mẹo tìm kiếm
            </h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Sử dụng từ khóa cụ thể như tên bài hát, nghệ nhân, hoặc nhạc cụ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Kết hợp nhiều bộ lọc để thu hẹp kết quả tìm kiếm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Thử tìm theo vùng miền hoặc dân tộc để khám phá âm nhạc đặc trưng</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Bộ lọc "Đã xác minh" giúp tìm các bản thu đã được kiểm chứng</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}