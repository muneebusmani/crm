export interface LeadNote {
  id: number;
  lead_id: number;
  company_user_id: number;
  content: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadNoteDto {
  content: string;
}

export interface UpdateLeadNoteDto {
  content: string;
}
