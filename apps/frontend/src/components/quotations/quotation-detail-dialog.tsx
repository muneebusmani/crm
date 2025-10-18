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
                Quotation #{quotation.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {quotation.dealershipName || 'N/A'}
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              ${Number(quotation.quotationPrice)?.toFixed(2) || '0.00'}
            </Typography>
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

        {/* Engine Code */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Engine Information
          </Typography>
          <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Engine Code:</strong> {quotation.engineCodeName || 'N/A'}
            </Typography>
          </Box>
        </Box>

        {/* Subject */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Subject
          </Typography>
          <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
            <Typography variant="body2">
              {quotation.subject || 'N/A'}
            </Typography>
          </Box>
        </Box>

        {/* Message */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Message
          </Typography>
          <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {quotation.message || 'N/A'}
            </Typography>
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
                      <strong>Item Name</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Unit Price</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Quantity</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Discount %</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Tax %</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Total</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotation.items.map((item: any, index: number) => (
                    <TableRow key={item.id || index}>
                      <TableCell>{item.itemName || 'N/A'}</TableCell>
                      <TableCell align="right">
                        ${item.unitPrice?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell align="right">{item.quantity || 0}</TableCell>
                      <TableCell align="right">
                        {item.discountPercent || 0}%
                      </TableCell>
                      <TableCell align="right">
                        {item.taxPercent || 0}%
                      </TableCell>
                      <TableCell align="right">
                        ${item.total?.toFixed(2) || '0.00'}
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
          <Typography variant="caption" color="text.secondary">
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
