'use client';

import { AttachFile, Close, Message } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

interface LeadMessageDialogProps {
  open: boolean;
  onClose: () => void;
  lead: {
    id: number;
    name: string;
    phone: string;
  };
  onMessageSent: (messageData: {
    recipient: string;
    message: string;
    channel: string;
  }) => void;
}

const LeadMessageDialog: React.FC<LeadMessageDialogProps> = ({
  open,
  onClose,
  lead,
  onMessageSent,
}) => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('sms');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    setIsSending(true);
    onMessageSent({
      recipient: lead.phone,
      message,
      channel,
    });

    // Simulate sending delay
    setTimeout(() => {
      setIsSending(false);
      setMessage('');
      setAttachments([]);
      onClose();
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...filesArray]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Message color="primary" />
            <Typography variant="h6">Send Message to {lead.name}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Recipient:{' '}
            <strong>
              {lead.name} ({lead.phone})
            </strong>
          </Typography>

          <Box sx={{ mt: 2, mb: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Channel</InputLabel>
              <Select
                value={channel}
                label="Channel"
                onChange={(e) => setChannel(e.target.value as string)}
              >
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="messenger">Messenger</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            multiline
            rows={6}
            fullWidth
            label="Message"
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${lead.name},\n\nHow can I help you today?`}
            sx={{ mb: 2 }}
          />

          {attachments.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Attachments:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {attachments.map((file, index) => (
                  <Chip
                    key={file.name}
                    label={file.name}
                    onDelete={() => removeAttachment(index)}
                    size="small"
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
          )}

          <Button
            variant="outlined"
            component="label"
            startIcon={<AttachFile />}
            sx={{ mb: 2 }}
          >
            Attach File
            <input type="file" hidden multiple onChange={handleFileChange} />
          </Button>

          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.grey[50],
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>Message Preview:</strong>{' '}
              {message || 'No message content'}
            </Typography>
            {attachments.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Attachments: {attachments.length} file(s)
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cancel
        </Button>

        <Button
          onClick={handleSend}
          variant="contained"
          disabled={!message.trim() || isSending}
          startIcon={<Message />}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
          }}
        >
          {isSending ? 'Sending...' : 'Send Message'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeadMessageDialog;
