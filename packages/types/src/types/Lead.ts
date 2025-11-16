// packages/types/src/lead.ts

export interface Lead {
  id: number;
  number: string;
  vehicle_model?: string;
  vehicle_reg?: string;
  vehicle_brand?: string;
  vehicle_title?: string;
  vehicle_vrm?: string;
  vehicle_series?: string;
  vehicle_part?: string;
  engin_capacity?: string;
  fuelType?: string;
  part_supplied?: string;
  supply_only?: string;
  consider_both?: string;
  reconditioned_condition?: string;
  used_condition?: string;
  new_condition?: string;
  consider_all_condition?: string;
  postcode?: string;
  vehicle_drive?: string;
  collection_required?: string;
  email?: string;
  name?: string;
  description?: string;
  engine_code?: string;
  source?: string;
  status?: string;
  assigned_to?: string;
  follow_up_date?: Date;
  notes?: string;
  wonByDealerId?: number;
  createdAt?: string;
  updatedAt?: string;
}
