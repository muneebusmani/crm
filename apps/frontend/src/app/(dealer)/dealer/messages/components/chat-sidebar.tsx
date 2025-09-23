// // components/sidebar.tsx
// import React from "react";
// import {
//   Box,
//   Divider,
//   InputBase,
//   IconButton,
//   Typography,
//   useTheme,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import SidebarChatItem from "./sidebar-chat-item";
//
// interface SidebarProps {
//   chats: {
//     id: string;
//     name: string;
//     lastMessage: string;
//     timestamp: string;
//     avatarUrl: string;
//   }[];
//   currentChatId: string;
//   onSelectChat: (id: string) => void;
// }
//
// export default function Sidebar({
//   chats,
//   currentChatId,
//   onSelectChat,
// }: SidebarProps) {
//   const theme = useTheme();
//
//   return (
//     <Box
//       sx={{
//         width: 320,
//         height: "100vh",
//         backgroundColor: theme.palette.background.paper,
//         borderRight: `1px solid ${theme.palette.divider}`,
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       {/* Header */}
//       <Box
//         sx={{
//           padding: theme.spacing(2),
//           borderBottom: `1px solid ${theme.palette.divider}`,
//         }}
//       >
//         <Typography variant="h6" fontWeight="bold">
//           Chats
//         </Typography>
//       </Box>
//
//       {/* Search */}
//       <Box
//         sx={{
//           padding: theme.spacing(1),
//           display: "flex",
//           alignItems: "center",
//           gap: 1,
//           backgroundColor: theme.palette.grey[800],
//           borderRadius: 1,
//           mx: 1,
//           mb: 1,
//         }}
//       >
//         <IconButton size="small">
//           <SearchIcon fontSize="small" />
//         </IconButton>
//         <InputBase
//           placeholder="Search or start a new chat"
//           sx={{
//             flex: 1,
//             fontSize: 14,
//             color: theme.palette.text.primary,
//           }}
//         />
//       </Box>
//
//       {/* Chat List */}
//       <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
//         {chats.map((chat) => (
//           <SidebarChatItem
//             key={chat.id}
//             name={chat.name}
//             lastMessage={chat.lastMessage}
//             timestamp={chat.timestamp}
//             avatarUrl={chat.avatarUrl}
//             isSelected={chat.id === currentChatId}
//             onClick={() => onSelectChat(chat.id)}
//           />
//         ))}
//       </Box>
//
//       {/* Footer */}
//       <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
//         <Typography variant="caption" color="text.secondary">
//           Your messages are end-to-end encrypted.
//         </Typography>
//       </Box>
//     </Box>
//   );
// }
// components/sidebar.tsx
import React from "react";
import {
  Box,
  Divider,
  InputBase,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SidebarChatItem from "./sidebar-chat-item";

interface SidebarProps {
  chats: {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    avatarUrl: string;
  }[];
  currentChatId: string;
  onSelectChat: (id: string) => void;
}

export default function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
}: SidebarProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: 320,
        height: "100vh",
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          padding: theme.spacing(2),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Chats
        </Typography>
      </Box>

      {/* Search */}
      <Box
        sx={{
          padding: theme.spacing(1),
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: theme.palette.grey[300],
          borderRadius: 1,
          mx: 1,
          mb: 1,
        }}
      >
        <IconButton size="small">
          <SearchIcon fontSize="small" />
        </IconButton>
        <InputBase
          placeholder="Search or start a new chat"
          sx={{
            flex: 1,
            fontSize: 14,
            color: theme.palette.text.primary,
          }}
        />
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
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
      </Box>
    </Box>
  );
}
