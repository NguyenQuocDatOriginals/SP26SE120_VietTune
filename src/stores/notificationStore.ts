import { create } from 'zustand';
import { NotificationType } from '@/components/common/NotificationDialog';

interface Notification {
    id: string;
    title: string;
    message: string | React.ReactNode;
    type: NotificationType;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

interface NotificationStore {
    notifications: Notification[];
    showNotification: (
        title: string,
        message: string | React.ReactNode,
        type?: NotificationType,
        autoClose?: boolean,
        autoCloseDelay?: number
    ) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    showNotification: (title, message, type = 'info', autoClose = true, autoCloseDelay = 3000) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        set((state) => ({
            notifications: [...state.notifications, { id, title, message, type, autoClose, autoCloseDelay }],
        }));
        return id;
    },
    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }));
    },
    clearAll: () => {
        set({ notifications: [] });
    },
}));

// Helper functions for convenience
export const notify = {
    success: (title: string, message: string | React.ReactNode, autoClose = true, autoCloseDelay = 3000) => {
        return useNotificationStore.getState().showNotification(title, message, 'success', autoClose, autoCloseDelay);
    },
    error: (title: string, message: string | React.ReactNode, autoClose = true, autoCloseDelay = 5000) => {
        return useNotificationStore.getState().showNotification(title, message, 'error', autoClose, autoCloseDelay);
    },
    info: (title: string, message: string | React.ReactNode, autoClose = true, autoCloseDelay = 3000) => {
        return useNotificationStore.getState().showNotification(title, message, 'info', autoClose, autoCloseDelay);
    },
    warning: (title: string, message: string | React.ReactNode, autoClose = true, autoCloseDelay = 4000) => {
        return useNotificationStore.getState().showNotification(title, message, 'warning', autoClose, autoCloseDelay);
    },
};
