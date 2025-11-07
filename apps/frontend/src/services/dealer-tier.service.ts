import { get } from '@/lib/api';
import { handleResponse } from './response.service';
const DEALER_TIER_BASE = '/dealer-tiers';

export type DealerTier = {
  id: number;
  name: string;
  creditLimit: number;
  defaultCredit: number;
};

export const dealerTierApi = {
  // Fetch all dealer tiers
  getAll: async (): Promise<DealerTier[]> => {
    return handleResponse(get(`${DEALER_TIER_BASE}`), false, false);
  },

  // Fetch a single dealer tier by ID
  getById: async (id: number): Promise<DealerTier> => {
    return handleResponse(get(`${DEALER_TIER_BASE}/${id}`), false, false);
  },
};
