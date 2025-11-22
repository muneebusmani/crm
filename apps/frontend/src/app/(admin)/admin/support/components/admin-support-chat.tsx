'use client';

import {
  Avatar,
  Badge,
  Box,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  SupportAgent as SupportIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import { get, post } from '@/lib/api';

interface Message {
  id: number;
  senderId: number;
  senderRole: 'dealer' | 'admin';
  body: string;
  createdAt: string;
  conversation: {
    id: number;
    dealerId: number;
    adminId: number;
    createdAt: string;
  };
}

interface DealerConversation {
  dealerId: number;
  dealerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

interface Dealer {
  id: number;
  email: string;
  username: string;
  dealer?: {
    name: string;
    owner: string;
    logo?: string;
  };
}

interface ApiResponse<T> {
  data?: T;
  success: boolean;
  error?: string;
}

/**
 * Admin Support Chat Component
 * Manages multiple dealer support conversations
 */
export default function AdminSupportChat() {
  const theme = useTheme();
  const [conversations, setConversations] = useState<DealerConversation[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dealersMap, setDealersMap] = useState<Map<number, Dealer>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedDealerId) {
      scrollToBottom();
    }
  }, [selectedDealerId, conversations]);

  // Load all dealers first
  useEffect(() => {
    loadDealers();
  }, []);

  // Load conversations
  useEffect(() => {
    if (dealersMap.size > 0) {
      loadAllConversations();
    }
  }, [dealersMap]);

  const loadDealers = async () => {
    try {
      const response = await get<Dealer[]>('/dealers');
      const dealers = Array.isArray(response) ? response : [];
      const map = new Map<number, Dealer>();
      dealers.forEach((dealer) => {
        map.set(dealer.id, dealer);
      });
      setDealersMap(map);
    } catch (error) {
      console.error('Failed to load dealers:', error);
    }
  };

  const loadAllConversations = async () => {
    try {
      setLoading(true);
      const response = await get<Message[]>('/messages/admin');
      const messages = Array.isArray(response) ? response : [];

      // Group messages by dealerId
      const conversationMap = new Map<number, Message[]>();
      messages.forEach((msg) => {
        const dealerId = msg.conversation.dealerId;
        if (!conversationMap.has(dealerId)) {
          conversationMap.set(dealerId, []);
        }
        conversationMap.get(dealerId)!.push(msg);
      });

      // Convert to DealerConversation array
      const convos: DealerConversation[] = [];
      conversationMap.forEach((msgs, dealerId) => {
        const sortedMsgs = msgs.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        const lastMsg = sortedMsgs[sortedMsgs.length - 1];
        const dealer = dealersMap.get(dealerId);

        convos.push({
          dealerId,
          dealerName:
            dealer?.dealer?.name || dealer?.username || `Dealer ${dealerId}`,
          lastMessage: lastMsg.body,
          lastMessageTime: lastMsg.createdAt,
          unreadCount: 0, // Can be enhanced later
          messages: sortedMsgs,
        });
      });

      // Sort by most recent message
      convos.sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime(),
      );

      setConversations(convos);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshConversations = async () => {
    setRefreshing(true);
    await loadAllConversations();
    setRefreshing(false);
  };

  const loadDealerConversation = async (dealerId: number) => {
    try {
      const response = await get<Message[]>(`/messages/admin/${dealerId}`);
      const messages = Array.isArray(response) ? response : [];

      // Update the conversation in state
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.dealerId === dealerId) {
            const sortedMsgs = messages.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            );
            const lastMsg = sortedMsgs[sortedMsgs.length - 1];
            return {
              ...conv,
              messages: sortedMsgs,
              lastMessage: lastMsg?.body || conv.lastMessage,
              lastMessageTime: lastMsg?.createdAt || conv.lastMessageTime,
            };
          }
          return conv;
        }),
      );
    } catch (error) {
      console.error('Failed to load dealer conversation:', error);
    }
  };

  const handleSelectDealer = (dealerId: number) => {
    setSelectedDealerId(dealerId);
    loadDealerConversation(dealerId);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedDealerId || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const response = await post<ApiResponse<Message>>(
        `/messages/admin/${selectedDealerId}`,
        { body: messageText },
      );

      if (response.success && response.data) {
        // Reload the conversation to get the latest messages
        await loadDealerConversation(selectedDealerId);
      } else {
        console.error('Failed to send message:', response.error);
        setInputText(messageText);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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

  const selectedConversation = conversations.find(
    (c) => c.dealerId === selectedDealerId,
  );

  const filteredConversations = conversations.filter((conv) =>
    conv.dealerName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
        overflow: 'hidden',
      }}
    >
      {/* Left Sidebar - Conversation List */}
      <Box
        sx={{
          width: 350,
          borderRight: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Support Tickets
            </Typography>
            <IconButton
              size="small"
              onClick={refreshConversations}
              disabled={refreshing}
              sx={{ color: 'white' }}
            >
              <RefreshIcon
                sx={{
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                }}
              />
            </IconButton>
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {conversations.length} active conversation
            {conversations.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search dealers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Conversation List */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? 'No conversations found'
                  : 'No support requests yet'}
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredConversations.map((conv) => (
                <ListItem key={conv.dealerId} disablePadding>
                  <ListItemButton
                    selected={selectedDealerId === conv.dealerId}
                    onClick={() => handleSelectDealer(conv.dealerId)}
                    sx={{
                      py: 2,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.action.selected,
                        borderLeft: `3px solid ${theme.palette.primary.main}`,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={conv.unreadCount}
                        color="error"
                        invisible={conv.unreadCount === 0}
                      >
                        <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                          <PersonIcon />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600}>
                          {conv.dealerName}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {conv.lastMessage}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(conv.lastMessageTime)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* Right Side - Chat Window */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: 'white',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedConversation.dealerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Dealer ID: {selectedConversation.dealerId}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 3,
                backgroundColor: theme.palette.grey[50],
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedConversation.messages.map((message) => {
                  const isAdmin = message.senderRole === 'admin';
                  return (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                        gap: 1,
                      }}
                    >
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
                      <Box
                        sx={{
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isAdmin ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            backgroundColor: isAdmin
                              ? theme.palette.primary.main
                              : 'white',
                            color: isAdmin ? 'white' : 'text.primary',
                            borderRadius: 2,
                            borderTopRightRadius: isAdmin ? 0 : 2,
                            borderTopLeftRadius: isAdmin ? 2 : 0,
                          }}
                        >
                          {!isAdmin && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                fontWeight: 600,
                                mb: 0.5,
                                color: theme.palette.primary.main,
                              }}
                            >
                              {selectedConversation.dealerName}
                            </Typography>
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                            }}
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
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Box>
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
                placeholder="Type your response..."
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
          </>
        ) : (
          /* Empty State */
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: theme.palette.primary.light,
                  margin: '0 auto 16px',
                }}
              >
                <SupportIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                No Conversation Selected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select a dealer from the list to view and respond to their
                support requests
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Card>
  );
}
