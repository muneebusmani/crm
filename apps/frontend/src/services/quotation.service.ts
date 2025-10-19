import { handleResponse } from '@/services/response.service';
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
    return handleResponse(
      post<QuotationResponseDTO, CreateQuotationDto>(BASE, dto),
    );
  },
  async getAll(): Promise<QuotationResponseDTO[]> {
    return handleResponse(get<ApiResponse<QuotationResponseDTO[]>>(BASE));
  },
};
