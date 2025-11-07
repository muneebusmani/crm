import type {
  CreateLeadDto,
  Lead,
  UpdateLeadDto,
  ApiResponse,
} from '@crm/types';
import * as api from '@lib/api';
import { leadMessagesApi } from './lead-messages.service';
import { handleResponse } from './response.service';

const LEADS_BASE = '/leads';

export const leadsApi = {
  getAll: async (): Promise<Lead[]> => {
    const response = await api.get<ApiResponse<Lead[]>>(LEADS_BASE);
    return handleResponse(Promise.resolve(response), false, true);
  },

  getOne: async (id: number): Promise<Lead> => {
    const response = await api.get<ApiResponse<Lead>>(`${LEADS_BASE}/${id}`);
    return handleResponse(Promise.resolve(response), false, true);
  },

  create: async (leadData: CreateLeadDto): Promise<Lead> => {
    const response = await api.post2<ApiResponse<Lead>, CreateLeadDto>(
      LEADS_BASE,
      leadData,
    );
    return handleResponse(Promise.resolve(response), false, true);
  },

  update: async (leadData: UpdateLeadDto): Promise<Lead> => {
    const response = await api.put<Lead, UpdateLeadDto>(LEADS_BASE, leadData);
    return handleResponse(Promise.resolve(response), false, true);
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.del<void>(`${LEADS_BASE}/${id}`);
    return handleResponse(Promise.resolve(response), true, true);
  },

  // Get uncontacted leads (leads that don't have any messages yet)
  getUncontacted: async (): Promise<Lead[]> => {
    try {
      // Fetch all leads - now correctly handling ApiResponse format
      const allLeads = await handleResponse(
        api.get<ApiResponse<Lead[]>>(LEADS_BASE),
        false,
        true,
      );

      if (!Array.isArray(allLeads)) {
        console.error('Invalid leads data format:', allLeads);
        throw new Error('Invalid leads data format');
      }

      // Fetch all messages to find which leads have been contacted
      const allMessages = await leadMessagesApi.getAll();

      // Extract unique lead IDs that have messages
      const contactedLeadIds = new Set<number>();
      allMessages.forEach((message) => {
        const leadId = message.lead?.id;
        if (typeof leadId === 'number') {
          contactedLeadIds.add(leadId);
        }
      });

      // Filter out leads that have been contacted
      return allLeads.filter(
        (lead) => lead.id !== undefined && !contactedLeadIds.has(lead.id),
      );
    } catch (error) {
      console.error('Error fetching uncontacted leads:', error);
      throw error;
    }
  },
};
