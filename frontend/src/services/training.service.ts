import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Degree {
    id: string;
    classification: string;
    level: { id: string; name: string; code: string };
    field: { id: string; name: string; code: string };
    major: string;
    institution: string;
    country?: string;
    mode?: string;
    year?: number;
    ranking?: string;
    degreeNumber?: string;
    signDate?: string;
    scanUrl?: string;
    employeeId: string;
}

export interface Certificate {
    id: string;
    type: string;
    name: string;
    issuer: string;
    issueDate?: string;
    expiryDate?: string;
    result?: string;
    scanUrl?: string;
    employeeId: string;
}

export const TrainingService = {
    // --- Levels & Fields ---
    getLevels: async () => {
        const res = await axios.get(`${API_URL}/training/levels`);
        return res.data;
    },

    getFields: async () => {
        const res = await axios.get(`${API_URL}/training/fields`);
        return res.data;
    },

    // --- Degrees ---
    getDegrees: async (employeeId: string) => {
        const res = await axios.get(`${API_URL}/training/degrees`, { params: { employeeId } });
        return res.data;
    },

    createDegree: async (data: any) => {
        const res = await axios.post(`${API_URL}/training/degrees`, data);
        return res.data;
    },

    updateDegree: async (id: string, data: any) => {
        const res = await axios.patch(`${API_URL}/training/degrees/${id}`, data);
        return res.data;
    },

    deleteDegree: async (id: string) => {
        const res = await axios.delete(`${API_URL}/training/degrees/${id}`);
        return res.data;
    },

    // --- Certificates ---
    getCertificates: async (employeeId: string) => {
        const res = await axios.get(`${API_URL}/training/certificates`, { params: { employeeId } });
        return res.data;
    },

    createCertificate: async (data: any) => {
        const res = await axios.post(`${API_URL}/training/certificates`, data);
        return res.data;
    },

    updateCertificate: async (id: string, data: any) => {
        const res = await axios.patch(`${API_URL}/training/certificates/${id}`, data);
        return res.data;
    },

    deleteCertificate: async (id: string) => {
        const res = await axios.delete(`${API_URL}/training/certificates/${id}`);
        return res.data;
    },

    // --- File Upload ---
    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`${API_URL}/training/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data.url;
    }
};
