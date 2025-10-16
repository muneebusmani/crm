import { get } from '@/lib/api';
const DEALER_TIER_BASE = '/dealer-tiers';

export type DealerTier = {
  id: number;
  name: string;
  creditLimit: number;
  defaultCredit: number;
};

export const dealerTierApi = {
  // Fetch all dealer tiers
  getAll: (): Promise<DealerTier[]> => {
    return get(`${DEALER_TIER_BASE}`);
  },

  // Fetch a single dealer tier by ID
  getById: (id: number): Promise<DealerTier> => {
    return get(`${DEALER_TIER_BASE}/${id}`);
  },
};
