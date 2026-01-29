import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export interface User {
    id: string;
    username: string;
    role: string;
    isActive: boolean;
    employeeId: string;
    roles?: { id: string; name: string }[];
}

export const getUsers = async () => {
    const response = await axios.get(`${API_URL}/users`, { headers: getAuthHeader() });
    return response.data;
};

export const createUser = async (user: any) => {
    const response = await axios.post(`${API_URL}/users`, user, { headers: getAuthHeader() });
    return response.data;
};

export const assignRoles = async (userId: string, roleIds: string[]) => {
    const response = await axios.post(`${API_URL}/users/${userId}/assign-roles`, { roleIds }, { headers: getAuthHeader() });
    return response.data;
};
