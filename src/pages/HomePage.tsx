import { Link } from "react-router-dom";
import { Music, Upload, Search, Users } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Recording } from "@/types";
import { recordingService } from "@/services/recordingService";
import RecordingCard from "@/components/features/RecordingCard";
import AudioPlayer from "@/components/features/AudioPlayer";
import { addSpotlightEffect } from "@/utils/spotlight";

// Local recording type for client-saved uploads
interface LocalRecording {
  id: string;
  name: string;
  audioData: string;
  userType?: string;
  detectedType?: string;
}

export default function HomePage() {
  const [popularRecordings, setPopularRecordings] = useState<Recording[]>([]);
  const [recentRecordings, setRecentRecordings] = useState<Recording[]>([]);
  const [localRecordings, setLocalRecordings] = useState<LocalRecording[]>([]);

  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const popularRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecordings();
    // Lấy bản thu local
    const local = JSON.parse(localStorage.getItem("localRecordings") || "[]");
    setLocalRecordings(local as LocalRecording[]);

    // Add spotlight effects
    const cleanupFunctions: (() => void)[] = [];

    if (heroRef.current)
      cleanupFunctions.push(addSpotlightEffect(heroRef.current));
    if (featuresRef.current)
      cleanupFunctions.push(addSpotlightEffect(featuresRef.current));
    if (popularRef.current)
      cleanupFunctions.push(addSpotlightEffect(popularRef.current));
    if (recentRef.current)
      cleanupFunctions.push(addSpotlightEffect(recentRef.current));
    if (ctaRef.current)
      cleanupFunctions.push(addSpotlightEffect(ctaRef.current));

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);

  const fetchRecordings = async () => {
    try {
      const [popular, recent] = await Promise.all([
        recordingService.getPopularRecordings(8),
        recordingService.getRecentRecordings(8),
      ]);
      setPopularRecordings(popular.data || []);
      setRecentRecordings(recent.data || []);
    } catch (error) {
      console.error("Error fetching recordings:", error);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={heroRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">VietTune</h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-100">
                Hệ thống lưu giữ âm nhạc truyền thống Việt Nam
              </p>
              <p className="text-lg mb-10 max-w-3xl mx-auto">
                Gìn giữ di sản âm nhạc của 54 dân tộc Việt Nam
                <br />
                qua nền tảng chia sẻ cộng đồng với công nghệ tìm kiếm thông minh
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/explore">
                  <button className="btn-liquid-glass-primary flex items-center justify-center gap-2 min-w-[200px]">
                    <Music className="h-5 w-5" />
                    Khám phá bản thu
                  </button>
                </Link>
                <Link to="/upload">
                  <button className="btn-liquid-glass-primary flex items-center justify-center gap-2 min-w-[200px]">
                    <Upload className="h-5 w-5" />
                    Đóng góp
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={featuresRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Music className="h-8 w-8 text-primary-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Kho tàng đa dạng
                </h3>
                <p className="text-white">
                  Lưu giữ âm nhạc truyền thống
                  <br />
                  từ 54 dân tộc Việt Nam
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Tìm kiếm dễ dàng
                </h3>
                <p className="text-white">
                  Lọc theo dân tộc, nhạc cụ,
                  <br />
                  nghi lễ và phong cách
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary-700" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Cộng đồng đóng góp
                </h3>
                <p className="text-white">
                  Được kiểm duyệt bởi các nhà nghiên cứu, nghệ nhân và chuyên
                  gia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Recordings */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={popularRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">
                Bản thu phổ biến
              </h2>
              <Link
                to="/search"
                className="text-white hover:text-green-300 transition-colors"
              >
                Xem tất cả →
              </Link>
            </div>

            {/* Hiển thị bản thu local ở mục phổ biến (full-width list) */}
            {localRecordings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Bản thu của bạn
                </h3>
                <div className="flex flex-col gap-4">
                  {localRecordings.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-white/10 rounded-xl p-4 shadow-lg flex flex-col items-stretch"
                    >
                      <div className="text-lg font-semibold text-white mb-1 w-full">
                        {rec.name}
                      </div>
                      <div className="text-xs text-white/80 mb-3">
                        {rec.userType || rec.detectedType}
                      </div>
                      <AudioPlayer src={rec.audioData} className="w-full" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularRecordings.map((recording) => (
                <RecordingCard key={recording.id} recording={recording} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Uploads */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={recentRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Tải lên gần đây</h2>
              <Link
                to="/search"
                className="text-white hover:text-green-300 active:text-green-200 transition-colors"
              >
                Xem tất cả →
              </Link>
            </div>

            {/* Hiển thị bản thu local ở mục gần đây (full-width list) */}
            {localRecordings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Bản thu của bạn
                </h3>
                <div className="flex flex-col gap-4">
                  {localRecordings.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-white/10 rounded-xl p-4 shadow-lg flex flex-col items-stretch"
                    >
                      <div className="text-lg font-semibold text-white mb-1 w-full">
                        {rec.name}
                      </div>
                      <div className="text-xs text-white/80 mb-3">
                        {rec.userType || rec.detectedType}
                      </div>
                      <AudioPlayer src={rec.audioData} className="w-full" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentRecordings.map((recording) => (
                <RecordingCard key={recording.id} recording={recording} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={ctaRef}
            className="spotlight-container backdrop-blur-xl bg-white/20 rounded-2xl shadow-2xl border border-white/40 p-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Hãy cùng gìn giữ</h2>
              <p className="text-xl mb-8 text-primary-100">
                Mỗi bản thu, mỗi câu chuyện đều quý giá.
                <br />
                Hãy cùng các nhà nghiên cứu, nghệ nhân và những người yêu văn
                hóa lưu giữ di sản âm nhạc Việt Nam, bạn nhé!
              </p>
              <Link to="/register">
                <button className="btn-liquid-glass-primary min-w-[180px]">
                  Bắt đầu
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
