import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface DashboardStats {
    counts: {
        employees: number;
        units: number;
        partyMembers: number;
        rewardsYear: number;
        disciplinesYear: number;
    };
    degreeStats: { name: string; value: number }[];
    ageStats: { name: string; value: number }[];
    genderStats: { name: string; value: number }[];
}

export const ReportsService = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        const res = await axios.get(`${API_URL}/reports/dashboard-stats`);
        return res.data;
    },
    getEmployeeReport: async () => {
        const res = await axios.get(`${API_URL}/reports/employee-list`);
        return res.data;
    },
    getPartyMembers: async () => {
        const res = await axios.get(`${API_URL}/reports/party-members`);
        return res.data;
    },
    getSalaryIncreaseDue: async () => {
        const res = await axios.get(`${API_URL}/reports/salary-increase-due`);
        return res.data;
    },
    getEmployeesByUnit: async (unitId?: string) => {
        const res = await axios.get(`${API_URL}/reports/employees-by-unit`, { params: { unitId } });
        return res.data;
    },
    getExpiringContracts: async (days: number = 60) => {
        const res = await axios.get(`${API_URL}/reports/expiring-contracts`, { params: { days } });
        return res.data;
    },
    getAllContracts: async () => {
        const res = await axios.get(`${API_URL}/reports/all-contracts`);
        return res.data;
    },
    getAllSalaries: async () => {
        const res = await axios.get(`${API_URL}/reports/all-salaries`);
        return res.data;
    }
};
