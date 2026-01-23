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

        <div className="bg-white rounded-2xl shadow-md border border-neutral-300 p-8">
          <p className="text-neutral-700">
            Bảng điều khiển quản trị với các tính năng quản lý người dùng, kiểm
            duyệt nội dung và phân tích dữ liệu sẽ được triển khai tại đây.
          </p>
        </div>
      </div>
    </div>
  );
}