'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface InvoiceDetailDialogProps {
  open: boolean;
  invoice: any | null;
  onClose: () => void;
}

export default function InvoiceDetailDialog({
  open,
  invoice,
  onClose,
}: InvoiceDetailDialogProps) {
  if (!invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'SENT':
        return 'info';
      case 'PAID':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Invoice Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Invoice Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {invoice.invoiceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {new Date(invoice.date).toLocaleDateString()}
              </Typography>
            </Box>
            <Chip
              label={invoice.status}
              color={getStatusColor(invoice.status)}
              sx={{ height: 32 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Lead Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Customer Information
          </Typography>
          <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Name:</strong> {invoice.lead?.name || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {invoice.lead?.email || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Phone:</strong> {invoice.lead?.number || 'N/A'}
            </Typography>
            {invoice.lead?.vehicle_vrm && (
              <Typography variant="body2">
                <strong>Vehicle:</strong> {invoice.lead.vehicle_vrm} -{' '}
                {invoice.lead.vehicle_model || ''}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Items Table */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Items
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell>
                    <strong>Product Name</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Unit Price</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Quantity</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Total</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item: any, index: number) => (
                    <TableRow key={item.id || index}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="right">
                        ${Number(item.unitPrice)?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell align="right">{item.quantity || 0}</TableCell>
                      <TableCell align="right">
                        ${item.total?.toFixed(2) || '0.00'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No items
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Totals */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 3, minWidth: 200 }}>
            <Typography variant="body2">Sub Total:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ${Number(invoice.subTotal)?.toFixed(2) || '0.00'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3, minWidth: 200 }}>
            <Typography variant="body2">Tax:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ${Number(invoice.taxAmount)?.toFixed(2) || '0.00'}
            </Typography>
          </Box>
          <Divider sx={{ width: '100%', my: 1 }} />
          <Box sx={{ display: 'flex', gap: 3, minWidth: 200 }}>
            <Typography variant="h6">Grand Total:</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              ${Number(invoice.grandTotal)?.toFixed(2) || '0.00'}
            </Typography>
          </Box>
        </Box>

        {/* Seller Note */}
        {invoice.sellerNote && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Seller Note
            </Typography>
            <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Typography variant="body2">{invoice.sellerNote}</Typography>
            </Box>
          </Box>
        )}

        {/* Metadata */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Created: {new Date(invoice.createdAt).toLocaleString()}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
