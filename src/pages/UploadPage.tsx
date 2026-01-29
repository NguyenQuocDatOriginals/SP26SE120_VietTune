import UploadMusic from "@/components/features/UploadMusic";
import { BookOpen, LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import BackButton from "@/components/common/BackButton";

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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            Đóng góp bản thu
          </h1>
          <BackButton />
        </div>

        {/* Notice for non-Contributor users (not dimmed, always visible) */}
        {isNotContributor && (
          <div className="mb-8 border border-primary-200/80 rounded-2xl p-8 shadow-lg backdrop-blur-sm text-center transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFF1F3' }}>
            <h2 className="text-2xl font-semibold mb-4 text-primary-700">Bạn cần có tài khoản Người đóng góp để đóng góp bản thu</h2>
            <div className="text-primary-700 text-base mb-4 font-medium">Vui lòng đăng nhập bằng tài khoản Người đóng góp để sử dụng chức năng này.</div>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-medium transition-all duration-300 shadow-xl hover:shadow-2xl shadow-primary-600/40 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary-500/50 mx-auto"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "auto" });
                navigate("/login?redirect=/upload");
              }}
              type="button"
            >
              <LogIn className="h-5 w-5" strokeWidth={2.5} />
              Đăng nhập
            </button>
          </div>
        )}

        {/* Main Upload Form (dimmed and disabled for non-Contributor) */}
        <div
          className={`rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 mb-8 transition-all duration-300 hover:shadow-xl ${isNotContributor ? "opacity-50 pointer-events-none select-none" : ""}`}
          style={{ backgroundColor: '#FFFCF5' }}
        >
          {/* Only the form, no duplicate notice inside */}
          <UploadMusic />
        </div>

        {/* Guidelines */}
        <div className="border border-neutral-200/80 rounded-2xl p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl" style={{ backgroundColor: '#FFFCF5' }}>
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900 flex items-center gap-3">
            <div className="p-2 bg-secondary-100/90 rounded-lg shadow-sm">
              <BookOpen className="h-5 w-5 text-secondary-600" strokeWidth={2.5} />
            </div>
            Hướng dẫn đóng góp
          </h2>
          <ul className="space-y-3 text-neutral-700 font-medium leading-relaxed">
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