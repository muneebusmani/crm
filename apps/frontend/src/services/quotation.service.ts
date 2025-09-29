import type { ApiResponse, Quotation } from '@crm/types';
import { handleResponse } from '@/services/response.service';
import { get, post } from '@/lib/api';

export interface CreateQuotationParams {
  leadId: number;
  subject: string;
  message: string;
  quotationPrice: number;
}

export const quotationsApi = {
  async createQuotation(params: CreateQuotationParams) {
    return handleResponse(
      post<Quotation, CreateQuotationParams>('/dealers/quotations', params),
    );
  },
  async getQuotations(leadId?: number) {
    const url = leadId
      ? `/dealers/quotations?leadId=${leadId}`
      : '/dealers/quotations';
    return handleResponse(get<ApiResponse<Quotation[]>>(url));
  },

  async getQuotation(id: number) {
    return handleResponse(
      get<ApiResponse<Quotation>>(`/dealers/quotations/${id}`),
    );
  },
};
