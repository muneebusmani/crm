import type { CreateLeadDto, Lead, UpdateLeadDto } from '@crm/types';
import * as api from '@lib/api';
import { leadMessagesApi } from './lead-messages.service';
import { handleResponse } from './response.service';

const LEADS_BASE = '/leads';

export const leadsApi = {
  getAll: async (): Promise<Lead[]> => handleResponse(api.get(LEADS_BASE)),

  getAllPaginated: async (params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{
    data: Lead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const queryParams = new URLSearchParams();
    queryParams.set('page', params.page.toString());
    queryParams.set('limit', params.limit.toString());
    if (params.search) {
      queryParams.set('search', params.search);
    }
    return handleResponse(api.get(`${LEADS_BASE}?${queryParams.toString()}`));
  },

  getOne: async (id: number): Promise<Lead> =>
    handleResponse(api.get(`${LEADS_BASE}/${id}`)),

  create: async (leadData: CreateLeadDto): Promise<Lead> =>
    handleResponse(api.post(LEADS_BASE, leadData)),

  update: async (leadData: UpdateLeadDto): Promise<Lead> =>
    handleResponse(api.put(LEADS_BASE, leadData)),

  delete: async (id: number): Promise<void> =>
    handleResponse(api.del(`${LEADS_BASE}/${id}`), true),

  // Get HQ leads assigned to the current dealer
  getMyHqLeads: async (): Promise<Lead[]> =>
    handleResponse(api.get(`${LEADS_BASE}/hq/my-leads`)),

  // Get dealer's HQ lead quota status
  getMyHqQuota: async (): Promise<{
    canAssign: boolean;
    assignedCount: number;
    dailyLimit: number;
  }> => handleResponse(api.get(`${LEADS_BASE}/hq/my-quota`)),

  // Get uncontacted leads (leads that don't have any messages yet)
  getUncontacted: async (): Promise<Lead[]> => {
    try {
      // Fetch all leads
      const allLeads = await handleResponse(
        api.get(LEADS_BASE) as Promise<{ success: boolean; data: Lead[] }>,
      );

      if (!Array.isArray(allLeads)) {
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
