import { Dealer, Lead } from '@crm/types';

export interface Message {
  id: string;
  content: string;
  type: 'message' | 'quotation';
  createdAt: string;
  dealer?: Dealer;
  lead?: Lead;
}

export interface QuotationMessage {
  id: string;
  type: 'quotation';
  sender: string;
  timestamp: string; // ISO string from API
  senderName: string;
  status: 'pending' | 'accepted' | 'rejected';
  subject: string;
  message: string;
  price: number;
}
