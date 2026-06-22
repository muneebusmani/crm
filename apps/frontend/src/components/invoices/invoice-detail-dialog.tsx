'use client';

import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { post } from '@/lib/api';

type InvoiceRow = {
  id: string;
  invoiceNumber?: string;
  lead?: { id?: string };
  leadId?: string;
  date?: string;
  sellerNote?: string;
  items?: Array<{
    id?: string;
    productName?: string;
    productDetails?: string;
    unitPrice?: number | string;
    quantity?: number;
    discount?: number | string;
    taxAmount?: number | string;
    totalPrice?: number | string;
    subTotal?: number | string;
  }>;
  subTotal?: number;
  taxAmount?: number;
  grandTotal?: number;
  recoveryLocation?: string;
  deliveryLocation?: string;
};

interface InvoiceDetailDialogProps {
  open: boolean;
  invoice: InvoiceRow | null;
  onClose: () => void;
  previewPathBase?: string;
}

export default function InvoiceDetailDialog({
  open,
  invoice,
  onClose,
  previewPathBase,
}: InvoiceDetailDialogProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && invoice) {
      setLoading(true);

      const previewPath = previewPathBase
        ? `${previewPathBase}/${invoice.id}/preview`
        : null;

      const request = previewPath
        ? fetch(previewPath, { method: 'GET', credentials: 'include' })
        : post('/invoices/preview', {
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
          });

      request
        .then((response) => {
          if (previewPath) {
            return response.text();
          }
          return response as unknown as string;
        })
        .then((content) => {
          setHtmlContent(content);
        })
        .catch(() => setHtmlContent('<p>Failed to load preview</p>'))
        .finally(() => setLoading(false));
    }
  }, [invoice, open, previewPathBase]);

  if (!invoice) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: { width: '768px', maxWidth: '1400px', height: '90vh', m: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Invoice Details
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <iframe
            srcDoc={htmlContent}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Invoice"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
