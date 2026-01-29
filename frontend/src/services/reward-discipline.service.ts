import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export enum RewardDisciplineType {
    REWARD = 'REWARD',
    DISCIPLINE = 'DISCIPLINE',
}

export interface RewardDiscipline {
    id: string;
    type: RewardDisciplineType;
    reason: string;
    form: string;
    decisionNumber?: string;
    decisionDate?: string;
    signDate?: string;
    signer?: string;
    employeeId: string;
}

export const RewardDisciplineService = {
    getAllByEmployee: async (employeeId: string, type?: RewardDisciplineType) => {
        const response = await axios.get(`${API_URL}/reward-discipline`, { params: { employeeId, type } });
        return response.data;
    },

    create: async (data: Partial<RewardDiscipline>) => {
        const response = await axios.post(`${API_URL}/reward-discipline`, data);
        return response.data;
    },

    update: async (id: string, data: Partial<RewardDiscipline>) => {
        const response = await axios.patch(`${API_URL}/reward-discipline/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axios.delete(`${API_URL}/reward-discipline/${id}`);
        return response.data;
    }
};
