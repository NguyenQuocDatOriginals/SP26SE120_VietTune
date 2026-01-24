import { Bell } from "lucide-react";
import BackButton from "@/components/common/BackButton";

export default function NotificationPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">
            Thông báo
          </h1>
          <BackButton />
        </div>

        <div
          className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 transition-all duration-300"
          style={{ backgroundColor: "#FFFCF5" }}
        >
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-primary-100/90 rounded-2xl w-fit mb-4 shadow-sm">
              <Bell className="h-10 w-10 text-primary-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Chưa có thông báo
            </h2>
            <p className="text-neutral-600 max-w-md">
              Các thông báo về kiểm duyệt, đóng góp và cập nhật hệ thống sẽ hiển thị tại đây.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
