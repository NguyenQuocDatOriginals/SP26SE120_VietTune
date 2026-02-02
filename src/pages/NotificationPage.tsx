import { useEffect, useState } from "react";
import { Bell, CheckCircle, Trash2 } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import { useAuthStore } from "@/stores/authStore";
import { recordingRequestService } from "@/services/recordingRequestService";
import type { AppNotification } from "@/types";
import { formatDateTime } from "@/utils/helpers";

export default function NotificationPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user?.role) return;
    recordingRequestService.getNotificationsForRole(user.role).then(setNotifications);
    const t = setInterval(() => {
      recordingRequestService.getNotificationsForRole(user.role).then(setNotifications);
    }, 5000);
    return () => clearInterval(t);
  }, [user?.role]);

  const handleMarkRead = async (id: string) => {
    await recordingRequestService.markNotificationRead(id);
    if (user?.role) setNotifications(await recordingRequestService.getNotificationsForRole(user.role));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-neutral-800 min-w-0">
            Thông báo
          </h1>
          <BackButton />
        </div>

        <div
          className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-8 transition-all duration-300"
          style={{ backgroundColor: "#FFFCF5" }}
        >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-primary-100/90 rounded-2xl w-fit mb-4 shadow-sm">
                <Bell className="h-10 w-10 text-primary-600" strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Chưa có thông báo
              </h2>
              <p className="text-neutral-600 max-w-md">
                Các thông báo về kiểm duyệt, xóa bản thu, chỉnh sửa và cập nhật hệ thống sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`rounded-2xl border border-neutral-200/80 p-6 transition-all duration-300 ${
                    n.read ? "bg-neutral-50/80" : "bg-white"
                  }`}
                  style={n.read ? {} : { backgroundColor: "#FFFCF5" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {n.type === "recording_deleted" && (
                          <Trash2 className="h-5 w-5 text-red-600 flex-shrink-0" strokeWidth={2.5} />
                        )}
                        {n.type === "expert_account_deletion_approved" && (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" strokeWidth={2.5} />
                        )}
                        <h3 className="font-semibold text-neutral-900">{n.title}</h3>
                        {!n.read && (
                          <span className="inline-block w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" title="Chưa đọc" />
                        )}
                      </div>
                      <p className="text-neutral-700 font-medium text-sm">{n.body}</p>
                      <p className="text-neutral-500 text-xs mt-2">{formatDateTime(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        className="px-3 py-1.5 rounded-full text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors cursor-pointer flex-shrink-0"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
