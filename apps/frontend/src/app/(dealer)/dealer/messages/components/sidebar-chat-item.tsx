import { Box, styled, Typography } from '@mui/material';
import Image from 'next/image';

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
  isSelected: boolean;
  onClick: () => void;
}

export default function SidebarChatItem({
  name,
  lastMessage,
  timestamp,
  avatarUrl,
  isSelected,
  onClick,
}: SidebarChatItemProps) {
  return (
    <ChatItem onClick={onClick}>
      <Box sx={{ width: 40, height: 40 }}>
        <Image
          src={avatarUrl}
          alt={name}
          width={40}
          height={40}
          loading="eager"
          style={{ borderRadius: '50%', objectFit: 'cover' }}
        />
      </Box>
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
