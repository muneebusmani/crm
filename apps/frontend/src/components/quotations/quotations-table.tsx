'use client';

import { useState, useEffect } from 'react';
import {
  Box,
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
import type { QuotationResponse } from '@crm/types';
import { get } from '@/lib/api';
import QuotationDetailDialog from './quotation-detail-dialog';

const QuotationsTable: React.FC = () => {
  const theme = useTheme();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const ROWS_PER_PAGE = 10;

  // Fetch quotations from API

  useEffect(() => {
    const fetchQuotations = async () => {
      setLoading(true);
      try {
        const response = await get('/quotations');
        console.log('Quotations Response:', response);
        setQuotations(response.data || []);
      } catch (error) {
        setSnackbar({
          open: true,
          message:
            error instanceof Error
              ? error.message
              : 'Failed to fetch quotations',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  // Filter and paginate
  const filteredQuotations = quotations.filter((quotation) =>
    Object.values(quotation).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const paginatedQuotations = filteredQuotations.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  const totalPages = Math.ceil(filteredQuotations.length / ROWS_PER_PAGE);

  const handleViewDetails = (quotation: any) => {
    setSelectedQuotation(quotation);
    setOpenDetailDialog(true);
  };

  const handleDownloadPdf = async (quotation: any) => {
    try {
      setDownloadingId(quotation.id);
      
      // Transform quotation data to match backend expected format
      // Include all existing quotation data for accurate PDF generation
      const payload = {
        quotationNumber: quotation.quotationNumber,
        leadId: quotation.lead?.id || quotation.leadId,
        date: quotation.date,
        sellerNote: quotation.sellerNote || '',
        items: quotation.items || [],
        subTotal: Number(quotation.subTotal) || 0,
        taxAmount: Number(quotation.taxAmount) || 0,
        grandTotal: Number(quotation.grandTotal) || 0,
        recoveryLocation: quotation.recoveryLocation || '',
        deliveryLocation: quotation.deliveryLocation || '',
      };
      
      const res = await fetch('/api/quotations/download-pdf', {
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
      a.download = `quotation-${quotation.quotationNumber || Date.now()}.pdf`;
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

  return (
    <Box sx={{ width: '100%', height: '100%', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Quotations
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
          placeholder="Search quotations..."
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
                <strong>Quotation #</strong>
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
              <TableCell align="center">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedQuotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No quotations found
                </TableCell>
              </TableRow>
            ) : (
              paginatedQuotations.map((quotation) => (
                <TableRow key={quotation.id} hover>
                  <TableCell>{quotation.quotationNumber || 'N/A'}</TableCell>
                  <TableCell>{quotation.lead?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {quotation.companyUser ? (
                      <Box>
                        <Typography variant="body2">
                          {quotation.companyUser.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {quotation.companyUser.email}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {quotation.date
                      ? new Date(quotation.date).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    ${Number(quotation.subTotal)?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell align="right">
                    ${Number(quotation.taxAmount)?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      ${Number(quotation.grandTotal)?.toFixed(2) || '0.00'}
                    </strong>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewDetails(quotation)}
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleDownloadPdf(quotation)}
                      disabled={downloadingId === quotation.id}
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
      <QuotationDetailDialog
        open={openDetailDialog}
        quotation={selectedQuotation}
        onClose={() => {
          setOpenDetailDialog(false);
          setSelectedQuotation(null);
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

export default QuotationsTable;
