import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface WorkHistory {
    id: string;
    employeeId: string;
    fromDate: string;
    toDate?: string;
    workplace: string;
    department?: string;
    position: string;
    referenceNumber?: string;
}

export const WorkHistoryService = {
    getAllByEmployee: async (employeeId: string) => {
        const res = await axios.get(`${API_URL}/work-history`, { params: { employeeId } });
        return res.data;
    },

    create: async (data: any) => {
        const res = await axios.post(`${API_URL}/work-history`, data);
        return res.data;
    },

    update: async (id: string, data: any) => {
        const res = await axios.patch(`${API_URL}/work-history/${id}`, data);
        return res.data;
    },

    delete: async (id: string) => {
        const res = await axios.delete(`${API_URL}/work-history/${id}`);
        return res.data;
    }
};
