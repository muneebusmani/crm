// Define types based on backend implementation
type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

type CreateLeadMessageDto = {
  content: string;
  leadId: number;
};

type UpdateLeadMessageDto = {
  content?: string;
};

type LeadMessage = {
  id: number;
  content: string;
  leadId: number;
  dealerId: number;
  createdAt: string;
  updatedAt: string;
};

import type { Message } from '@dealer/types/chat';
import { get, post, put, del } from '@/lib/api';

const LEAD_MESSAGES_BASE = '/lead-messages';

async function handleResponse<T>(
  response: ApiResponse<T>,
  allowNoData = false,
): Promise<T>
{
  if ( !response.success )
  {
    throw new Error( response.error || 'API request failed' );
  }
  if ( !allowNoData && ( response.data === undefined || response.data === null ) )
  {
    throw new Error( 'API returned no data' );
  }
  // The backend returns the data directly in the response
  // So we return the response itself when data is not available
  return ( response.data || response ) as T;
}

export const leadMessagesApi = {
  // Get all messages for a specific lead
  getByLead: async ( leadId: number ): Promise<LeadMessage[]> =>
  {
    const response = await get<ApiResponse<LeadMessage[]>>(
      `${LEAD_MESSAGES_BASE}/lead/${leadId}`,
    );
    return handleResponse( response );
  },

  // Get all messages (admin function)
  getAll: async (): Promise<LeadMessage[]> =>
  {
    const response = await get<ApiResponse<LeadMessage[]>>( LEAD_MESSAGES_BASE );
    return handleResponse( response );
  },

  // Get messages for specific lead and dealer combination
  getOne: async ( leadId: number ): Promise<LeadMessage[]> =>
  {
    const response = await get<ApiResponse<LeadMessage[]>>(
      `${LEAD_MESSAGES_BASE}/${leadId}`,
    );
    return handleResponse( response );
  },

  // Create a new message
  create: async (
    createMessageData: CreateLeadMessageDto,
  ): Promise<LeadMessage> => {
    try {
      console.log("Sending message data:", createMessageData);
      const response = await post<ApiResponse<LeadMessage>, CreateLeadMessageDto>(
        LEAD_MESSAGES_BASE,
        createMessageData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log("Response from server:", response);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // The backend returns the created message in the data field
      if (!response.data) {
        throw new Error('No data in response');
      }
      
      // The response.data should already be of type LeadMessage
      const messageResponse = response.data as unknown as LeadMessage;
      
      // Ensure all required fields are present
      if (!messageResponse.id || !messageResponse.content || messageResponse.leadId === undefined) {
        console.error('Incomplete message data received:', messageResponse);
        throw new Error('Incomplete message data received from server');
      }
      
      return {
        id: messageResponse.id,
        content: messageResponse.content,
        leadId: messageResponse.leadId,
        dealerId: messageResponse.dealerId || 0,
        createdAt: messageResponse.createdAt || new Date().toISOString(),
        updatedAt: messageResponse.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  },

  // Update an existing message
  update: async (
    id: number,
    messageData: UpdateLeadMessageDto,
  ): Promise<LeadMessage> =>
  {
    const response = await put<ApiResponse<LeadMessage>, UpdateLeadMessageDto>(
      `${LEAD_MESSAGES_BASE}/${id}`,
      messageData,
    );
    const result = await response;
    // The backend returns the updated message directly
    return result as unknown as LeadMessage;
  },

  // Delete a message
  delete: async ( id: number ): Promise<void> =>
  {
    const response = await del<ApiResponse<void>>( `${LEAD_MESSAGES_BASE}/${id}` );
    const result = await response;
    await handleResponse( result, true );
  },

  // Format message for UI
  formatMessage( message: LeadMessage, isCurrentUser: boolean ): Message
  {
    // Parse the timestamp from the message
    const timestamp = message.updatedAt || message.createdAt;
    const formattedTimestamp = timestamp ? new Date( timestamp ) : new Date();

    return {
      id: message.id.toString(),
      text: message.content,
      sender: isCurrentUser ? 'user' : 'other',
      timestamp: formattedTimestamp,
      senderName: isCurrentUser ? 'You' : 'Dealer',
    };
  },

  // Format chat list item from lead data
  formatChatItem: ( lead: {
    id: number | string;
    name?: string;
    email?: string;
    lastMessage?: string;
    updatedAt?: string | Date | null;
  } ) => ( {
    id: lead.id.toString(),
    name: lead.name || lead.email || 'Unknown Lead',
    lastMessage: lead.lastMessage || 'No messages yet',
    timestamp: lead.updatedAt
      ? new Date( lead.updatedAt ).toLocaleTimeString( [], {
        hour: '2-digit',
        minute: '2-digit',
      } )
      : '--:--',
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      lead.name || lead.email || 'U'
    )}&background=3f51b5&color=ffffff&type=png`,
  } ),
};
