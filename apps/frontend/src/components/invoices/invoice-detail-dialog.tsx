'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, Box, IconButton, CircularProgress } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { post } from '@/lib/api';

interface InvoiceDetailDialogProps {
  open: boolean;
  invoice: any | null;
  onClose: () => void;
}

export default function InvoiceDetailDialog({ open, invoice, onClose }: InvoiceDetailDialogProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && invoice) {
      setLoading(true);
      
      // Transform invoice data to match backend expected format
      // Include all existing invoice data for accurate preview generation
      const payload = {
        invoiceNumber: invoice.invoiceNumber,
        leadId: invoice.lead?.id || invoice.leadId,
        date: invoice.date,
        sellerNote: invoice.sellerNote || '',
        items: invoice.items || [],
        subTotal: Number(invoice.subTotal) || 0,
        taxAmount: Number(invoice.taxAmount) || 0,
        grandTotal: Number(invoice.grandTotal) || 0,
        recoveryLocation: invoice.recoveryLocation || '',
        deliveryLocation: invoice.deliveryLocation || '',
      };
      
      post('/invoices/preview', payload)
        .then((response) => {
          // The response is the HTML string directly from the backend
          setHtmlContent(response as unknown as string);
        })
        .catch(() => setHtmlContent('<p>Failed to load preview</p>'))
        .finally(() => setLoading(false));
    }
  }, [open, invoice]);

  if (!invoice) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} fullWidth
      PaperProps={{ sx: { width: '768px', maxWidth: '1400px', height: '90vh', m: 2 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Invoice Details
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <iframe srcDoc={htmlContent} style={{ width: '100%', height: '100%', border: 'none' }} title="Invoice" />
        )}
      </DialogContent>
    </Dialog>
  );
}
