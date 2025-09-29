import type { Message } from '@dealer/types/chat';

export type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl: string;
};

export type MessagesByChatId = Record<string, Message[]>;

export type SendMessageArgs = {
  chatId: string;
  content: string;
};

export type EnsureChatFromLeadArgs = {
  leadId: number;
};

export type StartNewChatArgs = {
  leadId: string;
  leadData?: {
    name?: string;
    email?: string;
    vehicle_brand?: string;
    vehicle_model?: string;
  };
};

export interface ChatState {
  chats: ChatItem[];
  messagesByChatId: MessagesByChatId;
  currentChatId: string | null;
  loading: boolean;
  error: string | null;
}
