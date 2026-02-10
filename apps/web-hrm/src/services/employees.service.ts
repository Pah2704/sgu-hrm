import api from '@/lib/api';
import { Employee, EmployeeQuery, EmployeeResponse, CreateEmployeeDto } from '@/types/employee';

export const employeesService = {
  getAll: async (params?: EmployeeQuery) => {
    const { data } = await api.get<EmployeeResponse>('/employees', { params });
    return data;
  },

  getOne: async (id: string) => {
    const { data } = await api.get<Employee>(`/employees/${id}`);
    return data;
  },

  create: async (data: CreateEmployeeDto) => {
    const response = await api.post<Employee>('/employees', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateEmployeeDto>) => {
    const response = await api.patch<Employee>(`/employees/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch<Employee>(`/employees/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/employees/${id}`);
  },
};
