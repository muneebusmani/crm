import { handleResponse } from '@/services/response.service';
import * as api from '@lib/api';

const BASE = '/bank-details';

export interface BankDetail {
  id: number;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  bankName: string;
  createdAt: string;
  updatedAt: string;
}

export const bankDetailsApi = {
  getAll: async (): Promise<BankDetail[]> => {
    return handleResponse(
      api.get<BankDetail[]>(BASE, true),
      false,
      false
    );
  },

  getOne: async (id: number): Promise<BankDetail> => {
    return handleResponse(
      api.get<BankDetail>(`${BASE}/${id}`, true),
      false,
      false
    );
  },

  create: async (data: Partial<BankDetail>): Promise<BankDetail> => {
    return handleResponse(
      api.post<BankDetail, Partial<BankDetail>>(BASE, data),
      false,
      true
    );
  },

  update: async (id: number, data: Partial<BankDetail>): Promise<BankDetail> => {
    return handleResponse(
      api.put<BankDetail, Partial<BankDetail>>(`${BASE}/${id}`, data),
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