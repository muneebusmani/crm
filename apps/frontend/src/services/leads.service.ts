import type { CreateLeadDto, Lead, UpdateLeadDto } from '@crm/types';
import * as api from '@lib/api';
import { leadMessagesApi } from './lead-messages.service';
import { handleResponse } from './response.service';

const LEADS_BASE = '/leads';

export const leadsApi = {
  getAll: async (): Promise<Lead[]> => handleResponse(api.get(LEADS_BASE), false, false),

  getOne: async (id: number): Promise<Lead> =>
    handleResponse(api.get(`${LEADS_BASE}/${id}`), false, false),

  create: async (leadData: CreateLeadDto): Promise<Lead> =>
    handleResponse(api.post2(LEADS_BASE, leadData), false, false),

  update: async (leadData: UpdateLeadDto): Promise<Lead> =>
    handleResponse(api.put(LEADS_BASE, leadData), false, true),

  delete: async (id: number): Promise<void> =>
    handleResponse(api.del(`${LEADS_BASE}/${id}`), true, true),

  // Get uncontacted leads (leads that don't have any messages yet)
  getUncontacted: async (): Promise<Lead[]> => {
    try {
      // Fetch all leads
      const allLeads = await handleResponse(
        api.get(LEADS_BASE) as Promise<Lead[]>,
        false,
        false
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
