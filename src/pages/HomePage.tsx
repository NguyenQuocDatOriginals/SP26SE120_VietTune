import { Link } from "react-router-dom";
import { Upload, Search, ArrowRight, Compass, TrendingUp, Clock, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Recording } from "@/types";
import { recordingService } from "@/services/recordingService";
import RecordingCard from "@/components/features/RecordingCard";
import logo from "@/components/image/VietTune logo.png";

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
        className={`w-full sm:w-[280px] px-8 py-3.5 rounded-full font-medium flex items-center justify-center gap-2 transition-all ${
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

  useEffect(() => {
    fetchRecordings();
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
            <p className="text-neutral-800 leading-relaxed max-w-2xl mx-auto">
              Gìn giữ và lan tỏa di sản âm nhạc của 54 dân tộc Việt Nam
              <br />
              qua nền tảng chia sẻ cộng đồng với công nghệ tìm kiếm thông minh
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div
          className="rounded-2xl shadow-md border border-neutral-200 p-8 mb-8"
          style={{ backgroundColor: "#FFFCF5" }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-neutral-800 text-center">
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

        {/* Terms and Conditions Section */}
        <div
          className="rounded-2xl shadow-md border border-neutral-200 p-8 text-center"
          style={{ backgroundColor: "#FFFCF5" }}
        >
          <div className="bg-neutral-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
            <FileText className="h-6 w-6 text-neutral-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-neutral-800">
            Điều khoản và Điều kiện
          </h3>
          <p className="text-neutral-700 mb-6">
            Tìm hiểu các quy định và chính sách khi sử dụng nền tảng VietTune.
          </p>
          <Link
            to="/terms"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
          >
            <FileText className="h-5 w-5" />
            Xem Điều khoản và Điều kiện
          </Link>
        </div>
      </div>
    </div>
  );
}