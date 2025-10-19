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
  IconButton,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface QuotationDetailDialogProps {
  open: boolean;
  quotation: any | null;
  onClose: () => void;
}

export default function QuotationDetailDialog({
  open,
  quotation,
  onClose,
}: QuotationDetailDialogProps) {
  if (!quotation) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">Quotation Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Quotation Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {quotation.quotationNumber || 'N/A'}
              </Typography>
              {/* <Typography variant="body2" color="text.secondary"> */}
              {/*   Status: {quotation.status || 'PENDING'} */}
              {/* </Typography> */}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Grand Total
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: 'primary.main' }}
              >
                ${Number(quotation.grandTotal)?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
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
              <strong>Name:</strong> {quotation.lead?.name || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {quotation.lead?.email || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Phone:</strong> {quotation.lead?.number || 'N/A'}
            </Typography>
            {quotation.lead?.vehicle_vrm && (
              <Typography variant="body2">
                <strong>Vehicle:</strong> {quotation.lead.vehicle_vrm} -{' '}
                {quotation.lead.vehicle_model || ''}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Seller Note */}
        {quotation.sellerNote && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Seller Note
            </Typography>
            <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {quotation.sellerNote}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Totals Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Summary
          </Typography>
          <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ${Number(quotation.subTotal)?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant="body2">Tax:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ${Number(quotation.taxAmount)?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Grand Total:
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: 'primary.main' }}
              >
                ${Number(quotation.grandTotal)?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Items Table (if exists) */}
        {quotation.items && quotation.items.length > 0 && (
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
                    <TableCell>
                      <strong>Details</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Unit Price</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Quantity</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Discount</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Tax</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Total</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotation.items.map((item: any, index: number) => (
                    <TableRow key={item.id || index}>
                      <TableCell>{item.productName || 'N/A'}</TableCell>
                      <TableCell>{item.productDetails || '-'}</TableCell>
                      <TableCell align="right">
                        ${Number(item.unitPrice)?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell align="right">{item.quantity || 0}</TableCell>
                      <TableCell align="right">
                        ${Number(item.discount)?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell align="right">
                        ${Number(item.taxAmount)?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          ${Number(item.totalPrice)?.toFixed(2) || '0.00'}
                        </strong>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Metadata */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Quotation Date:{' '}
            {quotation.date
              ? new Date(quotation.date).toLocaleDateString()
              : 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Created:{' '}
            {quotation.createdAt
              ? new Date(quotation.createdAt).toLocaleString()
              : 'N/A'}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
