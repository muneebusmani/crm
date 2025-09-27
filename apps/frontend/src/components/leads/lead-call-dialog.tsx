'use client';

import { Close, Phone } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

interface LeadCallDialogProps {
  open: boolean;
  onClose: () => void;
  lead: {
    id: number;
    name: string;
    phone: string;
  };
  onCallInitiated: (phoneNumber: string) => void;
}

const LeadCallDialog: React.FC<LeadCallDialogProps> = ({
  open,
  onClose,
  lead,
  onCallInitiated,
}) => {
  const theme = useTheme();
  const [callStatus, setCallStatus] = useState<
    'idle' | 'calling' | 'connected'
  >('idle');

  const handleCall = () => {
    setCallStatus('calling');
    onCallInitiated(lead.phone);
    // Simulate call connection after 2 seconds
    setTimeout(() => {
      setCallStatus('connected');
    }, 2000);
  };

  const handleClose = () => {
    setCallStatus('idle');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Phone color="primary" />
            <Typography variant="h6">Call {lead.name}</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Phone Number: <strong>{lead.phone}</strong>
          </Typography>

          <Box
            sx={{
              mt: 3,
              p: 3,
              border: `2px solid ${theme.palette.primary.main}`,
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" color="primary" gutterBottom>
              {callStatus === 'idle' && 'Ready to Call'}
              {callStatus === 'calling' && 'Calling...'}
              {callStatus === 'connected' && 'Call Connected'}
            </Typography>

            {callStatus === 'idle' && (
              <Typography variant="body2" color="text.secondary">
                Click the button below to initiate a call
              </Typography>
            )}

            {callStatus === 'calling' && (
              <Typography variant="body2" color="text.secondary">
                Connecting to {lead.name}...
              </Typography>
            )}

            {callStatus === 'connected' && (
              <Typography variant="body2" color="success.main">
                You are now connected with {lead.name}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          Cancel
        </Button>

        {callStatus === 'idle' && (
          <Button
            onClick={handleCall}
            variant="contained"
            color="primary"
            startIcon={<Phone />}
            sx={{
              backgroundColor: theme.palette.success.main,
              '&:hover': { backgroundColor: theme.palette.success.dark },
            }}
          >
            Initiate Call
          </Button>
        )}

        {callStatus === 'connected' && (
          <Button onClick={handleClose} variant="contained" color="error">
            End Call
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LeadCallDialog;
