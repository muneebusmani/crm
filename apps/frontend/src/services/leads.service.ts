// /** biome-ignore-all lint/style/noNonNullAssertion: <idk> */
// import type {
//   ApiResponse,
//   CreateLeadDto,
//   Lead,
//   UpdateLeadDto,
// } from "@crm/types";
//
// import { apiFetch } from "../app/lib/apiClient";
//
// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
//
// export const leadsApi = {
//   // Get all leads
//   getAll: async (): Promise<Lead[]> => {
//     const result: ApiResponse<Lead[]> = await apiFetch("/leads", {
//       method: "GET",
//     });
//
//     if (!result.success) {
//       throw new Error(result.error || "Failed to fetch leads");
//     }
//
//     return result.data || [];
//   },
//
//   // Get a single lead
//   getOne: async (id: number): Promise<Lead> => {
//     const response = await fetch(`${API_BASE_URL}/leads/${id}`);
//     const result: ApiResponse<Lead> = await response.json();
//
//     if (!result.success) {
//       throw new Error(result.error || "Failed to fetch lead");
//     }
//
//     return result.data!;
//   },
//
//
//   getById: async (id: number): Promise<Lead> => {
//     const response = await apiFetch(`${API_BASE_URL}/dealers/leads/${id}`, {
//       method : "GET"
//     });
//
//     if (!response.success) {
//       throw new Error(response.error || "Failed to fetch lead");
//     }
//
//     return response.data!;
//   },
//
//
//
//
//   // Create a new lead
//   create: async (leadData: CreateLeadDto): Promise<Lead> => {
//
//     const response = await fetch(`${API_BASE_URL}/leads`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(leadData),
//     });
//
//     const result: ApiResponse<Lead> = await response.json();
//
//     if (!result.success) {
//       throw new Error(result.error || "Failed to create lead");
//     }
//
//     return result.data!;
//   },
//
//   // Update a lead
//   update: async (leadData: UpdateLeadDto): Promise<Lead> => {
//     const response = await fetch(`${API_BASE_URL}/leads`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(leadData),
//     });
//
//     const result: ApiResponse<Lead> = await response.json();
//
//     if (!result.success) {
//       throw new Error(result.error || "Failed to update lead");
//     }
//
//     return result.data!;
//   },
//
//   // Delete a lead
//   delete: async (id: number): Promise<void> => {
//     const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
//       method: "DELETE",
//     });
//
//     const result: ApiResponse<any> = await response.json();
//
//     if (!result.success) {
//       throw new Error(result.error || "Failed to delete lead");
//     }
//   },
// };
import type { CreateLeadDto, Lead, UpdateLeadDto } from '@crm/types';
import * as api from '@lib/api';
import { handleResponse } from './response.service';
import { leadMessagesApi } from './lead-messages.service';

const LEADS_BASE = '/leads';

export const leadsApi = {
  getAll: async (): Promise<Lead[]> =>
    handleResponse(api.get(LEADS_BASE)),

  getOne: async (id: number): Promise<Lead> =>
    handleResponse(api.get(`${LEADS_BASE}/${id}`)),

  create: async (leadData: CreateLeadDto): Promise<Lead> =>
    handleResponse(api.post(LEADS_BASE, leadData)),

  update: async (leadData: UpdateLeadDto): Promise<Lead> =>
    handleResponse(api.put(LEADS_BASE, leadData)),

  delete: async (id: number): Promise<void> =>
    handleResponse(api.del(`${LEADS_BASE}/${id}`), true),
    
  // Get uncontacted leads (leads that don't have any messages yet)
  getUncontacted: async (): Promise<Lead[]> => {
    try {
      // Fetch all leads
      const allLeads = await handleResponse(api.get(LEADS_BASE) as Promise<{ success: boolean; data: Lead[] }>);
      
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
      return allLeads.filter((lead) => lead.id !== undefined && !contactedLeadIds.has(lead.id));
    } catch (error) {
      console.error('Error fetching uncontacted leads:', error);
      throw error;
    }
  },
};
