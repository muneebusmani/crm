'use client';

import {
  Avatar,
  Box,
  Card,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  SupportAgent as SupportIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import { get, post } from '@/lib/api';

interface Message {
  id: number;
  senderId: number;
  senderRole: 'dealer' | 'admin';
  body: string;
  createdAt: string;
}

interface ApiResponse<T> {
  data?: T;
  success: boolean;
  error?: string;
}

/**
 * Support Chat Component
 * Enables dealer to communicate with admin support team
 */
export default function SupportChat() {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation on mount
  useEffect(() => {
    loadConversation();
  }, []);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const response = await get<Message[]>('/messages/dealer');
      
      // Handle both array response and ApiResponse wrapper
      if (Array.isArray(response)) {
        setMessages(response);
      } else if (response && typeof response === 'object') {
        const apiResp = response as ApiResponse<Message[]>;
        if (apiResp.success && apiResp.data) {
          setMessages(apiResp.data);
        }
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const response = await post<ApiResponse<Message>>('/messages/dealer', {
        body: messageText,
      });

      if (response.success && response.data) {
        // Add new message to the list
        setMessages((prev) => [...prev, response.data!]);
      } else {
        console.error('Failed to send message:', response.error);
        // Restore input on error
        setInputText(messageText);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore input on error
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'white', color: theme.palette.primary.main }}>
            <SupportIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Support Chat
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Get help with the CRM system
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 3,
          backgroundColor: theme.palette.grey[50],
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              py: 4,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mb: 2,
                bgcolor: theme.palette.primary.light,
              }}
            >
              <SupportIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Welcome to Support Chat
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
              Need help with the CRM? Send a message and our support team will
              assist you as soon as possible.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((message) => {
              const isAdmin = message.senderRole === 'admin';
              return (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: isAdmin ? 'flex-start' : 'flex-end',
                    gap: 1,
                  }}
                >
                  {isAdmin && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      <SupportIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAdmin ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        backgroundColor: isAdmin
                          ? 'white'
                          : theme.palette.primary.main,
                        color: isAdmin ? 'text.primary' : 'white',
                        borderRadius: 2,
                        borderTopLeftRadius: isAdmin ? 0 : 2,
                        borderTopRightRadius: isAdmin ? 2 : 0,
                      }}
                    >
                      {isAdmin && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            fontWeight: 600,
                            mb: 0.5,
                            color: theme.palette.primary.main,
                          }}
                        >
                          Support Team
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      >
                        {message.body}
                      </Typography>
                    </Paper>
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        color: 'text.secondary',
                        fontSize: '0.7rem',
                      }}
                    >
                      {formatTime(message.createdAt)}
                    </Typography>
                  </Box>
                  {!isAdmin && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: theme.palette.grey[400],
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: 'white',
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          disabled={sending}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={!inputText.trim() || sending}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                    '&.Mui-disabled': {
                      bgcolor: theme.palette.grey[300],
                      color: theme.palette.grey[500],
                    },
                  }}
                >
                  {sending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <SendIcon />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.grey[50],
              '& fieldset': {
                borderColor: theme.palette.grey[300],
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1 }}
        >
          Press Enter to send • Shift + Enter for new line
        </Typography>
      </Box>
    </Card>
  );
}
