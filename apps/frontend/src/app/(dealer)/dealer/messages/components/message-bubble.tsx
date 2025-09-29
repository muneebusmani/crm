'use client';
import type { Message, QuotationMessage } from '@dealer/types/chat';
import { Box, Paper, styled, Typography } from '@mui/material';
import Image from 'next/image';

const Bubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1.5),
  margin: theme.spacing(0.5, isUser ? 1 : 3, 0.5, isUser ? 3 : 1),
  wordWrap: 'break-word',
  backgroundColor: isUser
    ? theme.palette.primary.main
    : theme.palette.grey[200],
  color: isUser ? theme.palette.common.white : theme.palette.text.primary,
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  borderRadius: isUser ? '18px 18px 0 18px' : '18px 18px 18px 0',
  boxShadow: 'none',
}));

const Timestamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  textAlign: 'right',
}));

type BaseProps = {
  dealerName: string;
  isOwnMessage: boolean;
  onQuoteAction?: (id: string, action: 'accept' | 'reject') => void;
};

type MessageBubbleProps =
  | (BaseProps & { message: Message; quotation?: never })
  | (BaseProps & { message?: never; quotation: QuotationMessage });

export default function MessageBubble({
  message,
  isOwnMessage,
  dealerName,
}: MessageBubbleProps) {
  const formatTime = (date: Date | string | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const timestamp = message?.createdAt;
  console.log('is own message ===>', isOwnMessage);

  // Generate avatar URL based on sender name
  const getAvatarUrl = (name: string) => {
    const encodedName = encodeURIComponent((name || 'U').substring(0, 2));
    return `https://ui-avatars.com/api/?name=${encodedName}&size=40&background=${
      isOwnMessage ? '3f51b5' : '757575'
    }&color=ffffff&type=png`;
  };

  // Use the sender from the message or default to 'User'
  const avatarUrl = getAvatarUrl(dealerName);

  const renderContent = () => {
    if (!message) return null;
    if (message.type === 'message') {
      return (
        <Typography
          variant="body2"
          sx={{
            wordBreak: 'break-word',
            color: isOwnMessage ? 'common.white' : 'text.primary',
            '& a': {
              color: isOwnMessage ? '#90caf9' : 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
          }}
        >
          {message.content}
        </Typography>
      );
    }

    // For quotation and invoice, the content is a JSON blob we created in the slice
    let data: any = {};
    try {
      data = JSON.parse(message.content);
    } catch {
      // fallback to raw content
      return (
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          {message.content}
        </Typography>
      );
    }

    if (message.type === 'quotation') {
      return (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Quotation
          </Typography>
          {data.subject && (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {data.subject}
            </Typography>
          )}
          {data.message && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {data.message}
            </Typography>
          )}
          {typeof data.price !== 'undefined' && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Price: ${Number(data.price).toFixed(2)}
            </Typography>
          )}
        </Box>
      );
    }

    if (message.type === 'invoice') {
      return (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Invoice
          </Typography>
          {data.invoiceNumber && (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {String(data.invoiceNumber)}
            </Typography>
          )}
          {data.total && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Total: ${Number(data.total).toFixed(2)}
            </Typography>
          )}
          {data.status && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Status: {String(data.status)}
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          maxWidth: '85%',
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={36}
            height={36}
            style={{ objectFit: 'cover' }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Bubble
            isUser={isOwnMessage}
            elevation={1}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: isOwnMessage
                  ? '0 2px 8px rgba(63, 81, 181, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
              },
              minWidth: 'auto',
              ...(message?.type === 'quotation'
                ? { backgroundColor: isOwnMessage ? '#2e7d32' : '#e8f5e9' }
                : {}),
              ...(message?.type === 'invoice'
                ? { backgroundColor: isOwnMessage ? '#ef6c00' : '#fff3e0' }
                : {}),
            }}
          >
            <Box sx={{ whiteSpace: 'pre-line' }}>{renderContent()}</Box>

            <Timestamp
              sx={{
                mt: 0.5,
                color: isOwnMessage
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'text.secondary',
                textAlign: 'right',
              }}
            >
              {formatTime(timestamp)}
            </Timestamp>
          </Bubble>
        </Box>
      </Box>
    </Box>
  );
}
