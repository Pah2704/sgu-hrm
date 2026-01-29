import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const UnitsService = {
    getAll: async () => {
        const res = await axios.get(`${API_URL}/units`);
        return res.data;
    },
    getById: async (id: string) => {
        const res = await axios.get(`${API_URL}/units/${id}`);
        return res.data;
    },
    create: async (data: any) => {
        const res = await axios.post(`${API_URL}/units`, data);
        return res.data;
    },
    update: async (id: string, data: any) => {
        const res = await axios.patch(`${API_URL}/units/${id}`, data);
        return res.data;
    },
    delete: async (id: string) => {
        const res = await axios.delete(`${API_URL}/units/${id}`);
        return res.data;
    }
};
