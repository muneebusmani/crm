'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, Box, IconButton, CircularProgress } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { post } from '@/lib/api';

interface QuotationDetailDialogProps {
  open: boolean;
  quotation: any | null;
  onClose: () => void;
}

export default function QuotationDetailDialog({ open, quotation, onClose }: QuotationDetailDialogProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && quotation) {
      setLoading(true);
      post('/quotations/preview', quotation)
        .then(setHtmlContent)
        .catch(() => setHtmlContent('<p>Failed to load preview</p>'))
        .finally(() => setLoading(false));
    }
  }, [open, quotation]);

  if (!quotation) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} fullWidth
      PaperProps={{ sx: { width: '768px', maxWidth: '1400px', height: '90vh', m: 2 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Quotation Details
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <iframe srcDoc={htmlContent} style={{ width: '100%', height: '100%', border: 'none' }} title="Quotation" />
        )}
      </DialogContent>
    </Dialog>
  );
}
