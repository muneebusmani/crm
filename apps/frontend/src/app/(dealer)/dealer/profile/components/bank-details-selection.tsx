'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import BankDetailsForm from './bank-details-form';
import { get } from '@/lib/api';

type BankDetails = {
  id: number;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  ifscCode?: string;
  iban?: string;
  swiftCode?: string;
};

type Response = {
  data: BankDetails[];
};
export default function BankDetailsSection() {
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBankDetails, setEditingBankDetails] =
    useState<BankDetails | null>(null);

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        setLoading(true);
        const { data } = await get(`/bank-details`);

        if (data && data.length > 0) {
          console.log('Bank Details ===>', data[0]);
          setBankDetails(data[0]); // Assuming we only work with one bank account for now
        } else {
          setBankDetails(null);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || 'Failed to fetch bank details',
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        console.error('Error fetching bank details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, []); // Empty dependency array since we don't have any dependencies

  const handleAddClick = () => {
    setEditingBankDetails(null);
    setIsFormOpen(true);
  };

  const handleEditClick = () => {
    if (bankDetails) {
      setEditingBankDetails(bankDetails);
      setIsFormOpen(true);
    }
  };

  const handleFormSuccess = async () => {
    try {
      setLoading(true);

      const { data } = await get<Response>(`/bank-details`);

      if (data && data.length > 0) {
        setBankDetails(data[0]);
      } else {
        setBankDetails(null);
      }
    } catch (err) {
      console.error('Error refreshing bank details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingBankDetails(null);
  };

  const formatAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return '';
    // Show only last 4 digits, mask the rest
    const visibleDigits = 4;
    const masked = '*'.repeat(
      Math.max(0, accountNumber.length - visibleDigits),
    );
    const visible = accountNumber.slice(-visibleDigits);
    return masked + visible;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Bank Details</Typography>
        {bankDetails ? (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
            size="small"
          >
            Edit
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            size="small"
          >
            Add Bank Details
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {bankDetails ? (
        <Card variant="outlined">
          <CardContent>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Account Holder
                </Typography>
                <Typography variant="body1">
                  {bankDetails.accountHolderName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Account Number
                </Typography>
                <Typography variant="body1">
                  {formatAccountNumber(bankDetails.accountNumber)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Bank Name
                </Typography>
                <Typography variant="body1">{bankDetails.bankName}</Typography>
              </Box>
              {bankDetails.branchName && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Branch Name
                  </Typography>
                  <Typography variant="body1">
                    {bankDetails.branchName}
                  </Typography>
                </Box>
              )}
              {bankDetails.ifscCode && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    IFSC Code
                  </Typography>
                  <Typography variant="body1">
                    {bankDetails.ifscCode}
                  </Typography>
                </Box>
              )}
              {bankDetails.iban && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    IBAN
                  </Typography>
                  <Typography variant="body1">{bankDetails.iban}</Typography>
                </Box>
              )}
              {bankDetails.swiftCode && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    SWIFT Code
                  </Typography>
                  <Typography variant="body1">
                    {bankDetails.swiftCode}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={4}
          border="1px dashed"
          borderColor="divider"
          borderRadius={1}
        >
          <Typography variant="body1" color="textSecondary" gutterBottom>
            No bank details added yet
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            size="small"
          >
            Add Bank Details
          </Button>
        </Box>
      )}

      <BankDetailsForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        initialData={editingBankDetails}
      />
    </Box>
  );
}
