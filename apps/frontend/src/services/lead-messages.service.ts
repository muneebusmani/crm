// Define types based on backend implementation
import { get, post, put, del } from '@lib/api';

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

// Define the API response type
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  results?: T; // Some APIs use 'results' instead of 'data'
  error?: string;
  [key: string]: unknown; // Allow for additional properties
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
  if (!response) {
    console.error('No response received');
    throw new Error('No response received from server');
  }

  if (!response.success) {
    const errorMsg = response.error || 'Request failed';
    console.error('API Error:', errorMsg);
    throw new Error(errorMsg);
  }

  // Check for data in different possible locations
  if (Array.isArray(response.data)) {
    return response.data as unknown as T;
  }

  if (Array.isArray(response.results)) {
    return response.results as unknown as T;
  }

  if (Array.isArray(response)) {
    return response as unknown as T;
  }

  if (response.data !== undefined) {
    return response.data as T;
  }

  if (response.results !== undefined) {
    return response.results as T;
  }

  if (allowNoData) {
    return undefined as unknown as T;
  }

  console.error('No data in response:', response);
  throw new Error('No data returned from server');
}

export const leadMessagesApi = {
  // Get all messages for a specific lead
  getByLead: async (leadId: number): Promise<LeadMessage[]> => {
    try {
      const response = await get<ApiResponse<LeadMessage[]>>(
        `${LEAD_MESSAGES_BASE}/${leadId}`,
      );

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
    try {
      const response =
        await get<ApiResponse<LeadMessage[]>>(LEAD_MESSAGES_BASE);

      // If the response is already an array, return it directly
      if (Array.isArray(response)) {
        console.log('Response is already an array, returning as is');
        return response;
      }

      // Handle the case where response is an object with a data property
      if (response && Array.isArray(response.data)) {
        console.log('Found messages in response.data');
        return response.data;
      }

      // Handle the case where response is an object with a results property
      if (response && Array.isArray(response.results)) {
        console.log('Found messages in response.results');
        return response.results;
      }

      console.warn('Unexpected response format, returning empty array');
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
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
      const response = await post<CreateMessageResponse, CreateLeadMessageDto>(
        LEAD_MESSAGES_BASE,
        createMessageData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

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
          type: string;
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
          dealer: messageData.dealer
            ? { id: messageData.dealer.id }
            : undefined,
          type: messageData.type,
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
    return result as unknown as LeadMessage;
  },

  // Delete a message
  delete: async (id: number): Promise<void> => {
    const response = await del<ApiResponse<void>>(
      `${LEAD_MESSAGES_BASE}/${id}`,
    );
    const result = await response;
    await handleResponse(result, true);
  },

  // Format message for UI

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
