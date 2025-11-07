// Define types based on backend implementation
import { get, post, put, del } from '@lib/api';
import { handleResponse } from './response.service';

// Define the base URL for lead messages
const LEAD_MESSAGES_BASE = '/lead-messages';

// Define the DTO for creating a new message
export type CreateLeadMessageDto = {
  content: string;
  leadId: number;
  dealerId?: number;
  [key: string]: unknown; // Use unknown instead of any for type safety
};

// Define the DTO for updating a message
export type UpdateLeadMessageDto = {
  content?: string;
};

// Define the message type
export interface LeadMessage {
  id: number;
  content: string;
  leadId: number;
  dealerId?: number;
  type: string;
  lead?: {
    id: number;
    [key: string]: unknown;
  };
  dealer?: {
    id: number;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export const leadMessagesApi = {
  // Get all messages for a specific lead
  getByLead: async (leadId: number): Promise<LeadMessage[]> => {
    try {
      const response = await handleResponse<LeadMessage[]>(
        get<LeadMessage[]>(`${LEAD_MESSAGES_BASE}/${leadId}`, true),
        false,
        false
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error in getByLead:', error);
      // Return empty array on error to prevent UI from breaking
      return [];
    }
  },

  // Get all messages (admin function)
  getAll: async (): Promise<LeadMessage[]> => {
    try {
      const response = await handleResponse<LeadMessage[]>(
        get<LeadMessage[]>(LEAD_MESSAGES_BASE, true),
        false,
        false
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  // Get messages for specific lead and dealer combination
  getOne: async (leadId: number): Promise<LeadMessage[]> => {
    return handleResponse<LeadMessage[]>(
      get<LeadMessage[]>(`${LEAD_MESSAGES_BASE}/${leadId}`, true),
      false,
      false
    );
  },

  // Create a new message
  create: async (
    createMessageData: CreateLeadMessageDto,
  ): Promise<LeadMessage> => {
    try {
      return handleResponse<LeadMessage>(
        post<LeadMessage, CreateLeadMessageDto>(
          LEAD_MESSAGES_BASE,
          createMessageData
        ),
        false,
        true
      );
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  },

  // Update an existing message
  update: async (
    id: number,
    messageData: UpdateLeadMessageDto,
  ): Promise<LeadMessage> => {
    return handleResponse<LeadMessage>(
      put<LeadMessage, UpdateLeadMessageDto>(
        `${LEAD_MESSAGES_BASE}/${id}`,
        messageData
      ),
      false,
      true
    );
  },

  // Delete a message
  delete: async (id: number): Promise<void> => {
    await handleResponse(
      del<void>(`${LEAD_MESSAGES_BASE}/${id}`),
      true,
      true
    );
  },

  // Format chat list item from lead data
  formatChatItem: (lead: {
    id: number | string;
    name?: string;
    email?: string;
    lastMessage?: string;
    updatedAt?: string | Date | null;
  }): {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    avatarUrl: string;
  } => {
    const name = lead.name || lead.email || 'Unknown Lead';
    const lastMessage = lead.lastMessage || 'No messages yet';
    const timestamp = lead.updatedAt
      ? new Date(lead.updatedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--:--';
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=3f51b5&color=ffffff&size=200`;

    return {
      id: lead.id.toString(),
      name,
      lastMessage,
      timestamp,
      avatarUrl,
    };
  },
};
