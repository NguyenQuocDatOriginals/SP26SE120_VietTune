import { Target, Users, Heart } from "lucide-react";
import { useEffect, useRef } from "react";
import { addSpotlightEffect } from "@/utils/spotlight";

export default function AboutPage() {
  const missionRef = useRef<HTMLDivElement>(null);
  const differenceRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);
  const purposeRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    if (missionRef.current)
      cleanupFunctions.push(addSpotlightEffect(missionRef.current));
    if (differenceRef.current)
      cleanupFunctions.push(addSpotlightEffect(differenceRef.current));
    if (communityRef.current)
      cleanupFunctions.push(addSpotlightEffect(communityRef.current));
    if (purposeRef.current)
      cleanupFunctions.push(addSpotlightEffect(purposeRef.current));
    if (featuresRef.current)
      cleanupFunctions.push(addSpotlightEffect(featuresRef.current));
    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Về VietTune
        </h1>

        <div className="prose max-w-none">
          <div
            ref={missionRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8 mb-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">Sứ mệnh</h2>
            <p className="text-white leading-relaxed mb-4">
              54 dân tộc Việt Nam có kho tàng âm nhạc phong phú được truyền
              miệng qua nhiều đời. Nhiều nghệ nhân lớn tuổi nắm giữ kiến thức
              quý báu về nhạc cụ, kỹ thuật biểu diễn, bài hát nghi lễ và phong
              cách vùng miền. Đáng tiếc là các bản thu hầu hết chỉ là băng
              cassette rải rác ở các trung tâm văn hóa tỉnh, khó tiếp cận và
              chưa được lưu giữ bài bản.
            </p>
            <p className="text-white leading-relaxed">
              VietTune ra đời để giải quyết vấn đề này - một nền tảng cộng đồng
              chuyên biệt giúp lưu giữ di sản âm nhạc trước khi quá muộn. Chúng
              tôi cung cấp công cụ tìm kiếm thông minh và quản lý nội dung để
              xây dựng kho tư liệu đáng tin cậy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div
              ref={differenceRef}
              className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-6"
              style={{
                boxShadow:
                  "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
              }}
            >
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Điểm khác biệt
              </h3>
              <p className="text-white">
                Khác với các nền tảng nhạc giải trí, âm nhạc truyền thống cần
                thông tin chuyên sâu: hệ thống điệu thức, ngữ cảnh nghi lễ, cách
                chế tác nhạc cụ và đặc trưng vùng miền. Đó là điều chúng tôi tập
                trung.
              </p>
            </div>

            <div
              ref={communityRef}
              className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-6"
              style={{
                boxShadow:
                  "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
              }}
            >
              <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Sức mạnh cộng đồng
              </h3>
              <p className="text-white">
                Mọi người có thể đóng góp, các chuyên gia sẽ kiểm duyệt. Cùng
                nhau chúng ta gìn giữ di sản văn hóa cho thế hệ mai sau.
              </p>
            </div>
          </div>

          <div
            ref={purposeRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl border border-white/40 p-6 mb-8 shadow-2xl"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Mục đích</h3>
            <p className="text-white">
              Đây là đồ án tốt nghiệp đại học với sứ mệnh bảo tồn di sản âm nhạc Việt
              Nam. Mỗi đóng góp của bạn giúp lưu giữ những kiến thức văn hóa quý
              báu.
            </p>
          </div>

          <div
            ref={featuresRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Tính năng chính
            </h2>
            <ul className="space-y-3 text-white">
              <li className="flex items-start">
                <span className="text-white mr-2">•</span>
                <span>
                  <strong>Thông tin chi tiết:</strong> Dữ liệu chuyên sâu về hệ
                  thống điệu thức, ngữ cảnh nghi lễ và ý nghĩa văn hóa
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-white mr-2">•</span>
                <span>
                  <strong>Tìm kiếm linh hoạt:</strong> Lọc theo dân tộc, vùng
                  miền, nhạc cụ và ngữ cảnh biểu diễn
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-white mr-2">•</span>
                <span>
                  <strong>Kiểm duyệt chuyên nghiệp:</strong> Nội dung được xác
                  minh bởi các chuyên gia và nghệ nhân
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-white mr-2">•</span>
                <span>
                  <strong>Lưu trữ bền vững:</strong> Âm thanh chất lượng cao
                  cùng hồ sơ đầy đủ
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
