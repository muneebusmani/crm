/** biome-ignore-all lint/style/noNonNullAssertion: <idk> */
import type {
  ApiResponse,
  CreateLeadDto,
  Lead,
  UpdateLeadDto,
} from "@crm/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const leadsApi = {
  // Get all leads
  getAll: async (): Promise<Lead[]> => {
    const response = await fetch(`${API_BASE_URL}/leads`);
    const result: ApiResponse<Lead[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch leads");
    }

    return result.data || [];
  },

  // Get a single lead
  getOne: async (id: number): Promise<Lead> => {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`);
    const result: ApiResponse<Lead> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch lead");
    }

    return result.data!;
  },

  // Create a new lead
  create: async (leadData: CreateLeadDto): Promise<Lead> => {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    });

    const result: ApiResponse<Lead> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to create lead");
    }

    return result.data!;
  },

  // Update a lead
  update: async (leadData: UpdateLeadDto): Promise<Lead> => {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    });

    const result: ApiResponse<Lead> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to update lead");
    }

    return result.data!;
  },

  // Delete a lead
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: "DELETE",
    });

    const result: ApiResponse<any> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to delete lead");
    }
  },
};
