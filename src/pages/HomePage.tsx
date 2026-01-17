import { Link } from "react-router-dom";
import { Music, Upload, Search, Users, Disc, Globe, Play, ArrowRight, Compass, Heart, Sparkles, TrendingUp, Clock, MapPin } from "lucide-react";
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
  basicInfo?: {
    title?: string;
    artist?: string;
    genre?: string;
  };
  culturalContext?: {
    ethnicity?: string;
    region?: string;
  };
  uploadedAt?: string;
}

// Section Header Component
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Icon className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <Link
          to={action.to}
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center hover:bg-white/10 transition-colors">
      <div className="p-2 bg-emerald-500/10 rounded-lg w-fit mx-auto mb-2">
        <Icon className="h-5 w-5 text-emerald-400" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon: Icon,
  title,
  description,
  to,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all"
    >
      <div className="p-3 bg-emerald-500/10 rounded-xl w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
        <Icon className="h-6 w-6 text-emerald-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors">
        {title}
      </h3>
      <p className="text-white/60 text-sm">{description}</p>
    </Link>
  );
}

// Quick Action Button Component
function QuickActionButton({
  icon: Icon,
  label,
  to,
  primary = false,
}: {
  icon: React.ElementType;
  label: string;
  to: string;
  primary?: boolean;
}) {
  return (
    <Link to={to} className="w-full sm:w-auto">
      <button
        className={`w-full px-8 py-3.5 rounded-full font-medium flex items-center justify-center gap-2 transition-all ${
          primary
            ? "btn-liquid-glass-primary"
            : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
        }`}
      >
        <Icon className="h-5 w-5" />
        {label}
      </button>
    </Link>
  );
}

