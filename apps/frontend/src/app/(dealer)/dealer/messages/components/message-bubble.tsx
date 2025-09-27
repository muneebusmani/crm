import type { Message } from '@dealer/types/chat';
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

interface MessageBubbleProps {
  message: Message;
  isOwnMessage?: boolean;
}

export default function MessageBubble({
  message,
  isOwnMessage = false,
}: MessageBubbleProps) {
  const formatTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Generate avatar URL based on sender name
  const getAvatarUrl = (name: string) => {
    const encodedName = encodeURIComponent((name || 'U').substring(0, 2));
    return `https://ui-avatars.com/api/?name=${encodedName}&size=40&background=${isOwnMessage ? '3f51b5' : '757575'}&color=ffffff&type=png`;
  };

  // Use the sender from the message or default to 'User'
  const senderName = isOwnMessage ? 'You' : message.sender || 'User';
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
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                '& a': {
                  color: isOwnMessage ? '#90caf9' : 'primary.main',
                  textDecoration: 'underline',
                  '&:hover': {
                    textDecoration: 'none',
                  },
                },
              }}
              dangerouslySetInnerHTML={{
                __html: message.text.replace(/\n/g, '<br />'),
              }}
            />
            <Timestamp
              sx={{
                mt: 0.5,
                color: isOwnMessage
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'text.secondary',
                textAlign: 'right',
              }}
            >
              {formatTime(message.timestamp)}
            </Timestamp>
          </Bubble>
        </Box>
      </Box>
    </Box>
  );
}
