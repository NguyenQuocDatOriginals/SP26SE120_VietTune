import BackButton from "@/components/common/BackButton";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            Bảng điều khiển quản trị
          </h1>
          <BackButton />
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200/80 shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <p className="text-neutral-700 font-medium">
            Bảng điều khiển quản trị với các tính năng quản lý người dùng, kiểm
            duyệt nội dung và phân tích dữ liệu sẽ được triển khai tại đây.
          </p>
        </div>
      </div>
    </div>
  );
}