export default function HomePage() {
  const [popularRecordings, setPopularRecordings] = useState<Recording[]>([]);
  const [recentRecordings, setRecentRecordings] = useState<Recording[]>([]);
  const [localRecordings, setLocalRecordings] = useState<LocalRecording[]>([]);

  // Refs for spotlight effects
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const localRef = useRef<HTMLDivElement>(null);
  const popularRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecordings();
    
    // Load local recordings
    const local = JSON.parse(localStorage.getItem("localRecordings") || "[]");
    setLocalRecordings(local as LocalRecording[]);

    // Add spotlight effects for static containers
    const cleanupFunctions: (() => void)[] = [];
    const staticRefs = [heroRef, statsRef, featuresRef, popularRef, recentRef, ctaRef];
    
    staticRefs.forEach((ref) => {
      if (ref.current) {
        cleanupFunctions.push(addSpotlightEffect(ref.current));
      }
    });

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);

  // Separate useEffect for localRef spotlight (depends on localRecordings)
  useEffect(() => {
    if (localRef.current && localRecordings.length > 0) {
      const cleanup = addSpotlightEffect(localRef.current);
      return cleanup;
    }
  }, [localRecordings]);

  const fetchRecordings = async () => {
    try {
      const [popular, recent] = await Promise.all([
        recordingService.getPopularRecordings(4),
        recordingService.getRecentRecordings(4),
      ]);
      setPopularRecordings(popular.data || []);
      setRecentRecordings(recent.data || []);
    } catch (error) {
      console.error("Error fetching recordings:", error);
    }
  };

  // Stats data
  const stats = [
    { icon: Disc, value: "10,000+", label: "Bản thu" },
    { icon: Users, value: "54", label: "Dân tộc" },
    { icon: Globe, value: "7", label: "Vùng miền" },
    { icon: Music, value: "200+", label: "Nhạc cụ" },
  ];

  // Features data
  const features = [
    {
      icon: Compass,
      title: "Khám phá",
      description: "Duyệt qua kho tàng âm nhạc truyền thống phong phú từ khắp mọi miền đất nước",
      to: "/explore",
    },
    {
      icon: Search,
      title: "Tìm kiếm",
      description: "Tìm kiếm nâng cao theo thể loại, dân tộc, vùng miền, nhạc cụ và nhiều tiêu chí khác",
      to: "/search",
    },
    {
      icon: Upload,
      title: "Đóng góp",
      description: "Chia sẻ bản thu âm nhạc truyền thống của bạn để cùng gìn giữ di sản văn hóa",
      to: "/upload",
    },
  ];

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Hero Section */}
        <div
          ref={heroRef}
          className="spotlight-container backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-4 bg-emerald-500/20 rounded-2xl">
                <Music className="h-12 w-12 text-emerald-400" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              VietTune
            </h1>
            
            {/* Tagline */}
            <p className="text-xl md:text-2xl text-emerald-300 mb-4">
              Hệ thống lưu giữ âm nhạc truyền thống Việt Nam
            </p>
            
            {/* Description */}
            <p className="text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
              Gìn giữ và lan tỏa di sản âm nhạc của 54 dân tộc Việt Nam qua nền tảng 
              chia sẻ cộng đồng với công nghệ tìm kiếm thông minh
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <QuickActionButton
                icon={Play}
                label="Khám phá bản thu"
                to="/explore"
                primary
              />
              <QuickActionButton
                icon={Upload}
                label="Đóng góp bản thu"
                to="/upload"
              />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>

        {/* Features Section */}
        <div
          ref={featuresRef}
          className="spotlight-container backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8 mb-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <SectionHeader
            icon={Sparkles}
            title="Tính năng chính"
            subtitle="Khám phá các tính năng của VietTune"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                to={feature.to}
              />
            ))}
          </div>
        </div>

        {/* Local Recordings Section */}
        {localRecordings.length > 0 && (
          <div
            ref={localRef}
            className="spotlight-container backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8 mb-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <SectionHeader
              icon={Heart}
              title="Bản thu của bạn"
              subtitle="Các bản thu bạn đã tải lên gần đây"
            />

            <div className="space-y-4">
              {localRecordings.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <AudioPlayer
                    src={rec.audioData}
                    title={rec.basicInfo?.title || rec.name}
                    artist={rec.basicInfo?.artist}
                    className="w-full"
                  />
                  
                  {/* Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
                    {(rec.basicInfo?.genre || rec.userType || rec.detectedType) && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full">
                        <Music className="h-3 w-3" />
                        {rec.basicInfo?.genre || rec.userType || rec.detectedType}
                      </span>
                    )}
                    {rec.culturalContext?.ethnicity && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white/10 text-white/70 rounded-full">
                        <Users className="h-3 w-3" />
                        {rec.culturalContext.ethnicity}
                      </span>
                    )}
                    {rec.culturalContext?.region && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white/10 text-white/70 rounded-full">
                        <MapPin className="h-3 w-3" />
                        {rec.culturalContext.region}
                      </span>
                    )}
                    {rec.uploadedAt && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white/10 text-white/50 rounded-full ml-auto">
                        <Clock className="h-3 w-3" />
                        {new Date(rec.uploadedAt).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {localRecordings.length > 3 && (
              <div className="mt-4 text-center">
                <Link
                  to="/my-recordings"
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Xem tất cả {localRecordings.length} bản thu →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Popular Recordings Section */}
        {popularRecordings.length > 0 && (
          <div
            ref={popularRef}
            className="spotlight-container backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8 mb-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <SectionHeader
              icon={TrendingUp}
              title="Bản thu phổ biến"
              subtitle="Được nghe nhiều nhất trong tuần"
              action={{ label: "Xem tất cả", to: "/explore" }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularRecordings.map((recording) => (
                <RecordingCard key={recording.id} recording={recording} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Recordings Section */}
        {recentRecordings.length > 0 && (
          <div
            ref={recentRef}
            className="spotlight-container backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8 mb-8"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
            }}
          >
            <SectionHeader
              icon={Clock}
              title="Tải lên gần đây"
              subtitle="Bản thu mới nhất từ cộng đồng"
              action={{ label: "Xem tất cả", to: "/explore" }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentRecordings.map((recording) => (
                <RecordingCard key={recording.id} recording={recording} />
              ))}
            </div>
          </div>
        )}

        {/* Call to Action Section */}
        <div
          ref={ctaRef}
          className="spotlight-container backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8"
          style={{
            boxShadow:
              "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <div className="text-center max-w-2xl mx-auto">
            <div className="p-3 bg-emerald-500/20 rounded-2xl w-fit mx-auto mb-4">
              <Heart className="h-8 w-8 text-emerald-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Hãy cùng gìn giữ di sản
            </h2>
            
            <p className="text-white/60 mb-6 leading-relaxed">
              Mỗi bản thu, mỗi giai điệu đều là một phần của di sản văn hóa dân tộc. 
              Hãy cùng các nhà nghiên cứu, nghệ nhân và những người yêu văn hóa 
              chung tay bảo tồn âm nhạc truyền thống Việt Nam cho thế hệ mai sau.
            </p>

            <div className="flex justify-center">
              <QuickActionButton
                icon={Upload}
                label="Đóng góp ngay"
                to="/upload"
                primary
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}