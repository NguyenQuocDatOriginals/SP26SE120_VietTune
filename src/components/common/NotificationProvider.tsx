/**
 * Tài liệu hoá tiếng Việt cho file TSX.
 * Ghi chú: TSX/JSX không thể chú thích "từng dòng" bằng `//` trong phần JSX mà không phá cú pháp,
 * nên file này được chú thích theo khối/chức năng chính (component/handler/luồng dữ liệu).
 */
import React from 'react';

import NotificationDialog from './NotificationDialog';

import { useNotificationStore } from '@/stores/notificationStore';

/**

 * Component trang (page).

 * - Trách nhiệm: hiển thị UI và điều phối các thao tác chính của trang.

 */


export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  return (
    <>
      {children}
      {notifications.map((notification) => (
        <NotificationDialog
          key={notification.id}
          isOpen={true}
          onClose={() => removeNotification(notification.id)}
          title={notification.title}
          message={notification.message}
          type={notification.type}
          autoClose={notification.autoClose}
          autoCloseDelay={notification.autoCloseDelay}
        />
      ))}
    </>
  );
}
