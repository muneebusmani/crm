'use client';

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { appendMessage, loadMessagesForChat } from '@/features/chat/slice';

interface QuotationDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: number;
}

export default function QuotationDialog({
  open,
  onClose,
  leadId,
}: QuotationDialogProps) {
  const dispatch = useAppDispatch();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message || !price) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/dealers/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          leadId,
          subject,
          message,
          quotationPrice: parseFloat(price),
        }),
      });
      if (!res.ok) throw new Error('Failed to create quotation');

      // Optimistic append
      dispatch(
        appendMessage({
          chatId: String(leadId),
          message: {
            id: `q-temp-${Date.now()}`,
            content: JSON.stringify({ subject, message, price: parseFloat(price) }),
            type: 'quotation',
            createdAt: new Date().toISOString(),
          },
        }),
      );

      // Refresh from server for consistency
      dispatch(loadMessagesForChat(String(leadId)));

      onClose();
    } catch (error) {
      console.error('Failed to send quotation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send Quotation</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            margin="normal"
            required
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          />
          <Box
            sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}
          >
            <Button onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || !subject || !message || !price}
            >
              {isSubmitting ? 'Sending...' : 'Send Quotation'}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
