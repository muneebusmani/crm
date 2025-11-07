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
  getAll: async (): Promise<BusinessSetting> => {
    const response = await api.get<any>(BASE);
    console.log('🔍 [Business Settings] GET response:', response);

    // Backend now returns ApiResponse<BusinessSetting>, not array
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch business settings');
  },

  getOne: async (id: number): Promise<BusinessSetting> => {
    return handleResponse(
      api.get<BusinessSetting>(`${BASE}/${id}`, true),
      false,
      false,
    );
  },

  create: async (data: Partial<BusinessSetting>): Promise<BusinessSetting> => {
    console.log('🔍 [Business Settings] Creating with data:', data);
    const response = await api.post<BusinessSetting, Partial<BusinessSetting>>(
      BASE,
      data,
    );
    console.log('🔍 [Business Settings] POST response:', response);

    // Backend returns ApiResponse<BusinessSetting>
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to save business settings');
  },

  update: async (
    id: number,
    data: Partial<BusinessSetting>,
  ): Promise<BusinessSetting> => {
    return handleResponse(
      api.put<BusinessSetting, Partial<BusinessSetting>>(`${BASE}/${id}`, data),
      false,
      true,
    );
  },

  delete: async (id: number): Promise<void> => {
    await handleResponse(api.del(`${BASE}/${id}`), true, true);
  },
};
