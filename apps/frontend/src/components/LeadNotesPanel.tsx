'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete, Edit, Save, Cancel, Add } from '@mui/icons-material';
import type { LeadNote, CreateLeadNoteDto } from '@crm/types';
import { leadNotesApi } from '@/services/lead-notes.service';

interface LeadNotesPanelProps {
  leadId: number;
  currentProfileId?: number;
}

export default function LeadNotesPanel({
  leadId,
  currentProfileId,
}: LeadNotesPanelProps) {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [leadId, currentProfileId]);

  const fetchNotes = async () => {
    if (!currentProfileId) {
      setError('No profile selected');
      setLoading(false);
      return;
    }

    try {
      const notesData = await leadNotesApi.getByLeadId(leadId, currentProfileId);
      setNotes(notesData || []);
    } catch {
      setError('Error loading notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newNoteContent.trim() || submitting || !currentProfileId) return;

    setSubmitting(true);
    try {
      const noteData = {
        content: newNoteContent.substring(0, 500),
      } as CreateLeadNoteDto;

      await leadNotesApi.create(leadId, currentProfileId, noteData);
      setNewNoteContent('');
      await fetchNotes();
    } catch {
      setError('Error creating note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (noteId: number) => {
    if (!editingContent.trim() || submitting || !currentProfileId) return;

    setSubmitting(true);
    try {
      const noteData = { content: editingContent.substring(0, 500) };
      
      await leadNotesApi.update(currentProfileId, noteId, noteData);
      setEditingNoteId(null);
      setEditingContent('');
      await fetchNotes();
    } catch {
      setError('Error updating note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!confirm('Delete this note?') || !currentProfileId) return;

    try {
      await leadNotesApi.delete(currentProfileId, noteId);
      await fetchNotes();
    } catch {
      setError('Error deleting note');
    }
  };

  const startEdit = (note: LeadNote) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const canEdit = (note: LeadNote) => {
    return currentProfileId === note.company_user_id;
  };

  const truncate = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Lead Notes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Create New Note */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Add a new note (max 500 characters)..."
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          inputProps={{ maxLength: 500 }}
          helperText={`${newNoteContent.length}/500`}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
          disabled={!newNoteContent.trim() || submitting}
          sx={{ mt: 1 }}
        >
          Add Note
        </Button>
      </Box>

      {/* Notes List */}
      <List>
        {notes.map((note) => (
          <ListItem
            key={note.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Box display="flex" width="100%" alignItems="center" mb={1}>
              <Chip
                label={note.created_by_name}
                size="small"
                color={canEdit(note) ? 'primary' : 'default'}
                sx={{ mr: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {new Date(note.created_at).toLocaleString()}
              </Typography>
              <Box ml="auto">
                {canEdit(note) && editingNoteId !== note.id && (
                  <>
                    <IconButton size="small" onClick={() => startEdit(note)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>

            {editingNoteId === note.id ? (
              <Box width="100%">
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  inputProps={{ maxLength: 500 }}
                  helperText={`${editingContent.length}/500`}
                />
                <Box mt={1}>
                  <Button
                    size="small"
                    startIcon={<Save />}
                    onClick={() => handleUpdate(note.id)}
                    disabled={submitting}
                  >
                    Save
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Cancel />}
                    onClick={cancelEdit}
                    sx={{ ml: 1 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box width="100%">
                <Typography variant="body2">
                  {expandedNoteId === note.id
                    ? note.content
                    : truncate(note.content, 100)}
                </Typography>
                {note.content.length > 100 && (
                  <Button
                    size="small"
                    onClick={() =>
                      setExpandedNoteId(
                        expandedNoteId === note.id ? null : note.id,
                      )
                    }
                  >
                    {expandedNoteId === note.id ? 'Show Less' : 'Show More'}
                  </Button>
                )}
              </Box>
            )}
          </ListItem>
        ))}
      </List>

      {notes.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          py={3}
        >
          No notes yet. Add the first one above.
        </Typography>
      )}
    </Paper>
  );
}
