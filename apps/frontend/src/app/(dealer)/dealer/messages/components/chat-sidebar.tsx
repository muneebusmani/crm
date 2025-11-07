'use client';
import type { Lead } from '@crm/types';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { leadsApi } from '@/services/leads.service';
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
  onNewChat: (
    leadId: string,
    leadData?: {
      name?: string;
      email?: string;
      vehicle_brand?: string;
      vehicle_model?: string;
    },
  ) => void;
}

export default function Sidebar({
  chats,
  onSelectChat,
  onNewChat,
}: SidebarProps) {
  const theme = useTheme();

  const [isAddingChat, setIsAddingChat] = useState(false);
  const [uncontactedLeads, setUncontactedLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const loadUncontactedLeads = useCallback(async () => {
    try {
      setIsLoadingLeads(true);
      const leads = await leadsApi.getUncontacted();
      console.log('contacted leads:');
      const validLeads = leads.filter((lead): lead is Lead =>
        Boolean(lead?.id),
      );
      setUncontactedLeads(validLeads);
      console.log('uncontacted leads:', validLeads);
    } catch (error) {
      console.error('Error loading uncontacted leads:', error);
    } finally {
      setIsLoadingLeads(false);
    }
  }, []);

  useEffect(() => {
    if (isAddingChat) {
      loadUncontactedLeads();
    }
  }, [isAddingChat, loadUncontactedLeads]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectLead = (lead: Lead) => {
    if (lead.id) {
      onNewChat(lead.id.toString(), {
        name: lead.name,
        email: lead.email as string,
        vehicle_brand: lead.vehicle_brand,
        vehicle_model: lead.vehicle_model,
      });
      handleClose();
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

      {/* New Chat Button */}
      {isAddingChat && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Select a lead to start chatting
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClick}
              endIcon={
                open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
              }
              disabled={isLoadingLeads}
              sx={{
                justifyContent: 'space-between',
                textTransform: 'none',
                mb: 1,
              }}
            >
              {isLoadingLeads ? 'Loading leads...' : 'Select Lead'}
              {isLoadingLeads && <CircularProgress size={20} sx={{ ml: 1 }} />}
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              slotProps={{
                paper: {
                  style: {
                    maxHeight: 300,
                    width: '300px',
                  },
                },
              }}
            >
              {uncontactedLeads.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {isLoadingLeads
                      ? 'Loading...'
                      : 'No uncontacted leads found'}
                  </Typography>
                </Box>
              ) : (
                uncontactedLeads.map((lead) => (
                  <MenuItem
                    key={lead.id}
                    onClick={() => handleSelectLead(lead)}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      <Avatar
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(lead.name || `Lead ${lead.id}`)}&background=3f51b5&color=ffffff`}
                        sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={lead.name || `Lead #${lead.id}`}
                      secondary={`${lead.vehicle_brand || ''} ${lead.vehicle_model || ''}`.trim()}
                      slotProps={{
                        primary: {
                          variant: 'subtitle2',
                          noWrap: true,
                        },
                        secondary: {
                          variant: 'caption',
                          noWrap: true,
                        },
                      }}
                    />
                  </MenuItem>
                ))
              )}
            </Menu>

            <Divider sx={{ my: 1 }} />

            <Button
              size="small"
              color="inherit"
              onClick={() => {
                setIsAddingChat(false);
                handleClose();
              }}
              fullWidth
              sx={{ justifyContent: 'flex-start', pl: 1 }}
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
                onClick={() => onSelectChat(chat.id)}
              />
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
