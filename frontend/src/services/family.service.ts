import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface FamilyMember {
    id: string;
    employeeId: string;
    fullName: string;
    relation: string;
    birthYear?: number;
    job?: string;
    address?: string;
    hometown?: string;
    politicalOrganization?: string;
    politicalPosition?: string;
}

export const FamilyService = {
    getAllByEmployee: async (employeeId: string) => {
        const res = await axios.get(`${API_URL}/family`, { params: { employeeId } });
        return res.data;
    },

    create: async (data: any) => {
        const res = await axios.post(`${API_URL}/family`, data);
        return res.data;
    },

    update: async (id: string, data: any) => {
        const res = await axios.patch(`${API_URL}/family/${id}`, data);
        return res.data;
    },

    delete: async (id: string) => {
        const res = await axios.delete(`${API_URL}/family/${id}`);
        return res.data;
    }
};
