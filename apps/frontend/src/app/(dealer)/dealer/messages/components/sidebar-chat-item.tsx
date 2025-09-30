'use client';
import { Avatar, Box, styled, Typography } from '@mui/material';

const ChatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  cursor: 'pointer',
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface SidebarChatItemProps {
  name: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl: string;
  onClick: () => void;
}

export default function SidebarChatItem({
  name,
  lastMessage,
  timestamp,
  avatarUrl,
  onClick,
}: SidebarChatItemProps) {
  const initials = (fullName: string) => {
    const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'L';
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase() || 'L';
  };
  return (
    <ChatItem onClick={onClick}>
      <Avatar src={avatarUrl} alt={name} sx={{ width: 40, height: 40 }}>
        {initials(name)}
      </Avatar>
      <Box sx={{ marginLeft: 1, flex: 1 }}>
        <Typography variant="subtitle2" color="primary">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {lastMessage}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {timestamp}
      </Typography>
    </ChatItem>
  );
}
