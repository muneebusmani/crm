import type { Message } from '@dealer/types/chat';

/**
 * Represents a chat item in the sidebar
 * @property {string} id - Unique identifier for the chat (usually lead ID as string)
 * @property {string} name - Display name for the chat (usually lead name)
 * @property {string} lastMessage - Preview of the last message in the chat
 * @property {string} timestamp - Formatted time of the last message
 * @property {string} avatarUrl - URL for the chat avatar (generated from lead name)
 */
export type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl: string;
};

/**
 * Mapped type to store messages by chat ID
 * @key {string} - Chat ID (lead ID as string)
 * @value {Message[]} - Array of messages in the chat
 */
export type MessagesByChatId = Record<string, Message[]>;

/**
 * Payload for sending a new message
 * @property {string} chatId - ID of the chat to send the message to
 * @property {string} content - The message content
 */
export type SendMessageArgs = {
  chatId: string;
  content: string;
};

/**
 * Payload for ensuring a chat exists for a lead
 * @property {number} leadId - The ID of the lead to create/load chat for
 */
export type EnsureChatFromLeadArgs = {
  leadId: number;
};

/**
 * Payload for starting a new chat
 * @property {string} leadId - ID of the lead for the new chat
 * @property {Object} [leadData] - Optional lead data for new leads
 * @property {string} [leadData.name] - Lead's name
 * @property {string} [leadData.email] - Lead's email
 * @property {string} [leadData.vehicle_brand] - Vehicle brand
 * @property {string} [leadData.vehicle_model] - Vehicle model
 */
export type StartNewChatArgs = {
  leadId: string;
  leadData?: {
    name?: string;
    email?: string;
    vehicle_brand?: string;
    vehicle_model?: string;
  };
};

/**
 * Shape of the chat state in Redux store
 * @property {ChatItem[]} chats - List of all available chats
 * @property {MessagesByChatId} messagesByChatId - Messages organized by chat ID
 * @property {string | null} currentChatId - ID of the currently active chat
 * @property {boolean} loading - Whether a chat operation is in progress
 * @property {string | null} error - Current error message, if any
 */
export interface ChatState {
  chats: ChatItem[];
  messagesByChatId: MessagesByChatId;
  currentChatId: string | null;
  loading: boolean;
  error: string | null;
}
