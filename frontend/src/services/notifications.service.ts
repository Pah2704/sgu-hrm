import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
    isRead: boolean;
    createdAt: string;
    relatedType?: string;
}

export const NotificationsService = {
    getAll: async (): Promise<Notification[]> => {
        const res = await axios.get(`${API_URL}/notifications`);
        return res.data;
    },
    getUnreadCount: async (): Promise<number> => {
        const res = await axios.get(`${API_URL}/notifications/count`);
        return res.data.count;
    },
    markAsRead: async (id: string) => {
        await axios.patch(`${API_URL}/notifications/${id}/read`);
    },
    markAllAsRead: async () => {
        await axios.patch(`${API_URL}/notifications/read-all`);
    }
};
