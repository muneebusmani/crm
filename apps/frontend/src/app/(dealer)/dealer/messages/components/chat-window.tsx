import type { Message, QuotationMessage } from '@dealer/types/chat';
import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  Paper,
  Avatar,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import QuotationDialog from './quotation-dialog';
import ChatInput from './chat-input';
import MessageBubble from './message-bubble';
import { Person } from '@mui/icons-material';

interface ChatWindowProps {
  messages: Message[];
  onSend: (text: string) => void;
  isLoading: boolean;
  onAttach: () => void;
  onRequestQuote: () => void;
  currentChatId?: string | null;
  leadName?: string;
  dealerName: string;
}

export default function ChatWindow({
  messages = [],
  onSend,
  isLoading,
  onAttach,
  onRequestQuote,
  currentChatId,
  leadName,
  dealerName,
}: ChatWindowProps) {
  console.log('messages object in chat window ===>', messages);
  const [isSending, setIsSending] = useState(false);
  const [showQuotationDialog, setShowQuotationDialog] = useState(false);
  const [quotationStatus, setQuotationStatus] = useState<
    Record<string, 'pending' | 'accepted' | 'rejected'>
  >({});
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

  const handleQuotationSent = (
    quotation: Omit<
      QuotationMessage,
      'id' | 'timestamp' | 'sender' | 'type' | 'senderName'
    >,
  ) => {
    // The quotation will be added to the messages array by the parent component
  };

  const handleQuoteAction = (
    messageId: string,
    action: 'accept' | 'reject',
  ) => {
    setQuotationStatus((prev) => ({
      ...prev,
      [messageId]: action === 'accept' ? 'accepted' : 'rejected',
    }));

    // Here you would typically make an API call to update the quotation status
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isSending) return;

    try {
      setIsSending(true);
      // Check if the text is a JSON string (for quotations)
      // Check if the text is a JSON string (for quotations)
      if (text.startsWith('{') && text.endsWith('}')) {
        try {
          const parsed = JSON.parse(text);
          if (parsed.type === 'quotation') {
            // If it's a quotation, send it as a formatted message
            await onSend(
              `[Quotation] ${parsed.subject}: $${parsed.price?.toFixed(2) || '0.00'}`,
            );
            return;
          }
        } catch {
          // If JSON parsing fails, continue to send as regular text
        }
      }
      // Send as regular text if not a quotation or if parsing fails
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
            onRequestQuote={onRequestQuote}
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
            onRequestQuote={onRequestQuote}
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
            {leadName ||
              (currentChatId ? `Lead #${currentChatId}` : 'Unknown User')}
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
        {messages.map((message) => {
          if (message.type === 'quotation') {
            // Handle quotation messages
            const quotationMessage = message as QuotationMessage;
            const formattedMessage: QuotationMessage = {
              ...quotationMessage,
              status:
                quotationStatus[message.id] ||
                quotationMessage.status ||
                'pending',
              subject: quotationMessage.subject || 'Quotation',
              message:
                quotationMessage.message || quotationMessage.content || '',
            };

            return (
              <MessageBubble
                key={formattedMessage.id}
                message={formattedMessage}
                isOwnMessage={formattedMessage.sender === 'user'}
                dealerName={dealerName}
                onQuoteAction={handleQuoteAction}
              />
            );
          } else {
            // Handle regular text messages
            const textMessage = message as Message;
            const messageWithText = textMessage as Message & { text?: string };
            const formattedMessage = {
              ...textMessage,
              content: textMessage.content || messageWithText.text || '',
            };

            return (
              <MessageBubble
                key={formattedMessage.id}
                message={formattedMessage}
                isOwnMessage={formattedMessage.sender === 'user'}
                dealerName={dealerName}
                onQuoteAction={undefined}
              />
            );
          }
        })}
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
          onRequestQuote={() => setShowQuotationDialog(true)}
          isSending={isSending}
          disabled={!currentChatId}
        />

        {currentChatId && (
          <QuotationDialog
            open={showQuotationDialog}
            onClose={() => setShowQuotationDialog(false)}
            leadId={parseInt(currentChatId, 10)}
            onQuotationSent={(quotation) => {
              handleQuotationSent(quotation);
              // Create a properly typed message for the chat
              const messageToSend: Omit<QuotationMessage, 'id'> = {
                type: 'quotation',
                content: `Quotation: ${quotation.subject}\n${quotation.message}\nPrice: $${quotation.price.toFixed(2)}`,
                createdAt: new Date().toISOString(),
                sender: 'user',
                senderName: dealerName,
                status: 'pending',
                price: quotation.price,
                subject: quotation.subject,
                message: quotation.message,
              };
              onSend(JSON.stringify(messageToSend));
            }}
          />
        )}
      </Box>
    </Box>
  );
}
