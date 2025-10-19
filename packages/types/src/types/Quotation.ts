export interface QuotationItemResponse {
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

export interface QuotationResponse {
  id: string;
  quotationNumber: string;
  lead?: any; // Lead relation
  date: Date;
  items: QuotationItemResponse[];
  taxAmount: number;
  subTotal: number;
  grandTotal: number;
  sellerNote?: string;
  status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: Date;
}

// Legacy interface - kept for backward compatibility
export interface Quotation {
  id: number;
  engineCodeName: string;
  dealershipName: string;
  quotationPrice: number;
  subject: string;
  message: string;
  dealer: {
    id: number;
    name: string;
  };
}
