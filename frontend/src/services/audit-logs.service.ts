import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface AuditLog {
    id: string;
    userId: string;
    user: { username: string; role: string };
    action: string;
    resource: string;
    resourceId: string;
    details: string;
    ip: string;
    createdAt: string;
}

export const AuditLogsService = {
    getLogs: async (limit: number = 100): Promise<AuditLog[]> => {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_URL}/audit-logs`, {
            params: { limit },
            headers
        });
        return res.data;
    }
};
