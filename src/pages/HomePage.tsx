import { Link } from "react-router-dom";
import { Upload, Search, Disc, Globe, ArrowRight, Compass, Heart, TrendingUp, Music, Users, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Recording } from "@/types";
import { recordingService } from "@/services/recordingService";
import RecordingCard from "@/components/features/RecordingCard";
import AudioPlayer from "@/components/features/AudioPlayer";
import logo from "@/components/image/VietTune logo.png";

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
        <div className="p-2 bg-primary-100 rounded-lg">
          <Icon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-neutral-800">{title}</h2>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <Link
          to={action.to}
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1"
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
    <div
      className="p-4 border border-neutral-200 rounded-xl text-center shadow-md hover:shadow-lg transition-shadow"
      style={{ backgroundColor: "#FFFCF5" }}
    >
      <div className="p-2 bg-secondary-100 rounded-lg w-fit mx-auto mb-2">
        <Icon className="h-5 w-5 text-secondary-600" />
      </div>
      <div className="text-2xl font-bold text-neutral-800">{value}</div>
      <div className="text-sm text-neutral-500">{label}</div>
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
      className="group p-6 rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all"
      style={{ backgroundColor: "#FFFCF5" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFF7E6")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFCF5")}
    >
      <div className="p-3 bg-primary-100 rounded-xl w-fit mb-4 group-hover:bg-primary-200 transition-colors">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <h3 className="text-xl font-semibold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors">
        {title}
      </h3>
      <p className="text-neutral-600 leading-relaxed">{description}</p>
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
            ? "bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg"
            : "text-primary-600 border-2 border-primary-600 shadow-md hover:shadow-lg"
        }`}
        style={!primary ? { backgroundColor: "#FFFCF5" } : undefined}
        onMouseEnter={(e) =>
          !primary && (e.currentTarget.style.backgroundColor = "#F5F0E8")
        }
        onMouseLeave={(e) =>
          !primary && (e.currentTarget.style.backgroundColor = "#FFFCF5")
        }
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

  useEffect(() => {
    fetchRecordings();

    // Load local recordings
    const local = JSON.parse(localStorage.getItem("localRecordings") || "[]");
    setLocalRecordings(local as LocalRecording[]);
  }, []);

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

  const handleDeleteRecording = (id: string) => {
    const updated = localRecordings.filter((rec) => rec.id !== id);
    setLocalRecordings(updated);
    localStorage.setItem("localRecordings", JSON.stringify(updated));
  };

  // Stats data
  const stats = [
    { icon: Disc, value: "Đa dạng", label: "Bản thu" },
    { icon: Users, value: "54", label: "Dân tộc" },
    { icon: Globe, value: "7", label: "Khu vực" },
    { icon: Music, value: "Rất nhiều", label: "Nhạc cụ" },
  ];

  // Features data
  const features = [
    {
      icon: Compass,
      title: "Khám phá bản thu",
      description:
        "Duyệt qua kho tàng âm nhạc truyền thống phong phú từ khắp mọi miền đất nước",
      to: "/explore",
    },
    {
      icon: Search,
      title: "Tìm kiếm bản thu",
      description:
        "Tìm kiếm theo thể loại, dân tộc, khu vực, nhạc cụ và nhiều tiêu chí khác",
      to: "/search",
    },
    {
      icon: Upload,
      title: "Đóng góp bản thu",
      description:
        "Chia sẻ bản thu âm nhạc truyền thống của bạn để cùng gìn giữ di sản văn hóa",
      to: "/upload",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div
          className="rounded-2xl shadow-lg p-8 md:p-12 mb-8"
          style={{ backgroundColor: "#FFFCF5" }}
        >
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <img
                src={logo}
                alt="VietTune Logo"
                className="h-20 w-20 object-contain rounded-2xl"
              />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              VietTune
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-primary-700 font-medium mb-4">
              Hệ thống lưu giữ âm nhạc truyền thống Việt Nam
            </p>

            {/* Description */}
            <p className="text-neutral-800 leading-relaxed max-w-2xl mx-auto mb-8">
              Gìn giữ và lan tỏa di sản âm nhạc của 54 dân tộc Việt Nam
              <br />
              qua nền tảng chia sẻ cộng đồng với công nghệ tìm kiếm thông minh
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <QuickActionButton
                icon={Compass}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
          className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8"
          style={{ backgroundColor: "#FFFCF5" }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-neutral-800">
            Tính năng chính
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8"
            style={{ backgroundColor: "#FFFCF5" }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-neutral-800">
                Bản thu của bạn
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Các bản thu bạn đã tải lên gần đây
              </p>
            </div>

            <div className="space-y-4">
              {localRecordings.slice(0, 3).map((rec) => (
                <AudioPlayer
                  key={rec.id}
                  src={rec.audioData}
                  title={rec.basicInfo?.title || rec.name}
                  artist={rec.basicInfo?.artist}
                  recording={rec}
                  onDelete={handleDeleteRecording}
                  showContainer={true}
                />
              ))}
            </div>

            {localRecordings.length > 3 && (
              <div className="mt-4 text-center">
                <Link
                  to="/my-recordings"
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
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
            className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8"
            style={{ backgroundColor: "#FFFCF5" }}
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
            className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8"
            style={{ backgroundColor: "#FFFCF5" }}
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
          className="rounded-2xl shadow-md border border-neutral-200 p-8"
          style={{ backgroundColor: "#FFFCF5" }}
        >
          <div className="text-center max-w-2xl mx-auto">
            <div className="p-3 bg-primary-100 rounded-2xl w-fit mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary-600" />
            </div>

            <h2 className="text-2xl font-semibold text-neutral-800 mb-4">
              Hãy cùng gìn giữ di sản
            </h2>

            <p className="text-neutral-600 leading-relaxed mb-6 max-w-6xl mx-auto">
              Mỗi bản thu, mỗi giai điệu đều là một phần của di sản văn hóa dân
              tộc.
              <br />
              Hãy cùng các nhà nghiên cứu, nghệ nhân và những người yêu văn hóa
              <br />
              chung tay bảo tồn âm nhạc truyền thống Việt Nam cho thế hệ mai
              sau.
            </p>

            <div className="flex justify-center">
              <QuickActionButton
                icon={Upload}
                label="Đóng góp bản thu"
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
