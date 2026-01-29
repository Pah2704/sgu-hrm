import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export interface Permission {
    id: string;
    action: string;
    description: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    isSystem: boolean;
    permissions: Permission[];
}

export const getPermissions = async () => {
    const response = await axios.get(`${API_URL}/roles/permissions`, { headers: getAuthHeader() });
    return response.data;
};

export const getRoles = async () => {
    const response = await axios.get(`${API_URL}/roles`, { headers: getAuthHeader() });
    return response.data;
};

export const createRole = async (role: Partial<Role>) => {
    const response = await axios.post(`${API_URL}/roles`, role, { headers: getAuthHeader() });
    return response.data;
};

export const updateRole = async (id: string, role: Partial<Role> & { permissionIds?: string[] }) => {
    const response = await axios.patch(`${API_URL}/roles/${id}`, role, { headers: getAuthHeader() });
    return response.data;
};

export const deleteRole = async (id: string) => {
    const response = await axios.delete(`${API_URL}/roles/${id}`, { headers: getAuthHeader() });
    return response.data;
};
