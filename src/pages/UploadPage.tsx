import UploadMusic from "@/components/features/UploadMusic";
import { BookOpen } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">
            Đóng góp bản thu
          </h1>
        </div>

        {/* Main Upload Form */}
        <div className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8" style={{ backgroundColor: '#FFFCF5' }}>
          <UploadMusic />
        </div>

        {/* Guidelines */}
        <div className="border border-neutral-200 rounded-2xl p-8 shadow-md" style={{ backgroundColor: '#FFFCF5' }}>
          <h2 className="text-2xl font-semibold mb-4 text-neutral-800 flex items-center gap-3">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-secondary-600" />
            </div>
            Hướng dẫn đóng góp
          </h2>
          <ul className="space-y-3 text-neutral-700 leading-relaxed">
            <li className="flex items-start gap-3">
              <span className="text-primary-600 flex-shrink-0">•</span>
              <span>Đảm bảo bản ghi âm có chất lượng tốt, rõ ràng, ít tiếng ồn</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 flex-shrink-0">•</span>
              <span>Cung cấp thông tin chính xác về nguồn gốc, người biểu diễn</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 flex-shrink-0">•</span>
              <span>Tôn trọng bản quyền và quyền sở hữu trí tuệ của nghệ sĩ</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 flex-shrink-0">•</span>
              <span>Các bản thu được kiểm duyệt trước khi công bố công khai</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}