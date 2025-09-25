// Define types based on backend implementation
type ApiResponse<T = unknown> = {
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
  leadId?: number;
  dealerId?: number;
  lead?: {
    id: number;
    [ key: string ]: any;
  };
  dealer?: {
    id: number;
    [ key: string ]: any;
  };
  createdAt: string;
  updatedAt: string;
  [ key: string ]: any; // Allow additional properties
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
    try
    {
      console.log( `Fetching messages for lead ${leadId}...` );
      const response = await get<ApiResponse<LeadMessage[]>>(
        `${LEAD_MESSAGES_BASE}/lead/${leadId}`,
      );

      console.log( 'Raw API response for getByLead:', response );

      // Handle case where response is already an array
      if ( Array.isArray( response ) )
      {
        console.log( 'Response is already an array, returning as is' );
        return response;
      }

      // Handle case where response has a data property
      if ( response && typeof response === 'object' && 'data' in response )
      {
        console.log( 'Response has data property, returning data' );
        return response.data || [];
      }

      // Handle case where response is in the ApiResponse format
      const result = await handleResponse( response );
      return Array.isArray( result ) ? result : [];
    } catch ( error )
    {
      console.error( 'Error in getByLead:', error );
      // Return empty array on error to prevent UI from breaking
      return [];
    }
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
  ): Promise<LeadMessage> =>
  {
    try
    {
      console.log( "Sending message data:", createMessageData );

      // Define the response type that matches the API
      type MessageResponseData = {
        id: number;
        content: string;
        lead?: { id: number };
        dealer?: { id: number };
        createdAt?: string;
        updatedAt?: string;
      };

      type CreateMessageResponse = {
        success: boolean;
        data?: MessageResponseData;
        error?: string;
      };

      const response = await post<CreateMessageResponse, CreateLeadMessageDto>(
        LEAD_MESSAGES_BASE,
        createMessageData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log( "Response from server create:", response );

      if ( !response )
      {
        throw new Error( 'No response from server' );
      }

      // Check if the response has an error field
      if ( 'error' in response && response.error )
      {
        throw new Error( response.error );
      }

      // Check if we have the expected data structure
      if ( response.data )
      {
        const messageData = response.data;

        // Ensure we have the required fields
        const { id, content, lead, dealer, createdAt, updatedAt } = messageData;

        if ( id === undefined || content === undefined )
        {
          console.error( 'Invalid response format: missing required fields', messageData );
          throw new Error( 'Invalid response format: missing required fields' );
        }

        return {
          id,
          content,
          leadId: lead?.id || createMessageData.leadId,
          dealerId: dealer?.id || 0,
          lead,
          dealer,
          createdAt: createdAt || new Date().toISOString(),
          updatedAt: updatedAt || new Date().toISOString(),
        };
      }

      // If we get here, the response format is unexpected
      console.error( 'Unexpected response format:', response );
      throw new Error( 'Unexpected response format from server' );
    } catch ( error )
    {
      console.error( 'Error creating message:', error );
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
  formatMessage( message: LeadMessage | null | undefined, isCurrentUser: boolean ): Message
  {
    if ( !message )
    {
      console.error( 'Invalid message provided to formatMessage:', message );
      return {
        id: 'error-' + Date.now(),
        text: 'Error: Invalid message format',
        sender: 'other', // Use 'other' instead of 'system' to match the Message type
        timestamp: new Date(),
        senderName: 'System',
      };
    }

    // Parse the timestamp from the message
    const timestamp = message.updatedAt || message.createdAt;
    let formattedTimestamp: Date;

    try
    {
      formattedTimestamp = timestamp ? new Date( timestamp ) : new Date();
    } catch ( error )
    {
      console.error( 'Error parsing timestamp:', timestamp, error );
      formattedTimestamp = new Date();
    }

    return {
      id: message.id?.toString() || 'temp-' + Date.now(),
      text: message.content || '',
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
