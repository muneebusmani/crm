import type {
  ApiResponse,
  CreateLeadMessageDto,
  LeadMessage,
  UpdateLeadMessageDto,
} from '@crm/types';
import * as api from '@/app/lib/api';

const LEAD_MESSAGES_BASE = '/lead-messages';

async function handleResponse<T>(
  promise: Promise<ApiResponse<T>>,
  allowNoData = false,
): Promise<T> {
  const result = await promise;
  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }
  if (!allowNoData && (result.data === undefined || result.data === null)) {
    throw new Error('API returned no data');
  }
  return result.data as T;
}

export const leadMessagesApi = {
  // Get all messages for a specific lead
  getByLead: async (leadId: number): Promise<LeadMessage[]> =>
    handleResponse(
      api.get<LeadMessage[]>(`${LEAD_MESSAGES_BASE}/lead/${leadId}`),
    ),

  // Get all messages (admin function)
  getAll: async (): Promise<LeadMessage[]> =>
    handleResponse(api.get<LeadMessage[]>(LEAD_MESSAGES_BASE)),

  // Get messages for specific lead and dealer combination
  getOne: async (leadId: number): Promise<LeadMessage[]> =>
    handleResponse(api.get<LeadMessage[]>(`${LEAD_MESSAGES_BASE}/${leadId}`)),

  // Create a new message
  create: async (messageData: CreateLeadMessageDto): Promise<LeadMessage> =>
    handleResponse(
      api.post<LeadMessage>(LEAD_MESSAGES_BASE, { data: messageData }),
    ),

  // Update an existing message
  update: async (
    id: number,
    messageData: UpdateLeadMessageDto,
  ): Promise<LeadMessage> =>
    handleResponse(
      api.patch<LeadMessage>(`${LEAD_MESSAGES_BASE}/${id}`, {
        data: messageData,
      }),
    ),

  // Delete a message
  delete: async (id: number): Promise<void> =>
    handleResponse(api.del<void>(`${LEAD_MESSAGES_BASE}/${id}`), true),
};
