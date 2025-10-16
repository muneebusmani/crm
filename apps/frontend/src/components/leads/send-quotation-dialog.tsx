'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Lead } from '@crm/types';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { post, post2 } from '@/lib/api';

interface SendQuotationDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: number | null;
  onSuccess?: () => void;
}

// UI item model aligned with backend CreateQuotationDto items shape
interface Item {
  id: string; // UI-only key
  itemDescription: string;
  rate: number;
  quantity: number;
  discountPercent: number; // 0-100
  taxPercent: number; // 0-100
}

export default function SendQuotationDialog({ open, onClose, leadId, onSuccess }: SendQuotationDialogProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [lead, setLead] = useState<Lead | null>(null);

  // derived totals
  const calcItemTotal = (it: Item) => {
    const base = Number(it.rate || 0) * Number(it.quantity || 0);
    const afterDiscount = base * (1 - Number(it.discountPercent || 0) / 100);
    const afterTax = afterDiscount * (1 + Number(it.taxPercent || 0) / 100);
    return isFinite(afterTax) ? afterTax : 0;
  };
  const rowTotals = useMemo(() => items.map(calcItemTotal), [items]);
  const grandTotal = useMemo(
    () => rowTotals.reduce((sum, t) => sum + (Number.isFinite(t) ? t : 0), 0),
    [rowTotals],
  );

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        itemDescription: '',
        rate: 0,
        quantity: 1,
        discountPercent: 0,
        taxPercent: 0,
      },
    ]);
  };

  const handleItemChange = (
    index: number,
    field: keyof Omit<Item, 'id'>,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        if (field === 'itemDescription') {
          return { ...it, itemDescription: String(value) };
        }
        let num = value === '' ? 0 : Number(value);
        switch (field) {
          case 'rate':
            if (!Number.isFinite(num) || num < 0) num = 0;
            return { ...it, rate: num };
          case 'quantity':
            // zod requires quantity >= 1
            if (!Number.isFinite(num) || num < 1) num = 1;
            return { ...it, quantity: Math.max(1, Math.trunc(num)) };
          case 'discountPercent':
            if (!Number.isFinite(num) || num < 0) num = 0;
            if (num > 100) num = 100;
            return { ...it, discountPercent: num };
          case 'taxPercent':
            if (!Number.isFinite(num) || num < 0) num = 0;
            if (num > 100) num = 100;
            return { ...it, taxPercent: num };
          default:
            return it;
        }
      }),
    );
  };

  const reset = () => {
    setSubject('');
    setMessage('');
    setItems([]);
    setLead(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !subject.trim() || !message.trim() || items.length === 0 || grandTotal <= 0) return;
    try {
      setIsSubmitting( true );
      const dataToSend = {
        leadId,
        subject,
        message,
        quotationPrice: Number( grandTotal.toFixed( 2 ) ),
        items: items.map( ( it ) => ( {
          itemDescription: it.itemDescription,
          rate: Number( it.rate ) || 0,
          quantity: Number( it.quantity ) || 0,
          discountPercent: Number( it.discountPercent ) || 0,
          taxPercent: Number( it.taxPercent ) || 0,
        } ) ),
      };
      const res = await post2('/dealers/quotations',dataToSend);
      console.log("Res:",res)
      // post2 throws on non-2xx; reaching here means success
      if (onSuccess) onSuccess();
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to send quotation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load the lead details for the right panel
  useEffect(() => {
    let cancelled = false;
    async function loadLead() {
      if (!open || !leadId) return;
      try {
        const resp = await fetch(`/api/dealers/leads/${leadId}`, {
          credentials: 'include',
        });
        if (!resp.ok) throw new Error('Failed to load lead');
        const data = await resp.json();
        if (!cancelled) setLead(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadLead();
    return () => {
      cancelled = true;
    };
  }, [open, leadId]);

  // Ensure at least one row when dialog opens
  useEffect(() => {
    if (open && items.length === 0) {
      addItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen>
      <DialogTitle>Send Quotation</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flex: 1, mr: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Send Quote</Typography>
              <TextField
                fullWidth
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
                required
              />
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item Description</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Discount</TableCell>
                      <TableCell>Tax</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <TextField
                            fullWidth
                            value={item.itemDescription}
                            onChange={(e) => handleItemChange(index, 'itemDescription', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            inputProps={{ min: 0, step: '0.01' }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            inputProps={{ min: 1, step: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.discountPercent}
                            onChange={(e) => handleItemChange(index, 'discountPercent', e.target.value)}
                            inputProps={{ min: 0, max: 100, step: '0.01' }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.taxPercent}
                            onChange={(e) => handleItemChange(index, 'taxPercent', e.target.value)}
                            inputProps={{ min: 0, max: 100, step: '0.01' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography>{calcItemTotal(item).toFixed(2)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} />
                      <TableCell sx={{ fontWeight: 600 }}>Grand Total</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{grandTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Button onClick={addItem} sx={{ mt: 2 }} variant="contained">Add More</Button>
              <Typography variant="h6" sx={{ mt: 2 }}>Seller Note:</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Typography variant="h6" sx={{ mt: 2 }}>Quotation Terms:</Typography>
              <Typography color="text.secondary">These terms will be included from your business settings in the email.</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>Sales Terms:</Typography>
              <Typography color="text.secondary">These terms will be included from your business settings in the email.</Typography>
            </Box>
            <Box sx={{ flex: 0.4 }}>
              <Typography variant="h6">{lead?.name || 'Lead'}</Typography>
              <Typography>{lead?.email || '-'}</Typography>
              <Typography>{lead?.number || '-'}</Typography>
              <Typography>
                Received: {lead?.createdAt ? new Date(lead.createdAt).toLocaleString() : '-'}
              </Typography>
              <Typography>Inquiry: #{lead?.id ?? '-'}</Typography>
              <Typography sx={{ mt: 1, fontWeight: 600 }}>Vehicle Info:</Typography>
              <Typography>VRM: {lead?.vehicle_vrm || '-'}</Typography>
              <Typography>VM: {lead?.vehicle_model || '-'}</Typography>
              <Typography>Engine Code: {lead?.engine_code || '-'}</Typography>
              <Typography>Engine Size: {lead?.engin_capacity || '-'}</Typography>
              <Typography sx={{ mt: 1 }}>
                Note: {lead?.description || lead?.notes || '-'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                isSubmitting || !subject.trim() || !message.trim() || items.length === 0 || grandTotal <= 0
              }
            >
              {isSubmitting ? 'Sending...' : 'Send Quotation'}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
