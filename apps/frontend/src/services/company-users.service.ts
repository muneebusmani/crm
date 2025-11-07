import { handleResponse } from '@/services/response.service';
import * as api from '@lib/api';

const BASE = '/company-users';

export interface CompanyUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  isProfile?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const companyUsersApi = {
  getAll: async (): Promise<CompanyUser[]> => {
    return handleResponse(
      api.get<CompanyUser[]>(BASE, true),
      false,
      false
    );
  },

  getOne: async (id: number): Promise<CompanyUser> => {
    return handleResponse(
      api.get<CompanyUser>(`${BASE}/${id}`, true),
      false,
      false
    );
  },

  create: async (data: Partial<CompanyUser>): Promise<CompanyUser> => {
    return handleResponse(
      api.post<CompanyUser, Partial<CompanyUser>>(BASE, data),
      false,
      true
    );
  },

  update: async (id: number, data: Partial<CompanyUser>): Promise<CompanyUser> => {
    return handleResponse(
      api.put<CompanyUser, Partial<CompanyUser>>(`${BASE}/${id}`, data),
      false,
      true
    );
  },

  delete: async (id: number): Promise<void> => {
    await handleResponse(
      api.del(`${BASE}/${id}`),
      true,
      true
    );
  },
};