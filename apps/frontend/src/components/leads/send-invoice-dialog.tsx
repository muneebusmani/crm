'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import type { Lead } from '@crm/types';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import { get } from '@/lib/api';

interface SendInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: number | null;
  onSuccess?: () => void;
}

interface ItemRow {
  id: string;
  productName: string;
  // productDetails: string;
  unitPrice: number;
  quantity: number;
  discount: number; // absolute per-item discount (for backend compatibility)
  taxAmount: number; // absolute per-item tax (for backend compatibility)
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

interface DealerProfile {
  id: number;
  email: string;
  name: string;
  username: string;
  type: string;
  status: string;
  dealer: {
    id: number;
    name: string;
    owner: string;
    location: string;
    logo: string;
    website: string;
    contactEmail: string;
    credits: number;
    tierId: number;
  };
}

export default function SendInvoiceDialog({
  open,
  onClose,
  leadId,
  onSuccess,
}: SendInvoiceDialogProps) {
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toLocaleDateString(),
  );
  const [orderDate, setOrderDate] = useState<string>(
    new Date().toLocaleDateString(),
  );
  const [items, setItems] = useState<ItemRow[]>([]);
  const [sellerNote, setSellerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [quotationTerms, setQuotationTerms] = useState<string>('');
  const [salesTerms, setSalesTerms] = useState<string>('');
  const [dealerProfile, setDealerProfile] = useState<DealerProfile | null>(
    null,
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [recoveryLocation, setRecoveryLocation] = useState<string>('');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('');
  const [vatPercentage, setVatPercentage] = useState<number>(10);
  const [discountPercentage, setDiscountPercentage] = useState<number>(10);

  // computed - using global percentages
  const lineTotal = (it: ItemRow) => {
    return (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0);
  };
  const subTotal = useMemo(
    () => items.reduce((sum, it) => sum + lineTotal(it), 0),
    [items],
  );
  const totalDiscount = useMemo(
    () => (subTotal * discountPercentage) / 100,
    [subTotal, discountPercentage],
  );
  const totalVAT = useMemo(
    () => (subTotal * vatPercentage) / 100,
    [subTotal, vatPercentage],
  );
  const grandTotal = useMemo(
    () => Math.max(0, subTotal - totalDiscount + totalVAT),
    [subTotal, totalDiscount, totalVAT],
  );

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        productName: '',
        // productDetails: '',
        unitPrice: 0,
        quantity: 1,
        discount: 0,
        taxAmount: 0,
      },
    ]);
  };
  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));
  const updateItem = <K extends keyof ItemRow>(
    id: string,
    field: K,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        if (
          field === 'productName'
          // || field === 'productDetails'
        ) {
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
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setOrderDate(new Date().toISOString().slice(0, 10));
    setItems([]);
    setSellerNote('');
    setLead(null);
    setRecoveryLocation('');
    setDeliveryLocation('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !leadId ||
      items.length === 0 ||
      items.some((it) => !it.productName) ||
      grandTotal <= 0
    )
      return;
    try {
      setIsSubmitting(true);
      // Calculate per-item discount and tax based on global percentages
      const itemsWithCalculatedValues = items.map((it) => {
        const itemSubtotal = lineTotal(it);
        const itemDiscount = (itemSubtotal * discountPercentage) / 100;
        const itemTax = (itemSubtotal * vatPercentage) / 100;
        return {
          productName: it.productName,
          // productDetails: it.productDetails || '',
          unitPrice: Number(it.unitPrice) || 0,
          quantity: Number(it.quantity) || 1,
          discount: itemDiscount,
          taxAmount: itemTax,
        };
      });

      const payload = {
        leadId,
        date: new Date(invoiceDate).toISOString(),
        sellerNote: sellerNote,
        items: itemsWithCalculatedValues,
        taxAmount: Number(totalVAT) || 0,
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
        const resp = await fetch(`/api/dealers/leads/${leadId}`, {
          credentials: 'include',
        });
        if (!resp.ok) throw new Error('Failed to load lead');
        const data = await resp.json();
        if (!cancelled) setLead(data);
      } catch (e) {
        console.error(e);
      }
    }
    loadLead();
    return () => {
      cancelled = true;
    };
  }, [open, leadId]);

  useEffect(() => {
    let cancelled = false;
    async function loadBank() {
      try {
        const resp = await fetch('/api/bank-details', {
          credentials: 'include',
        });
        if (!resp.ok) throw new Error('Failed to load bank details');
        const data = await resp.json();
        // In profile, API returns array; normalize to first
        const bankData = Array.isArray(data)
          ? data[0]
          : data?.data?.[0] || data;
        if (!cancelled) setBank(bankData ?? null);
      } catch (e) {
        console.error(e);
      }
    }
    if (open) loadBank();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    async function loadTerms() {
      try {
        const resp = await fetch('/api/business-setting', {
          credentials: 'include',
        });
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
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    async function loadDealerProfile() {
      try {
        const data = await get('/dealers/profile/me');
        console.log('Response Dealer Profile:', data);
        // if (!resp.ok) throw new Error('Failed to load dealer profile');
        // const data = await resp.json();
        if (!cancelled) {
          setDealerProfile(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (open) loadDealerProfile();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (open && !invoiceNumber) {
      // Generate invoice number
      const num = Math.floor(10000 + Math.random() * 90000);
      setInvoiceNumber(`INV-${num}`);
    }
  }, [open, invoiceNumber]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Left: Invoice Preview */}
            <Box
              sx={{
                flex: 1,
                border: '2px solid #ddd',
                borderRadius: 2,
                p: 3,
                bgcolor: 'background.paper',
              }}
            >
              {/* Header */}
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 60,
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: 'text.secondary',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {dealerProfile?.dealer?.logo ? (
                      <Image
                        src={dealerProfile.dealer.logo}
                        alt="Company Logo"
                        fill
                        style={{
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      'Logo'
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {dealerProfile?.dealer?.name || 'Company Name'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dealerProfile?.dealer?.location ||
                      'Plot 145, street 1, london'}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    Invoice
                  </Typography>
                  <Typography variant="caption" display="block">
                    Invoice #: {invoiceNumber}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Invoice Date: {invoiceDate}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Order Date:{' '}
                    {new Date(lead?.createdAt as string).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              {/* Vehicle Info */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Vehicle Info:
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 1,
                  mb: 2,
                }}
              >
                <Typography variant="body2">
                  Reg No: {lead?.vehicle_reg || lead?.vehicle_vrm || '23A13'}
                </Typography>
                <Typography variant="body2">
                  Make: {lead?.vehicle_brand || 'Audi'}
                </Typography>
                <Typography variant="body2">
                  Model: {lead?.vehicle_model || 'm3'}
                </Typography>
                <Typography variant="body2">Reg Year: 2016</Typography>
                <Typography variant="body2">
                  Fuel Type: {lead?.fuelType || 'Petrol'}
                </Typography>
                <Typography variant="body2">Car Type: Engine</Typography>
              </Box>

              {/* Buyer Info & Recovery & Collection - Side by Side */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 2 }}>
                {/* Buyer Info */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Buyer Info:
                  </Typography>
                  <Typography variant="body2">
                    Name: {lead?.name || 'John'}
                  </Typography>
                  <Typography variant="body2">
                    Phone: {lead?.number || '+129730283'}
                  </Typography>
                  <Typography variant="body2">
                    Email: {lead?.email || 'john@gmail.com'}
                  </Typography>
                  <Typography variant="body2">
                    Post: {lead?.postcode || '3251'}
                  </Typography>
                </Box>

                {/* Recovery & Collection */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Recovery & Collection:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Recovery Location:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="plot123, street 4, london"
                    value={recoveryLocation}
                    onChange={(e) => setRecoveryLocation(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Delivery Location:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="plot123, street 4, london"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                  />
                </Box>
              </Box>

              {/* Items Table */}
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={it.productName}
                            onChange={(e) =>
                              updateItem(it.id, 'productName', e.target.value)
                            }
                            variant="standard"
                          />
                          {/* <TextField */}
                          {/*   fullWidth */}
                          {/*   size="small" */}
                          {/*   placeholder="Details" */}
                          {/*   value={it.productDetails} */}
                          {/*   onChange={(e) => */}
                          {/*     updateItem( */}
                          {/*       it.id, */}
                          {/*       'productDetails', */}
                          {/*       e.target.value, */}
                          {/*     ) */}
                          {/*   } */}
                          {/*   variant="standard" */}
                          {/*   sx={{ fontSize: '0.75rem', mt: 0.5 }} */}
                          {/* /> */}
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={it.unitPrice}
                            onChange={(e) =>
                              updateItem(it.id, 'unitPrice', e.target.value)
                            }
                            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                            variant="standard"
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={it.quantity}
                            onChange={(e) =>
                              updateItem(it.id, 'quantity', e.target.value)
                            }
                            slotProps={{ htmlInput: { min: 1, step: 1 } }}
                            variant="standard"
                            sx={{ width: 50 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ${lineTotal(it).toFixed(0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => removeItem(it.id)}
                            disabled={items.length === 1}
                          >
                            ×
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Button
                onClick={addItem}
                size="small"
                variant="contained"
                sx={{ mb: 2 }}
              >
                Add More
              </Button>

              {/* Totals */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Box sx={{ minWidth: 200 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">VAT</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        type="number"
                        size="small"
                        value={vatPercentage}
                        onChange={(e) =>
                          setVatPercentage(Number(e.target.value))
                        }
                        slotProps={{ htmlInput: { min: 0, max: 100, step: 1 } }}
                        variant="standard"
                        sx={{ width: 50 }}
                      />
                      <Typography variant="body2">%</Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">Discount</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        type="number"
                        size="small"
                        value={discountPercentage}
                        onChange={(e) =>
                          setDiscountPercentage(Number(e.target.value))
                        }
                        slotProps={{ htmlInput: { min: 0, max: 100, step: 1 } }}
                        variant="standard"
                        sx={{ width: 50 }}
                      />
                      <Typography variant="body2">%</Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Total
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ${grandTotal.toFixed(0)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Bank Details */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Bank Details:
              </Typography>
              <Box
                sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, mb: 2 }}
              >
                {bank ? (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2">
                      Account Holder: {bank.accountHolderName}
                    </Typography>
                    <Typography variant="body2">
                      IFSC: {bank.ifscCode || 'EXMP123456'}
                    </Typography>
                    <Typography variant="body2">
                      Account Number: {bank.accountNumber}
                    </Typography>
                    <Typography variant="body2">
                      IBAN: {bank.iban || 'EXMP123456780'}
                    </Typography>
                    <Typography variant="body2">
                      Bank Name: {bank.bankName}
                    </Typography>
                    <Typography variant="body2">
                      SWIFT: {bank.swiftCode || 'EXMP1512345'}
                    </Typography>
                    <Typography variant="body2">
                      Branch Name: {bank.branchName || 'Main Branch'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No bank details configured
                  </Typography>
                )}
              </Box>

              {/* Seller Note */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Seller Note:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                value={sellerNote}
                onChange={(e) => setSellerNote(e.target.value)}
                sx={{ mb: 2 }}
              />

              {/* Quotation Terms */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Quotation Terms:
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 2 }}
              >
                {quotationTerms ||
                  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of"}
              </Typography>

              {/* Sales Terms */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Sales Terms:
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                {salesTerms ||
                  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of"}
              </Typography>
            </Box>

            {/* Right: Customer Card */}
            <Box
              sx={{
                width: 280,
                border: '2px solid #000',
                borderRadius: 2,
                p: 2,
                height: 'fit-content',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {lead?.name || 'John doe'}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {lead?.email || 'john@gmail.com'}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 1 }}
              >
                {lead?.number || '0401234012'}
              </Typography>

              <Typography variant="caption" display="block">
                Received:{' '}
                {lead?.createdAt
                  ? new Date(lead.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '24 May 2025 at 10:00am'}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                Inquiry: #{lead?.id || '12234'}
              </Typography>

              <Typography
                variant="caption"
                display="block"
                sx={{ fontWeight: 600 }}
              >
                VRM: {lead?.vehicle_vrm || 'ERFH349'}
              </Typography>
              <Typography variant="caption" display="block">
                VM: {lead?.vehicle_model || 'Ford Focus'}
              </Typography>
              <Typography variant="caption" display="block">
                Engine Code: {lead?.engine_code || 'X20XEV'}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                Engine Size: {lead?.engin_capacity || '2.0'}
              </Typography>

              <Typography
                variant="caption"
                display="block"
                sx={{ fontWeight: 600 }}
              >
                Note:
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {lead?.description ||
                  lead?.notes ||
                  'Looking for a replacement engine for Ford Focus'}
              </Typography>
            </Box>
          </Box>

          {/* Footer Actions */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" disabled>
                Download PDF
              </Button>
              <Button variant="contained" disabled>
                Preview
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  isSubmitting ||
                  items.length === 0 ||
                  items.some((it) => !it.productName) ||
                  grandTotal <= 0
                }
              >
                {isSubmitting ? 'Sending...' : 'Send Invoice'}
              </Button>
            </Box>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}
