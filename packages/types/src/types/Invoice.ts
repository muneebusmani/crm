export interface InvoiceItemResponse {
  id: string;
  productName: string;
  productDetails?: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  taxAmount: number;
  totalPrice: number;
  subTotal: number;
}

// Invoice Response
export interface InvoiceResponse {
  id: string;
  invoiceNumber: string;
  lead?: any; // Lead relation
  date: Date;
  items: InvoiceItemResponse[];
  taxAmount: number;
  subTotal: number;
  grandTotal: number;
  sellerNote?: string;
  status: 'PENDING' | 'SENT' | 'PAID' | 'CANCELLED';
  createdAt: Date;
}
