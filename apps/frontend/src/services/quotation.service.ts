import { get, post } from '@/lib/api';

export interface CreateQuotationParams {
  leadId: number;
  subject: string;
  message: string;
  quotationPrice: number;
  items?: Array<{
    itemDescription: string;
    rate: number;
    quantity: number;
    discountPercent?: number;
    taxPercent?: number;
  }>;
}

export const quotationsApi = {
  async createQuotation(params: CreateQuotationParams) {
    const response = await post('/dealers/quotations', params);
    return response.data;
  },
  async getQuotations(leadId?: number) {
    const url = `/dealers/quotations/leads/${leadId}`;
    const response = await get(url);
    return response;
  },

  async getQuotation(id: number) {
    const response = await get(`/dealers/quotations/${id}`);
    return response;
  },
};
