
import { apiClient } from '@/lib/api-client';

export enum ContractType {
  HDLD_XAC_DINH = 'HDLD_XAC_DINH',
  HDLD_KHONG_XAC_DINH = 'HDLD_KHONG_XAC_DINH',
  HDLV = 'HDLV',
  THU_VIEC = 'THU_VIEC',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export interface Contract {
  id: string;
  contractNumber: string;
  contractType: ContractType;
  startDate: string;
  endDate?: string;
  signedDate?: string;
  status: ContractStatus;
  originalFileUrl?: string;
  signedFileUrl?: string;
  notes?: string;
  employeeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractDto {
  employeeId: string;
  contractNumber: string;
  contractType: ContractType;
  startDate: string;
  endDate?: string;
  signedDate?: string;
  notes?: string;
  status?: ContractStatus;
}

export type UpdateContractDto = Partial<CreateContractDto>;

export const contractsService = {
  getByEmployee: async (employeeId: string): Promise<Contract[]> => {
    const response = await apiClient.get<Contract[]>(`/contracts?employeeId=${employeeId}`);
    return response.data;
  },

  create: async (data: CreateContractDto): Promise<Contract> => {
    const response = await apiClient.post<Contract>('/contracts', data);
    return response.data;
  },

  update: async (id: string, data: UpdateContractDto): Promise<Contract> => {
    const response = await apiClient.patch<Contract>(`/contracts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/contracts/${id}`);
  },
};
