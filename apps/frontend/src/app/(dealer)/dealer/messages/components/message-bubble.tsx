import type { Message, QuotationMessage } from '@dealer/types/chat';
import { Box, Paper, styled, Typography, Button, Chip } from '@mui/material';
import Image from 'next/image';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

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

interface MessageBubbleProps {
  message: Message;
  isOwnMessage?: boolean;
  onQuoteAction?: (messageId: string, action: 'accept' | 'reject') => void;
  dealerName: string;
}

export default function MessageBubble({
  message,
  isOwnMessage = false,
  onQuoteAction,
  dealerName = 'You',
}: MessageBubbleProps) {
  const formatTime = (date: Date | string | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const timestamp = 'createdAt' in message ? message.createdAt : undefined;
  const isQuotation = message.type === 'quotation';
  let quotation = null;
  if (isQuotation) {
    quotation = JSON.parse(message.message) as QuotationMessage;
  }

  // Generate avatar URL based on sender name
  const getAvatarUrl = (name: string) => {
    const encodedName = encodeURIComponent((name || 'U').substring(0, 2));
    return `https://ui-avatars.com/api/?name=${encodedName}&size=40&background=${
      isOwnMessage ? '3f51b5' : '757575'
    }&color=ffffff&type=png`;
  };

  // Use the sender from the message or default to 'User'
  const senderName = isOwnMessage ? dealerName : 'User';
  const avatarUrl = getAvatarUrl(senderName);

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
              minWidth: isQuotation ? '250px' : 'auto',
              backgroundColor: isQuotation
                ? isOwnMessage
                  ? 'rgba(63, 81, 181, 0.15)'
                  : 'rgba(0, 0, 0, 0.05)'
                : undefined,
            }}
          >
            {isQuotation ? (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                    gap: 1,
                    color: isOwnMessage ? 'primary.main' : 'text.primary',
                  }}
                >
                  <RequestQuoteIcon
                    fontSize="small"
                    color={isOwnMessage ? 'primary' : 'action'}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {quotation?.price
                      ? `Quotation: $${quotation.price.toFixed(2)}`
                      : 'Quotation'}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1.5, whiteSpace: 'pre-wrap' }}
                >
                  <strong>{quotation?.subject}</strong>
                  <br />
                  {quotation?.message}
                </Typography>
                {/* {quotation?.status && ( */}
                {/*   <Box */}
                {/*     sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }} */}
                {/*   > */}
                {/*     <Chip */}
                {/*       label={quotation.status.toUpperCase()} */}
                {/*       size="small" */}
                {/*       color={ */}
                {/*         quotation.status === "accepted" */}
                {/*           ? "success" */}
                {/*           : quotation.status === "rejected" */}
                {/*           ? "error" */}
                {/*           : "default" */}
                {/*       } */}
                {/*       sx={{ */}
                {/*         ml: 1, */}
                {/*         color: */}
                {/*           quotation.status === "pending" && isOwnMessage */}
                {/*             ? "primary.contrastText" */}
                {/*             : "inherit", */}
                {/*       }} */}
                {/*     /> */}
                {/*   </Box> */}
                {/* )} */}
                {/* {!isOwnMessage && */}
                {/*   (!quotation?.status || quotation.status === 'pending') && */}
                {/*   onQuoteAction && ( */}
                {/*     <Box */}
                {/*       sx={{ */}
                {/*         display: 'flex', */}
                {/*         gap: 1, */}
                {/*         mt: 2, */}
                {/*         justifyContent: 'flex-end', */}
                {/*       }} */}
                {/*     > */}
                {/*       <Button */}
                {/*         variant="outlined" */}
                {/*         size="small" */}
                {/*         color="error" */}
                {/*         onClick={() => onQuoteAction(message.id, 'reject')} */}
                {/*       > */}
                {/*         Reject */}
                {/*       </Button> */}
                {/*       <Button */}
                {/*         variant="contained" */}
                {/*         size="small" */}
                {/*         color="primary" */}
                {/*         onClick={() => onQuoteAction(message.id, 'accept')} */}
                {/*       > */}
                {/*         Accept */}
                {/*       </Button> */}
                {/*     </Box> */}
                {/*   )} */}
              </Box>
            ) : (
              <Box sx={{ whiteSpace: 'pre-line' }}>
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
              </Box>
            )}
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
