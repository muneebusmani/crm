export interface CompanyUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  is_default: boolean;
  dealer_id: number;
  created_at: Date;
  updated_at: Date;
}
