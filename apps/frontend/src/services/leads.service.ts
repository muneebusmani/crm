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
import type {
  ApiResponse,
  CreateLeadDto,
  Lead,
  UpdateLeadDto,
} from "@crm/types";
import { api } from "../app/lib/api";

const LEADS_BASE = "/leads";

async function handleResponse<T>(
  promise: Promise<ApiResponse<T>>,
  allowNoData = false,
): Promise<T> {
  const result = await promise;
  if (!result.success) {
    throw new Error(result.error || "API request failed");
  }
  if (!allowNoData && (result.data === undefined || result.data === null)) {
    throw new Error("API returned no data");
  }
  return result.data as T;
}

export const leadsApi = {
  getAll: async (): Promise<Lead[]> =>
    handleResponse(api<Lead[]>(LEADS_BASE, { method: "GET" })),

  getOne: async (id: number): Promise<Lead> =>
    handleResponse(api<Lead>(`${LEADS_BASE}/${id}`, { method: "GET" })),

  create: async (leadData: CreateLeadDto): Promise<Lead> =>
    handleResponse(api<Lead>(LEADS_BASE, { method: "POST", data: leadData })),

  update: async (leadData: UpdateLeadDto): Promise<Lead> =>
    handleResponse(api<Lead>(LEADS_BASE, { method: "PUT", data: leadData })),

  delete: async (id: number): Promise<void> =>
    handleResponse(
      api<void>(`${LEADS_BASE}/${id}`, { method: "DELETE" }),
      true,
    ),
};
