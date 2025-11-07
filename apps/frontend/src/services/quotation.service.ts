import { get, post } from '@lib/api';
import type { ApiResponse } from '@crm/types';

export interface QuotationItemDto {
  productName: string;
  unitPrice: number;
  quantity: number;
  discount?: number;
  taxAmount?: number;
}

export interface CreateQuotationDto {
  leadId: number;
  sellerNote: string;
  date: string; // ISO
  taxAmount: number;
  items: QuotationItemDto[];
}

export interface QuotationResponseDTO {
  id: number | string;
  lead?: { id: number; name?: string };
  date: string;
  items: Array<{
    id: number | string;
    productName: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }>;
  taxAmount: number;
  subTotal: number;
  grandTotal: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const BASE = '/quotations';

export const quotationsApi = {
  async create(dto: CreateQuotationDto): Promise<QuotationResponseDTO> {
    const response = await post<QuotationResponseDTO, CreateQuotationDto>(
      BASE,
      dto,
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create quotation');
    }
    return response.data;
  },
  async getAll(): Promise<QuotationResponseDTO[]> {
    const response = await get<ApiResponse<QuotationResponseDTO[]>>(BASE);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch quotations');
    }
    return response.data;
  },
};
