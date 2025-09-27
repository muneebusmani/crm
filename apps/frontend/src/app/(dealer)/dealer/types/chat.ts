export interface MessageBase {
  id: string;
  // The actual content of the message
  content: string;
  // The type of message
  type: 'message' | 'quotation';
  // When the message was created
  createdAt: string | Date;
  // Who sent the message (dealer or lead)
  sender: 'user' | 'other';
  // Optional sender name
  senderName?: string;
  // Additional fields for quotations
  price?: number;
  status?: 'pending' | 'accepted' | 'rejected';
  // Original message data from API
  dealer?: {
    id: number;
    name: string;
    email: string;
  };
  lead?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface TextMessage extends MessageBase {
  type: 'message';
}

export interface QuotationMessage {
  type: 'quotation';
  price: number;
  status: 'pending' | 'accepted' | 'rejected';
  subject: string;
  message: string;
}

export type Message = TextMessage | QuotationMessage;

export type ChatContextType = {
  messages: Message[];
  addMessage: (text: string) => void;
  isLoading: boolean;
};
