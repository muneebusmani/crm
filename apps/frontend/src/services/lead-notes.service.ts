import type { CreateLeadNoteDto, LeadNote, UpdateLeadNoteDto } from '@crm/types';
import * as api from '@lib/api';
import { handleResponse } from './response.service';

const NOTES_BASE = '/leads';

export const leadNotesApi = {
  // Get notes for a specific lead
  getByLeadId: async (leadId: number, profileId: number): Promise<LeadNote[]> => {
    return handleResponse(
      api.get(`${NOTES_BASE}/${leadId}/${profileId}/notes`, true),
      false,
      false
    );
  },

  // Create a new note for a lead
  create: async (leadId: number, profileId: number, noteData: CreateLeadNoteDto): Promise<LeadNote> => {
    return handleResponse(
      api.post<LeadNote, CreateLeadNoteDto>(
        `${NOTES_BASE}/${leadId}/${profileId}/notes`,
        noteData
      ),
      false,
      true
    );
  },

  // Update an existing note
  update: async (profileId: number, noteId: number, noteData: UpdateLeadNoteDto): Promise<LeadNote> => {
    return handleResponse(
      api.patch<LeadNote, UpdateLeadNoteDto>(
        `${NOTES_BASE}/${profileId}/notes/${noteId}`,
        noteData
      ),
      false,
      true
    );
  },

  // Delete a note
  delete: async (profileId: number, noteId: number): Promise<void> => {
    await handleResponse(
      api.del(`${NOTES_BASE}/${profileId}/notes/${noteId}`),
      true,
      true
    );
  },
};