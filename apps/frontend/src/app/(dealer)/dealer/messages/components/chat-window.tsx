import type { Message } from '@dealer/types/chat';
import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  Paper,
  Avatar,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import ChatInput from './chat-input';
import MessageBubble from './message-bubble';
import { Person } from '@mui/icons-material';
// Icons
// const UserIcon = () => (
//   <svg
//     aria-label="User"
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     role="img"
//   >
//     <title>User</title>
//     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//     <circle cx="12" cy="7" r="4" />
//   </svg>
// );

interface ChatWindowProps {
  messages: Message[];
  onSend: (text: string) => void;
  isLoading: boolean;
  onAttach: () => void;
  currentChatId?: string | null;
  leadName?: string;
}

export default function ChatWindow({
  messages = [],
  onSend,
  isLoading,
  onAttach,
  currentChatId,
  leadName,
}: ChatWindowProps) {
  console.log('Rendering ChatWindow with messages:', messages);
  const [isSending, setIsSending] = useState(false);
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages, scrollToBottom]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isSending) return;

    try {
      setIsSending(true);
      await onSend(text);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optionally show error to user
    } finally {
      setIsSending(false);
    }
  };

  // Show loading state if no messages yet and still loading
  if (isLoading && messages.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
        {/* Keep the input box visible even when loading */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <ChatInput
            onSend={handleSend}
            onAttach={onAttach}
            isSending={isSending}
            disabled={!currentChatId}
          />
        </Box>
      </Box>
    );
  }

  // Show empty state if no messages
  if (messages.length === 0) {
    return (
      <Box
        width={'100%' as const}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          // backgroundColor: theme.palette.background.default,
          // backgroundColor: 'red',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: 400,
              width: '100%',
              backgroundColor: 'transparent',
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mb: 2,
                bgcolor: theme.palette.primary.main,
              }}
            >
              <Person />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {currentChatId ? 'No messages yet' : 'No chat selected'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {currentChatId
                ? 'Send a message to start the conversation'
                : 'Select a chat or start a new one'}
            </Typography>
          </Paper>
        </Box>
        {/* Keep the input box visible even when no messages */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: 'background.paper',
          }}
        >
          <ChatInput
            onSend={handleSend}
            onAttach={onAttach}
            isSending={isSending}
            disabled={!currentChatId}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        flex: 1,
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Chat Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          flexShrink: 0,
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            mr: 2,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
        >
          {(currentChatId || 'U')[0].toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="medium">
            {leadName || (currentChatId ? `Lead #${currentChatId}` : 'Unknown User')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          minHeight: 0, // Fix for Firefox flexbox issue
          '& > * + *': {
            mt: 1.5,
          },
        }}
      >
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id || index}
            message={message}
            isOwnMessage={message.sender === 'user'}
          />
        ))}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginLeft: 2,
              marginTop: 1,
              mb: 2,
            }}
          >
            <CircularProgress size={20} color="primary" />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.paper',
        }}
      >
        <ChatInput
          onSend={handleSend}
          onAttach={onAttach}
          isSending={isSending}
        />
      </Box>
    </Box>
  );
}
