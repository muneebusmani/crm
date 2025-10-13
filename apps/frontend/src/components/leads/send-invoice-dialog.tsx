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
  Card,
  CardContent,
} from '@mui/material';

interface SendInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: number | null;
  onSuccess?: () => void;
}

interface ItemRow {
  id: string;
  productName: string;
  productDetails: string;
  unitPrice: number;
  quantity: number;
  discount: number; // absolute per-item discount
  taxAmount: number; // absolute per-item tax
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  ifscCode?: string;
  iban?: string;
  swiftCode?: string;
}

export default function SendInvoiceDialog({ open, onClose, leadId, onSuccess }: SendInvoiceDialogProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [items, setItems] = useState<ItemRow[]>([]);
  const [sellerNote, setSellerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [quotationTerms, setQuotationTerms] = useState<string>('');
  const [salesTerms, setSalesTerms] = useState<string>('');

  // computed
  const lineTotal = (it: ItemRow) => {
    const base = (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0);
    const total = base - (Number(it.discount) || 0) + (Number(it.taxAmount) || 0);
    return total > 0 && Number.isFinite(total) ? total : 0;
  };
  const subTotal = useMemo(
    () => items.reduce((sum, it) => sum + ((Number(it.unitPrice) || 0) * (Number(it.quantity) || 0)), 0),
    [items],
  );
  const totalDiscount = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.discount) || 0), 0),
    [items],
  );
  const totalTax = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.taxAmount) || 0), 0),
    [items],
  );
  const grandTotal = useMemo(
    () => Math.max(0, subTotal - totalDiscount + totalTax),
    [subTotal, totalDiscount, totalTax],
  );

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        productName: '',
        productDetails: '',
        unitPrice: 0,
        quantity: 1,
        discount: 0,
        taxAmount: 0,
      },
    ]);
  };
  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));
  const updateItem = <K extends keyof ItemRow>(id: string, field: K, value: string | number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        if (field === 'productName' || field === 'productDetails') {
          return { ...it, [field]: String(value) } as ItemRow;
        }
        let num = value === '' ? 0 : Number(value);
        if (!Number.isFinite(num) || num < 0) num = 0;
        if (field === 'quantity') num = Math.max(1, Math.trunc(num));
        return { ...it, [field]: num } as ItemRow;
      }),
    );
  };

  const reset = () => {
    setDate(new Date().toISOString().slice(0, 16));
    setItems([]);
    setSellerNote('');
    setLead(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || items.length === 0 || items.some((it) => !it.productName) || grandTotal <= 0) return;
    try {
      setIsSubmitting(true);
      const payload = {
        leadId,
        date: new Date(date).toISOString(),
        sellerNote: sellerNote,
        items: items.map((it) => ({
          productName: it.productName,
          productDetails: it.productDetails || '',
          unitPrice: Number(it.unitPrice) || 0,
          quantity: Number(it.quantity) || 1,
          discount: Number(it.discount) || 0,
          taxAmount: Number(it.taxAmount) || 0,
        })),
        taxAmount: Number(totalTax) || 0,
      };
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create invoice');
      if (onSuccess) onSuccess();
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to send invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (!open) return;
    if (items.length === 0) addItem();
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    async function loadLead() {
      if (!open || !leadId) return;
      try {
        const resp = await fetch(`/api/dealers/leads/${leadId}`, { credentials: 'include' });
        if (!resp.ok) throw new Error('Failed to load lead');
        const data = await resp.json();
        if (!cancelled) setLead(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadLead();
    return () => { cancelled = true; };
  }, [open, leadId]);

  useEffect(() => {
    let cancelled = false;
    async function loadBank() {
      try {
        const resp = await fetch('/api/bank-details', { credentials: 'include' });
        if (!resp.ok) throw new Error('Failed to load bank details');
        const data = await resp.json();
        // In profile, API returns array; normalize to first
        const bankData = Array.isArray(data) ? data[0] : data?.data?.[0] || data;
        if (!cancelled) setBank(bankData ?? null);
      } catch (e) {
        console.error(e);
      }
    }
    if (open) loadBank();
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    async function loadTerms() {
      try {
        const resp = await fetch('/api/business-setting', { credentials: 'include' });
        if (!resp.ok) throw new Error('Failed to load business settings');
        const data = await resp.json();
        if (!cancelled) {
          setQuotationTerms(data?.quotation ?? '');
          setSalesTerms(data?.salesTerms ?? '');
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (open) loadTerms();
    return () => { cancelled = true; };
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Send Invoice</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>
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
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell sx={{ minWidth: 220 }}>
                          <TextField
                            fullWidth
                            placeholder="Item description"
                            value={it.productName}
                            onChange={(e) => updateItem(it.id, 'productName', e.target.value)}
                          />
                          <TextField
                            fullWidth
                            placeholder="Details"
                            size="small"
                            sx={{ mt: 1 }}
                            value={it.productDetails}
                            onChange={(e) => updateItem(it.id, 'productDetails', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={it.unitPrice}
                            onChange={(e) => updateItem(it.id, 'unitPrice', e.target.value)}
                            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={it.quantity}
                            onChange={(e) => updateItem(it.id, 'quantity', e.target.value)}
                            slotProps={{ htmlInput: { min: 1, step: 1 } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={it.discount}
                            onChange={(e) => updateItem(it.id, 'discount', e.target.value)}
                            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={it.taxAmount}
                            onChange={(e) => updateItem(it.id, 'taxAmount', e.target.value)}
                            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography>{lineTotal(it).toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Button color="error" onClick={() => removeItem(it.id)} disabled={items.length === 1}>
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} />
                      <TableCell sx={{ fontWeight: 600 }}>Grand Total</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{grandTotal.toFixed(2)}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Button onClick={addItem} sx={{ mt: 2 }} variant="contained">Add More</Button>

              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Bank Details:</Typography>
                <Card variant="outlined">
                  <CardContent>
                    {bank ? (
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Account Holder</Typography>
                          <Typography>{bank.accountHolderName}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Branch Name</Typography>
                          <Typography>{bank.branchName || '-'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Account Number</Typography>
                          <Typography>{bank.accountNumber}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">IFSC</Typography>
                          <Typography>{bank.ifscCode || '-'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Bank Name</Typography>
                          <Typography>{bank.bankName}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">IBAN</Typography>
                          <Typography>{bank.iban || '-'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">SWIFT</Typography>
                          <Typography>{bank.swiftCode || '-'}</Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography color="text.secondary">No bank details found. Configure them in your profile.</Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>

              <Typography variant="h6" sx={{ mt: 2 }}>Seller Note:</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={sellerNote}
                onChange={(e) => setSellerNote(e.target.value)}
              />

              <Typography variant="h6" sx={{ mt: 2 }}>Quotation Terms:</Typography>
              <Typography color="text.secondary">{quotationTerms || '—'}</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>Sales Terms:</Typography>
              <Typography color="text.secondary">{salesTerms || '—'}</Typography>
            </Box>

            <Box sx={{ width: 280 }}>
              <Typography variant="h6">{lead?.name || 'Lead'}</Typography>
              <Typography>{lead?.email || '-'}</Typography>
              <Typography>{lead?.number || '-'}</Typography>
              <Typography>Received: {lead?.createdAt ? new Date(lead.createdAt).toLocaleString() : '-'}</Typography>
              <Typography>Inquiry: #{lead?.id ?? '-'}</Typography>
              <Typography sx={{ mt: 1, fontWeight: 600 }}>Vehicle Info:</Typography>
              <Typography>VRM: {lead?.vehicle_vrm || '-'}</Typography>
              <Typography>VM: {lead?.vehicle_model || '-'}</Typography>
              <Typography>Engine Code: {lead?.engine_code || '-'}</Typography>
              <Typography>Engine Size: {lead?.engin_capacity || '-'}</Typography>
              <Typography sx={{ mt: 1 }}>Note: {lead?.description || lead?.notes || '-'}</Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              disabled={isSubmitting || items.length === 0 || items.some((it) => !it.productName) || grandTotal <= 0}
            >
              {isSubmitting ? 'Sending...' : 'Send Invoice'}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
