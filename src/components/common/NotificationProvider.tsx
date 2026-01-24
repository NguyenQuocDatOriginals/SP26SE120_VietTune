import React from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import NotificationDialog from './NotificationDialog';

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
