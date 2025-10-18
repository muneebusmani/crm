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
} from '@mui/icons-material';
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

  const ROWS_PER_PAGE = 10;

  // Fetch quotations from API

  useEffect(() => {
    const fetchQuotations = async () => {
      setLoading(true);
      try {
        console.log('step 1');
        const response = await get('/dealers/all/quotations');
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
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Lead</strong>
              </TableCell>
              <TableCell>
                <strong>Engine Code</strong>
              </TableCell>
              <TableCell>
                <strong>Subject</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Price</strong>
              </TableCell>
              <TableCell>
                <strong>Date</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedQuotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No quotations found
                </TableCell>
              </TableRow>
            ) : (
              paginatedQuotations.map((quotation) => (
                <TableRow key={quotation.id} hover>
                  <TableCell>#{quotation.id}</TableCell>
                  <TableCell>{quotation.lead?.name || 'N/A'}</TableCell>
                  <TableCell>{quotation.engineCodeName || 'N/A'}</TableCell>
                  <TableCell>
                    {quotation.subject?.substring(0, 50) || 'N/A'}
                    {quotation.subject?.length > 50 && '...'}
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      ${Number(quotation.quotationPrice)?.toFixed(2) || '0.00'}
                    </strong>
                  </TableCell>
                  <TableCell>
                    {quotation.createdAt
                      ? new Date(quotation.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewDetails(quotation)}
                    >
                      <VisibilityIcon />
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
