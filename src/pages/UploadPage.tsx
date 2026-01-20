import UploadMusic from "@/components/features/UploadMusic";
import { Music2, Globe, BookOpen } from "lucide-react";

export default function UploadPage() {
  const features = [
    {
      icon: Music2,
      title: "Đa dạng thể loại",
      description: "Hỗ trợ tất cả các thể loại nhạc truyền thống Việt Nam",
    },
    {
      icon: Globe,
      title: "54 dân tộc",
      description: "Lưu trữ âm nhạc của tất cả 54 dân tộc anh em",
    },
    {
      icon: BookOpen,
      title: "Bảo tồn di sản",
      description: "Góp phần gìn giữ di sản âm nhạc dân tộc",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">
            Đóng góp bản thu
          </h1>
          <p className="text-neutral-600 leading-relaxed">
            Chia sẻ bản thu âm nhạc truyền thống của bạn để cùng gìn giữ di sản văn hóa
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-md"
            >
              <div className="p-3 bg-primary-100 rounded-xl w-fit mb-4">
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

        {/* Main Upload Form */}
        <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-8 mb-8">
          <UploadMusic />
        </div>

        {/* Guidelines */}
        <div className="bg-secondary-50 border-l-4 border-secondary-500 rounded-2xl p-8 shadow-sm">
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