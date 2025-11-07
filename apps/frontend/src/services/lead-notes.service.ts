import type {
  CreateLeadNoteDto,
  LeadNote,
  UpdateLeadNoteDto,
  ApiResponse,
} from '@crm/types';
import * as api from '@lib/api';

const NOTES_BASE = '/leads';

export const leadNotesApi = {
  // Get notes for a specific lead
  getByLeadId: async (
    leadId: number,
    profileId: number,
  ): Promise<LeadNote[]> => {
    const response = await api.get<ApiResponse<LeadNote[]>>(
      `${NOTES_BASE}/${leadId}/${profileId}/notes`,
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch notes');
    }
    return response.data;
  },

  // Create a new note for a lead
  create: async (
    leadId: number,
    profileId: number,
    noteData: CreateLeadNoteDto,
  ): Promise<LeadNote> => {
    const response = await api.post<LeadNote, CreateLeadNoteDto>(
      `${NOTES_BASE}/${leadId}/${profileId}/notes`,
      noteData,
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create note');
    }
    return response.data;
  },

  // Update an existing note
  update: async (
    profileId: number,
    noteId: number,
    noteData: UpdateLeadNoteDto,
  ): Promise<LeadNote> => {
    const response = await api.patch<LeadNote, UpdateLeadNoteDto>(
      `${NOTES_BASE}/${profileId}/notes/${noteId}`,
      noteData,
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update note');
    }
    return response.data;
  },

  // Delete a note
  delete: async (profileId: number, noteId: number): Promise<void> => {
    const response = await api.del<void>(
      `${NOTES_BASE}/${profileId}/notes/${noteId}`,
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete note');
    }
  },
};
