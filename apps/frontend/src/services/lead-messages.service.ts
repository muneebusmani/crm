// Define types based on backend implementation
import type { Message } from '@dealer/types/chat';
import { get, post, put, del } from '@/lib/api';

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
interface LeadMessage {
  id: number;
  content: string;
  leadId: number;
  dealerId?: number;
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

// Define the API response type
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Define the create message response type
interface CreateMessageResponse {
  success: boolean;
  data?: {
    id: number;
    content: string;
    lead?: { 
      id: number;
      [key: string]: unknown;
    };
    dealer?: { 
      id: number;
      [key: string]: unknown;
    };
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
  };
  error?: string;
  [key: string]: unknown;
}

async function handleResponse<T>(
  response: ApiResponse<T>,
  allowNoData = false,
): Promise<T> {
  if (!response.success) {
    throw new Error(response.error || 'API request failed');
  }
  if (!allowNoData && (response.data === undefined || response.data === null)) {
    throw new Error('API returned no data');
  }
  // The backend returns the data directly in the response
  // So we return the response itself when data is not available
  return (response.data || response) as T;
}

export const leadMessagesApi = {
  // Get all messages for a specific lead
  getByLead: async (leadId: number): Promise<LeadMessage[]> => {
    try {
      console.log(`Fetching messages for lead ${leadId}...`);
      const response = await get<ApiResponse<LeadMessage[]>>(
        `${LEAD_MESSAGES_BASE}/lead/${leadId}`,
      );

      console.log('Raw API response for getByLead:', response);

      // Handle case where response is already an array
      if (Array.isArray(response)) {
        console.log('Response is already an array, returning as is');
        return response;
      }

      // Handle case where response has a data property
      if (response && typeof response === 'object' && 'data' in response) {
        console.log('Response has data property, returning data');
        return response.data || [];
      }

      // Handle case where response is in the ApiResponse format
      const result = await handleResponse(response);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error in getByLead:', error);
      // Return empty array on error to prevent UI from breaking
      return [];
    }
  },

  // Get all messages (admin function)
  getAll: async (): Promise<LeadMessage[]> => {
    const response = await get<ApiResponse<LeadMessage[]>>(LEAD_MESSAGES_BASE);
    return handleResponse(response);
  },

  // Get messages for specific lead and dealer combination
  getOne: async (leadId: number): Promise<LeadMessage[]> => {
    const response = await get<ApiResponse<LeadMessage[]>>(
      `${LEAD_MESSAGES_BASE}/${leadId}`,
    );
    return handleResponse(response);
  },

  // Create a new message
  create: async (
    createMessageData: CreateLeadMessageDto,
  ): Promise<LeadMessage> => {
    try {
      console.log('Sending message data:', createMessageData);

      const response = await post<CreateMessageResponse, CreateLeadMessageDto>(
        LEAD_MESSAGES_BASE,
        createMessageData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Response from server create:', response);

      if (!response) {
        throw new Error('No response from server');
      }

      // Check if the response has an error field
      if ('error' in response && response.error) {
        throw new Error(response.error);
      }

      // Check if we have the expected data structure
      if (response.data) {
        // First cast to unknown, then to the expected type
        const responseData = response.data as unknown;
        const messageData = responseData as {
          id: number;
          content: string;
          lead?: { id: number };
          dealer?: { id: number };
          createdAt?: string;
          updatedAt?: string;
        };
        
        // Verify the required fields exist
        if (typeof messageData !== 'object' || messageData === null) {
          throw new Error('Invalid response data format');
        }

        if (!messageData.id || !messageData.content) {
          console.error(
            'Invalid response format: missing required fields',
            messageData,
          );
          throw new Error('Invalid response format: missing required fields');
        }

        // Create the return object with proper typing
        const result: LeadMessage = {
          id: messageData.id,
          content: messageData.content,
          leadId: messageData.lead?.id ?? createMessageData.leadId,
          dealerId: messageData.dealer?.id ?? 0,
          lead: messageData.lead ? { id: messageData.lead.id } : undefined,
          dealer: messageData.dealer ? { id: messageData.dealer.id } : undefined,
          createdAt: messageData.createdAt ?? new Date().toISOString(),
          updatedAt: messageData.updatedAt ?? new Date().toISOString(),
        };

        return result;
      }

      // If we get here, the response format is unexpected
      console.error('Unexpected response format:', response);
      throw new Error('Unexpected response format from server');
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
    const response = await put<ApiResponse<LeadMessage>, UpdateLeadMessageDto>(
      `${LEAD_MESSAGES_BASE}/${id}`,
      messageData,
    );
    const result = await response;
    // The backend returns the updated message directly
    return result as unknown as LeadMessage;
  },

  // Delete a message
  delete: async (id: number): Promise<void> => {
    const response = await del<ApiResponse<void>>(`${LEAD_MESSAGES_BASE}/${id}`);
    const result = await response;
    await handleResponse(result, true);
  },

  // Format message for UI
  formatMessage(
    message: LeadMessage | null | undefined,
    isCurrentUser: boolean,
  ): Message {
    // Handle null or undefined message
    if (!message) {
      console.error('Invalid message provided to formatMessage:', message);
      return {
        id: `error-${Date.now()}`,
        text: 'Error: Invalid message format',
        sender: 'other',
        timestamp: new Date(),
        senderName: 'System',
      };
    }
    
    // At this point, TypeScript knows message is not null or undefined

    // Parse the timestamp from the message
    const timestamp = message.updatedAt || message.createdAt;
    let formattedTimestamp: Date;

    try {
      formattedTimestamp = timestamp ? new Date(timestamp) : new Date();
    } catch (error) {
      console.error('Error parsing timestamp:', timestamp, error);
      formattedTimestamp = new Date();
    }

    // Format the sender name
    const senderName = isCurrentUser
      ? 'You'
      : (message.dealer as { name?: string })?.name ?? 'Dealer';

    return {
      id: message.id?.toString() || `temp-${Date.now()}`,
      text: message.content || '',
      sender: isCurrentUser ? 'user' : 'other',
      timestamp: formattedTimestamp,
      senderName,
    };
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
