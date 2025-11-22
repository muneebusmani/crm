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

interface InvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: number;
}

export default function InvoiceDialog({
  open,
  onClose,
  leadId,
}: InvoiceDialogProps) {
  const dispatch = useAppDispatch();
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 16),
  ); // yyyy-MM-ddTHH:mm
  const [items, setItems] = useState<
    Array<{
      id: number;
      productName: string;
      productDetails: string;
      unitPrice: string;
      quantity: string;
    }>
  >([
    {
      id: 1,
      productName: '',
      productDetails: '',
      unitPrice: '0',
      quantity: '1',
    },
  ]);
  const [taxAmount, setTaxAmount] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    const maxId = items.reduce((m, it) => Math.max(m, it.id), 0);
    setItems([
      ...items,
      {
        id: maxId + 1,
        productName: '',
        productDetails: '',
        unitPrice: '0',
        quantity: '1',
      },
    ]);
  };
  const removeItem = (id: number) =>
    setItems(items.filter((it) => it.id !== id));
  const updateItem = (
    id: number,
    field: 'productName' | 'productDetails' | 'unitPrice' | 'quantity',
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    );
  };

  const computeSubTotal = () =>
    items.reduce(
      (sum, it) =>
        sum +
        parseFloat(it.unitPrice || '0') *
          (parseInt(it.quantity || '1', 10) || 1),
      0,
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || items.some((it) => !it.productName)) return;

    try {
      setIsSubmitting(true);
      const payload = {
        leadId,
        date: new Date(date).toISOString(),
        taxAmount: parseFloat(taxAmount) || 0,
        items: items.map((it) => ({
          productName: it.productName,
          productDetails: it.productDetails || '',
          unitPrice: parseFloat(it.unitPrice) || 0,
          quantity: parseInt(it.quantity, 10) || 1,
        })),
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create invoice');

      // Optimistic append
      const sub = computeSubTotal();
      const total = sub + payload.taxAmount;
      const chatId = String(leadId);
      // Use a timestamp that's slightly in the past to ensure proper ordering
      const createdAt = new Date(Date.now() - 1000).toISOString();
      dispatch(
        appendMessage({
          chatId,
          message: {
            id: `inv-temp-${Date.now()}`,
            content: JSON.stringify({
              invoiceNumber: 'pending',
              date: payload.date,
              total,
              status: 'PENDING',
            }),
            type: 'invoice',
            createdAt,
          },
        }),
      );

      // Refresh
      dispatch(loadMessagesForChat(chatId));

      onClose();
    } catch (error) {
      console.error('Failed to send invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send Invoice</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              label="Tax Amount"
              type="number"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
            {items.map((it) => (
              <Box
                key={it.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    value={it.productName}
                    onChange={(e) =>
                      updateItem(it.id, 'productName', e.target.value)
                    }
                    required
                  />
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={it.quantity}
                    onChange={(e) =>
                      updateItem(it.id, 'quantity', e.target.value)
                    }
                    slotProps={{ htmlInput: { min: 1, step: 1 } }}
                    required
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Product Details"
                  value={it.productDetails}
                  onChange={(e) =>
                    updateItem(it.id, 'productDetails', e.target.value)
                  }
                  multiline
                  rows={2}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Unit Price"
                    type="number"
                    value={it.unitPrice}
                    onChange={(e) =>
                      updateItem(it.id, 'unitPrice', e.target.value)
                    }
                    slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                    required
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeItem(it.id)}
                    disabled={items.length === 1}
                  >
                    Remove
                  </Button>
                </Box>
              </Box>
            ))}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={addItem}>
                Add Item
              </Button>
              <Box
                sx={{
                  ml: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <strong>Subtotal: ${computeSubTotal().toFixed(2)}</strong>
                <strong>
                  Total: $
                  {(computeSubTotal() + (parseFloat(taxAmount) || 0)).toFixed(
                    2,
                  )}
                </strong>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}
          >
            <Button onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              disabled={
                isSubmitting ||
                items.length === 0 ||
                items.some((it) => !it.productName)
              }
            >
              {isSubmitting ? 'Sending...' : 'Send Invoice'}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
