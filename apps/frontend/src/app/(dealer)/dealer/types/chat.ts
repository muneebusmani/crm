export interface MessageBase {
  id: string;
  type: 'text' | 'quotation';
  sender: 'user' | 'other';
  timestamp: Date | string;
  senderName?: string;
}

export interface TextMessage extends MessageBase {
  type: 'text';
  text: string;
}

export interface QuotationMessage extends MessageBase {
  type: 'quotation';
  subject: string;
  message: string;
  price: number;
  status?: 'pending' | 'accepted' | 'rejected';
}

export type Message = TextMessage | QuotationMessage;

export type ChatContextType = {
  messages: Message[];
  addMessage: (text: string) => void;
  isLoading: boolean;
};
