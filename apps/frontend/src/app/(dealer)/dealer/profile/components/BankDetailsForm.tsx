'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { post, put } from '@/lib/api';

type BankDetails = {
  id?: number;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  ifscCode?: string;
  iban?: string;
  swiftCode?: string;
};

const defaultValues: BankDetails = {
  accountHolderName: '',
  accountNumber: '',
  bankName: '',
  branchName: '',
  ifscCode: '',
  iban: '',
  swiftCode: '',
};

interface BankDetailsFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: BankDetails | null;
}

export default function BankDetailsForm({
  open,
  onClose,
  onSuccess,
  initialData,
}: BankDetailsFormProps) {
  const [formData, setFormData] = useState<BankDetails>(defaultValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setIsEdit(true);
    } else {
      setFormData(defaultValues);
      setIsEdit(false);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit && formData.id) {
        // Update existing bank details
        await put(`/bank-details/${formData.id}`, formData);
      } else {
        // Create new bank details
        await post(`/bank-details`, formData);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'An error occurred while saving bank details',
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Error saving bank details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Update Bank Details' : 'Add Bank Details'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              name="accountHolderName"
              label="Account Holder Name"
              value={formData.accountHolderName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              required
              name="accountNumber"
              label="Account Number"
              value={formData.accountNumber}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              required
              name="bankName"
              label="Bank Name"
              value={formData.bankName}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              name="branchName"
              label="Branch Name"
              value={formData.branchName || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              name="ifscCode"
              label="IFSC Code"
              value={formData.ifscCode || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              name="iban"
              label="IBAN"
              value={formData.iban || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              name="swiftCode"
              label="SWIFT Code"
              value={formData.swiftCode || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading
              ? isEdit
                ? 'Updating...'
                : 'Saving...'
              : isEdit
                ? 'Update'
                : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
