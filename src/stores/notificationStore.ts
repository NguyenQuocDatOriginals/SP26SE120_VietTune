// [VI] Nhập (import) các phụ thuộc cho file.
import { create } from 'zustand';

// [VI] Nhập (import) các phụ thuộc cho file.
import { NotificationType } from '@/components/common/NotificationDialog';

// [VI] Khai báo interface để ràng buộc cấu trúc dữ liệu.
interface Notification {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  title: string;
// [VI] Thực thi một bước trong luồng xử lý.
  message: string | React.ReactNode;
// [VI] Thực thi một bước trong luồng xử lý.
  type: NotificationType;
// [VI] Thực thi một bước trong luồng xử lý.
  autoClose?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  autoCloseDelay?: number;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo interface để ràng buộc cấu trúc dữ liệu.
interface NotificationStore {
// [VI] Thực thi một bước trong luồng xử lý.
  notifications: Notification[];
// [VI] Thực thi một bước trong luồng xử lý.
  showNotification: (
// [VI] Thực thi một bước trong luồng xử lý.
    title: string,
// [VI] Thực thi một bước trong luồng xử lý.
    message: string | React.ReactNode,
// [VI] Thực thi một bước trong luồng xử lý.
    type?: NotificationType,
// [VI] Thực thi một bước trong luồng xử lý.
    autoClose?: boolean,
// [VI] Thực thi một bước trong luồng xử lý.
    autoCloseDelay?: number,
// [VI] Khai báo hàm/biểu thức hàm.
  ) => void;
// [VI] Khai báo hàm/biểu thức hàm.
  removeNotification: (id: string) => void;
// [VI] Khai báo hàm/biểu thức hàm.
  clearAll: () => void;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const useNotificationStore = create<NotificationStore>((set) => ({
// [VI] Thực thi một bước trong luồng xử lý.
  notifications: [],
// [VI] Khai báo hàm/biểu thức hàm.
  showNotification: (title, message, type = 'info', autoClose = true, autoCloseDelay = 3000) => {
// [VI] Khai báo biến/hằng số.
    const id = `notification-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
// [VI] Khai báo hàm/biểu thức hàm.
    set((state) => ({
// [VI] Thực thi một bước trong luồng xử lý.
      notifications: [
// [VI] Thực thi một bước trong luồng xử lý.
        ...state.notifications,
// [VI] Thực thi một bước trong luồng xử lý.
        { id, title, message, type, autoClose, autoCloseDelay },
// [VI] Thực thi một bước trong luồng xử lý.
      ],
// [VI] Thực thi một bước trong luồng xử lý.
    }));
// [VI] Trả về kết quả từ hàm.
    return id;
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Khai báo hàm/biểu thức hàm.
  removeNotification: (id) => {
// [VI] Khai báo hàm/biểu thức hàm.
    set((state) => ({
// [VI] Khai báo hàm/biểu thức hàm.
      notifications: state.notifications.filter((n) => n.id !== id),
// [VI] Thực thi một bước trong luồng xử lý.
    }));
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Khai báo hàm/biểu thức hàm.
  clearAll: () => {
// [VI] Thực thi một bước trong luồng xử lý.
    set({ notifications: [] });
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
}));

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * @deprecated Thông báo dạng modal cũ. Luồng mới: `@/uiToast` (toast không chặn UI).
// [VI] Thực thi một bước trong luồng xử lý.
 * Giữ store cho NotificationProvider / màn hình cần stack dialog.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const notify = {
// [VI] Thực thi một bước trong luồng xử lý.
  success: (
// [VI] Thực thi một bước trong luồng xử lý.
    title: string,
// [VI] Thực thi một bước trong luồng xử lý.
    message: string | React.ReactNode,
// [VI] Thực thi một bước trong luồng xử lý.
    autoClose = true,
// [VI] Thực thi một bước trong luồng xử lý.
    autoCloseDelay = 3000,
// [VI] Khai báo hàm/biểu thức hàm.
  ) => {
// [VI] Trả về kết quả từ hàm.
    return useNotificationStore
// [VI] Thực thi một bước trong luồng xử lý.
      .getState()
// [VI] Thực thi một bước trong luồng xử lý.
      .showNotification(title, message, 'success', autoClose, autoCloseDelay);
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
  error: (
// [VI] Thực thi một bước trong luồng xử lý.
    title: string,
// [VI] Thực thi một bước trong luồng xử lý.
    message: string | React.ReactNode,
// [VI] Thực thi một bước trong luồng xử lý.
    autoClose = true,
// [VI] Thực thi một bước trong luồng xử lý.
    autoCloseDelay = 5000,
// [VI] Khai báo hàm/biểu thức hàm.
  ) => {
// [VI] Trả về kết quả từ hàm.
    return useNotificationStore
// [VI] Thực thi một bước trong luồng xử lý.
      .getState()
// [VI] Thực thi một bước trong luồng xử lý.
      .showNotification(title, message, 'error', autoClose, autoCloseDelay);
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
  info: (
// [VI] Thực thi một bước trong luồng xử lý.
    title: string,
// [VI] Thực thi một bước trong luồng xử lý.
    message: string | React.ReactNode,
// [VI] Thực thi một bước trong luồng xử lý.
    autoClose = true,
// [VI] Thực thi một bước trong luồng xử lý.
    autoCloseDelay = 3000,
// [VI] Khai báo hàm/biểu thức hàm.
  ) => {
// [VI] Trả về kết quả từ hàm.
    return useNotificationStore
// [VI] Thực thi một bước trong luồng xử lý.
      .getState()
// [VI] Thực thi một bước trong luồng xử lý.
      .showNotification(title, message, 'info', autoClose, autoCloseDelay);
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
  warning: (
// [VI] Thực thi một bước trong luồng xử lý.
    title: string,
// [VI] Thực thi một bước trong luồng xử lý.
    message: string | React.ReactNode,
// [VI] Thực thi một bước trong luồng xử lý.
    autoClose = true,
// [VI] Thực thi một bước trong luồng xử lý.
    autoCloseDelay = 4000,
// [VI] Khai báo hàm/biểu thức hàm.
  ) => {
// [VI] Trả về kết quả từ hàm.
    return useNotificationStore
// [VI] Thực thi một bước trong luồng xử lý.
      .getState()
// [VI] Thực thi một bước trong luồng xử lý.
      .showNotification(title, message, 'warning', autoClose, autoCloseDelay);
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
};
