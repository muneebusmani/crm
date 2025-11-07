'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  IconButton,
  InputBase,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import type { InvoiceResponse } from '@crm/types';
import { get } from '@/lib/api';
import { invoicesApi } from '@/services/invoices.service';
import InvoiceDetailDialog from './invoice-detail-dialog';

const InvoicesTable: React.FC = () => {
  const theme = useTheme();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const ROWS_PER_PAGE = 10;

  // Fetch invoices from API

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        // Use the invoices service to fetch invoices
        const response = await invoicesApi.getAll();
        console.log('Invoices Response:', response);
        setInvoices(response || []);
      } catch (error) {
        setSnackbar({
          open: true,
          message:
            error instanceof Error ? error.message : 'Failed to fetch invoices',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Filter and paginate
  const filteredInvoices = invoices.filter((invoice) =>
    Object.values(invoice).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const paginatedInvoices = filteredInvoices.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  const totalPages = Math.ceil(filteredInvoices.length / ROWS_PER_PAGE);

  const handleViewDetails = (invoice: any) => {
    setSelectedInvoice(invoice);
    setOpenDetailDialog(true);
  };

  const handleDownloadPdf = async (invoice: any) => {
    try {
      setDownloadingId(invoice.id);
      
      // Transform invoice data to match backend expected format
      // Include all existing invoice data for accurate PDF generation
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
      
      const res = await fetch('/api/invoices/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to download PDF');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber || Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSnackbar({
        open: true,
        message: 'PDF downloaded successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to download PDF:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download PDF',
        severity: 'error',
      });
    } finally {
      setDownloadingId(null);
    }
  };

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
    <Box sx={{ width: '100%', height: '100%', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Invoices
      </Typography>

      {/* Search Bar */}
      <Paper
        elevation={1}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1,
          mb: 2,
          borderRadius: 2,
        }}
      >
        <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
        <InputBase
          placeholder="Search invoices..."
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableCell>
                <strong>Invoice #</strong>
              </TableCell>
              <TableCell>
                <strong>Lead</strong>
              </TableCell>
              <TableCell>
                <strong>Sent By</strong>
              </TableCell>
              <TableCell>
                <strong>Date</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Sub Total</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Tax</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Grand Total</strong>
              </TableCell>
              {/* <TableCell> */}
              {/*   <strong>Status</strong> */}
              {/* </TableCell> */}
              <TableCell align="center">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.lead?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {invoice.companyUser ? (
                      <Box>
                        <Typography variant="body2">
                          {invoice.companyUser.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.companyUser.email}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    ${Number(parseFloat(invoice.subTotal)).toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell align="right">
                    $
                    {Number(parseFloat(invoice.taxAmount)).toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      $
                      {Number(parseFloat(invoice.grandTotal)).toFixed(2) ||
                        '0.00'}
                    </strong>
                  </TableCell>
                  {/* <TableCell> */}
                  {/*   <Chip */}
                  {/*     label={invoice.status} */}
                  {/*     color={getStatusColor(invoice.status)} */}
                  {/*     size="small" */}
                  {/*   /> */}
                  {/* </TableCell> */}
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewDetails(invoice)}
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleDownloadPdf(invoice)}
                      disabled={downloadingId === invoice.id}
                      title="Download PDF"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Detail Dialog */}
      <InvoiceDetailDialog
        open={openDetailDialog}
        invoice={selectedInvoice}
        onClose={() => {
          setOpenDetailDialog(false);
          setSelectedInvoice(null);
        }}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoicesTable;
