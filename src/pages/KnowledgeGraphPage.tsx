import { Link } from "react-router-dom";
import BackButton from "@/components/common/BackButton";
import { Network, Music, Users, MapPin, FileAudio, Sparkles } from "lucide-react";

/**
 * Placeholder for Research & Discovery: Interactive knowledge graph.
 * Demo: static visual of relationships (ethnicity ↔ instruments ↔ recordings ↔ ceremonies).
 * Full version would be driven by backend/API.
 */
export default function KnowledgeGraphPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            Đồ thị tri thức
          </h1>
          <BackButton />
        </div>

        <div
          className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 mb-8 transition-all duration-300 hover:shadow-xl"
          style={{ backgroundColor: "#FFFCF5" }}
        >
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4 flex items-center gap-3">
            <div className="p-2 bg-primary-100/90 rounded-lg shadow-sm">
              <Network className="h-5 w-5 text-primary-600" strokeWidth={2.5} />
            </div>
            Khám phá mối liên kết
          </h2>
          <p className="text-neutral-600 font-medium leading-relaxed mb-4">
            Đồ thị tri thức trực quan hóa mối quan hệ giữa dân tộc, nhạc cụ, bản thu và bối cảnh nghi lễ.
            Trong phiên bản demo, đồ thị dưới đây là minh họa tĩnh; khi kết nối backend, bạn có thể nhấp vào từng nút để xem bản thu, nhạc cụ hoặc dân tộc tương ứng.
          </p>
          <p className="text-neutral-600 leading-relaxed mb-6">
            Ví dụ: chọn <strong>Nhạc cụ</strong> → xem các bản thu sử dụng nhạc cụ đó; chọn <strong>Nghi lễ</strong> → xem âm nhạc gắn với đám cưới, đám tang, lễ hội,...
          </p>

          {/* Static diagram: nodes and edges */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 py-8 px-4 border border-dashed border-neutral-300/80 rounded-2xl bg-white/50">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-primary-100 border-2 border-primary-300 flex items-center justify-center cursor-pointer hover:bg-primary-200/90 transition-colors" title="Dân tộc">
                <Users className="h-6 w-6 text-primary-700" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-neutral-800">Dân tộc</span>
            </div>
            <span className="self-center text-neutral-400 font-medium">↔</span>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-secondary-100 border-2 border-secondary-300 flex items-center justify-center cursor-pointer hover:bg-secondary-200/90 transition-colors" title="Nhạc cụ">
                <Music className="h-6 w-6 text-secondary-700" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-neutral-800">Nhạc cụ</span>
            </div>
            <span className="self-center text-neutral-400 font-medium">↔</span>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-primary-100 border-2 border-primary-300 flex items-center justify-center cursor-pointer hover:bg-primary-200/90 transition-colors" title="Bản thu">
                <FileAudio className="h-6 w-6 text-primary-700" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-neutral-800">Bản thu</span>
            </div>
            <span className="self-center text-neutral-400 font-medium">↔</span>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-secondary-100 border-2 border-secondary-300 flex items-center justify-center cursor-pointer hover:bg-secondary-200/90 transition-colors" title="Nghi lễ / Vùng miền">
                <MapPin className="h-6 w-6 text-secondary-700" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-neutral-800">Nghi lễ / Vùng</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors cursor-pointer"
            >
              Tìm kiếm bản thu
            </Link>
            <Link
              to="/semantic-search"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
              Tìm theo ý nghĩa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
