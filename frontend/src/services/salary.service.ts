import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface SalaryProfile {
    id?: string;
    civilServantGrade: string;
    salaryGrade: number;
    coefficient: number;
    positionAllowance: number;
    otherAllowance: number;
    startDate: string;
}

export const SalaryService = {
    getProfile: async (employeeId: string) => {
        const response = await axios.get(`${API_URL}/salaries/${employeeId}`);
        return response.data;
    },

    updateProfile: async (employeeId: string, data: SalaryProfile) => {
        const response = await axios.post(`${API_URL}/salaries/${employeeId}`, data);
        return response.data;
    }
};
