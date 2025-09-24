// // components/sidebar-chat-item.tsx
// import { Box, styled, Typography } from "@mui/material";
//
// const ChatItem = styled(Box)(({ theme }) => ({
//   display: "flex",
//   alignItems: "center",
//   padding: theme.spacing(1),
//   cursor: "pointer",
//   borderBottom: `1px solid ${theme.palette.divider}`,
//   transition: "background-color 0.2s",
//   "&:hover": {
//     backgroundColor: theme.palette.action.hover,
//   },
// }));
//
// interface SidebarChatItemProps {
//   name: string;
//   lastMessage: string;
//   timestamp: string;
//   avatarUrl: string;
//   isSelected: boolean;
//   onClick: () => void;
// }
//
// export default function SidebarChatItem({
//   name,
//   lastMessage,
//   timestamp,
//   avatarUrl,
//   isSelected,
//   onClick,
// }: SidebarChatItemProps) {
//   return (
//     <ChatItem onClick={onClick}>
//       <Box sx={{ width: 40, height: 40 }}>
//         <img
//           src={avatarUrl}
//           alt={name}
//           style={{
//             width: "100%",
//             height: "100%",
//             borderRadius: "50%",
//             objectFit: "cover",
//           }}
//         />
//       </Box>
//       <Box sx={{ marginLeft: 1, flex: 1 }}>
//         <Typography variant="subtitle2" color="primary">
//           {name}
//         </Typography>
//         <Typography variant="body2" color="text.secondary" noWrap>
//           {lastMessage}
//         </Typography>
//       </Box>
//       <Typography variant="caption" color="text.secondary">
//         {timestamp}
//       </Typography>
//     </ChatItem>
//   );
// }
// components/sidebar-chat-item.tsx

import { Box, styled, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react'

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
}))

interface SidebarChatItemProps {
  name: string
  lastMessage: string
  timestamp: string
  avatarUrl: string
  isSelected: boolean
  onClick: () => void
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
  )
}
