
import UploadMusic from "@/components/features/UploadMusic";
import { BookOpen, LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function UploadPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Always scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const isNotContributor = !user || user.role !== "CONTRIBUTOR";

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">
            Đóng góp bản thu
          </h1>
        </div>

        {/* Notice for non-Contributor users (not dimmed, always visible) */}
        {isNotContributor && (
          <div className="mb-8 border border-primary-200 rounded-2xl p-8 shadow-md text-center" style={{ backgroundColor: '#FFF1F3' }}>
            <h2 className="text-2xl font-semibold mb-4 text-primary-700">Bạn cần tài khoản Người đóng góp để đóng góp bản thu</h2>
            <div className="text-primary-700 text-base mb-4">Vui lòng đăng nhập bằng tài khoản Người đóng góp để sử dụng chức năng này.</div>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 mx-auto"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "auto" });
                navigate("/login");
              }}
              type="button"
            >
              <LogIn className="h-5 w-5" />
              Đăng nhập
            </button>
          </div>
        )}

        {/* Main Upload Form (dimmed and disabled for non-Contributor) */}
        <div
          className={`rounded-2xl shadow-md border border-neutral-200 p-8 mb-8 ${isNotContributor ? "opacity-50 pointer-events-none select-none" : ""}`}
          style={{ backgroundColor: '#FFFCF5' }}
        >
          {/* Only the form, no duplicate notice inside */}
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