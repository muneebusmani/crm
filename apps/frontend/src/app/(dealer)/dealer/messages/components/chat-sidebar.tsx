import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  List,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import SidebarChatItem from './sidebar-chat-item';

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl: string;
}

interface SidebarProps {
  chats: ChatItem[];
  currentChatId?: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: (leadId: string) => void;
}

export default function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
}: SidebarProps) {
  const theme = useTheme();

  const [newChatLeadId, setNewChatLeadId] = useState('');
  const [isAddingChat, setIsAddingChat] = useState(false);

  const handleStartNewChat = () => {
    if (newChatLeadId.trim()) {
      onNewChat(newChatLeadId);
      setNewChatLeadId('');
      setIsAddingChat(false);
    }
  };

  return (
    <Box
      sx={{
        width: 320,
        height: '100vh',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          padding: theme.spacing(2),
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Chats
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setIsAddingChat(true)}
        >
          New Chat
        </Button>
      </Box>

      {/* New Chat Form */}
      {isAddingChat && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Start a new chat with Lead ID
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Enter Lead ID"
                value={newChatLeadId}
                onChange={(e) => setNewChatLeadId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStartNewChat()}
              />
              <Button
                variant="contained"
                onClick={handleStartNewChat}
                disabled={!newChatLeadId.trim()}
              >
                Start
              </Button>
            </Box>
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                setIsAddingChat(false);
                setNewChatLeadId('');
              }}
            >
              Cancel
            </Button>
          </Paper>
        </Box>
      )}

      {/* Search */}
      <Box
        sx={{
          padding: theme.spacing(2),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.palette.action.hover,
            borderRadius: 1,
            px: 1,
            py: 0.5,
          }}
        >
          <IconButton size="small">
            <SearchIcon fontSize="small" />
          </IconButton>
          <InputBase
            placeholder="Search chats..."
            sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
          />
        </Box>
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {chats.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No chats yet. Start a new chat with a lead.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {chats.map((chat) => (
              <SidebarChatItem
                key={chat.id}
                name={chat.name}
                lastMessage={chat.lastMessage}
                timestamp={chat.timestamp}
                avatarUrl={chat.avatarUrl}
                isSelected={chat.id === currentChatId}
                onClick={() => onSelectChat(chat.id)}
              />
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
