import { useEffect, useRef } from "react";
import { addSpotlightEffect } from "@/utils/spotlight";
import UploadMusic from "@/components/features/UploadMusic";
import { Upload, Music2, Globe, BookOpen } from "lucide-react";

export default function UploadPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    if (containerRef.current)
      cleanupFunctions.push(addSpotlightEffect(containerRef.current));
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, []);

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
    <div className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl">
              <Upload className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Tải lên bản nhạc</h1>
          </div>
          <p className="text-white/60 ml-14">
            Đóng góp bản nhạc truyền thống Việt Nam cho kho tàng âm nhạc dân tộc
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

        {/* Main Upload Form */}
        <div
          ref={containerRef}
          className="spotlight-container backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <UploadMusic />
        </div>

        {/* Guidelines */}
        <div className="mt-8 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            Hướng dẫn đóng góp
          </h3>
          <ul className="space-y-2 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Đảm bảo bản ghi âm có chất lượng tốt, rõ ràng, ít tiếng ồn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Cung cấp thông tin chính xác về nguồn gốc, người biểu diễn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Tôn trọng bản quyền và quyền sở hữu trí tuệ của nghệ sĩ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-1">•</span>
              <span>Các bản thu được kiểm duyệt trước khi công bố công khai</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}