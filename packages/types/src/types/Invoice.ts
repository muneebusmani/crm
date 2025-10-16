export interface InvoiceItemResponse {
  id: string; // assuming DB-generated
  productName: string;
  productDetails?: string;
  unitPrice: number;
  quantity: number;
  total: number; // computed (unitPrice * quantity)
}

// Invoice Response
export interface InvoiceResponse {
  id: string;
  invoiceNumber: string;
  leadId: string;
  date: Date; // ISO string
  items: InvoiceItemResponse[];
  taxAmount: number;
  subTotal: number;
  grandTotal: number;
  status: 'PENDING' | 'SENT' | 'PAID' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

