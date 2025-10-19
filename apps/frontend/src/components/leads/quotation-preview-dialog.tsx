'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface QuotationPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  htmlContent: string;
}

export default function QuotationPreviewDialog({
  open,
  onClose,
  htmlContent,
}: QuotationPreviewDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: '55vw',
          maxWidth: '1400px',
          height: '90vh',
          maxHeight: '90vh',
          m: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Quotation Preview
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <iframe
          srcDoc={htmlContent}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          title="Quotation Preview"
        />
      </DialogContent>
    </Dialog>
  );
}
