import { handleResponse } from '@/services/response.service';
import { get, post } from '@lib/api';
import type { ApiResponse } from '@crm/types';

export interface InvoiceItemDto {
  productName: string;
  productDetails?: string;
  unitPrice: number;
  quantity: number;
  discount?: number;
  taxAmount?: number;
}

export interface CreateInvoiceDto {
  leadId: number;
  sellerNote: string;
  date: string; // ISO
  taxAmount: number;
  items: InvoiceItemDto[];
}

export interface InvoiceResponseDTO {
  id: number | string;
  lead?: { id: number; name?: string };
  date: string;
  items: Array<{
    id: number | string;
    productName: string;
    productDetails?: string;
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

const BASE = '/invoices';

export const invoicesApi = {
  async create(dto: CreateInvoiceDto): Promise<InvoiceResponseDTO> {
    return handleResponse(post<InvoiceResponseDTO, CreateInvoiceDto>(BASE, dto));
  },
  async getAll(): Promise<InvoiceResponseDTO[]> {
    return handleResponse(get<ApiResponse<InvoiceResponseDTO[]>>(BASE));
  },
};
