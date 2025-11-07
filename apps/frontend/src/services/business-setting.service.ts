import { handleResponse } from '@/services/response.service';
import * as api from '@lib/api';

const BASE = '/business-setting';

export interface BusinessSetting {
  id: number;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessLogo: string;
  taxRate: number;
  businessDescription: string;
  createdAt: string;
  updatedAt: string;
}

export const businessSettingApi = {
  getAll: async (): Promise<BusinessSetting[]> => {
    return handleResponse(
      api.get<BusinessSetting[]>(BASE, true),
      false,
      false
    );
  },

  getOne: async (id: number): Promise<BusinessSetting> => {
    return handleResponse(
      api.get<BusinessSetting>(`${BASE}/${id}`, true),
      false,
      false
    );
  },

  create: async (data: Partial<BusinessSetting>): Promise<BusinessSetting> => {
    return handleResponse(
      api.post<BusinessSetting, Partial<BusinessSetting>>(BASE, data),
      false,
      true
    );
  },

  update: async (id: number, data: Partial<BusinessSetting>): Promise<BusinessSetting> => {
    return handleResponse(
      api.put<BusinessSetting, Partial<BusinessSetting>>(`${BASE}/${id}`, data),
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