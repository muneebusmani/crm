// import type { Message } from "@dealer/types/chat";
// import { Box, Paper, styled, Typography } from "@mui/material";
//
// const Bubble = styled(Paper, {
//   shouldForwardProp: (prop) => prop !== "isUser",
// })<{ isUser: boolean }>(({ theme, isUser }) => ({
//   maxWidth: "70%",
//   padding: theme.spacing(1.5),
//   margin: theme.spacing(0.5, isUser ? 1 : 3, 0.5, isUser ? 3 : 1),
//   wordWrap: "break-word",
//   backgroundColor: isUser
//     ? theme.palette.primary.main
//     : theme.palette.grey[200],
//   color: isUser ? theme.palette.common.white : theme.palette.text.primary,
//   alignSelf: isUser ? "flex-end" : "flex-start",
//   borderRadius: isUser ? "18px 18px 0 18px" : "18px 18px 18px 0",
//   boxShadow: "none",
// }));
//
// const Timestamp = styled(Typography)(({ theme }) => ({
//   fontSize: "0.7rem",
//   color: theme.palette.text.secondary,
//   marginTop: theme.spacing(0.5),
//   textAlign: "right",
// }));
//
// interface MessageBubbleProps {
//   message: Message;
// }
//
// export default function MessageBubble({ message }: MessageBubbleProps) {
//   const formatTime = (date: Date): string => {
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };
//
//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
//       <Bubble isUser={message.sender === "user"}>
//         <Typography variant="body1" sx={{ fontWeight: 400 }}>
//           {message.text}
//         </Typography>
//         <Timestamp variant="body2">{formatTime(message.timestamp)}</Timestamp>
//       </Bubble>
//     </Box>
//   );
// }
// components/message-bubble.tsx
// import type { Message } from "@dealer/types/chat";
// import { Box, Paper, Typography, styled } from "@mui/material";
//
// const Bubble = styled(Paper, {
//   shouldForwardProp: (prop) => prop !== "isUser",
// })<{ isUser: boolean }>(({ theme, isUser }) => ({
//   maxWidth: "30%",
//   padding: theme.spacing(1.5),
//   margin: theme.spacing(0.5, isUser ? 1 : 3, 0.5, isUser ? 3 : 1),
//   wordWrap: "break-word",
//   backgroundColor: isUser
//     ? theme.palette.primary.main
//     : theme.palette.grey[200],
//   color: isUser ? theme.palette.common.white : theme.palette.text.primary,
//   alignSelf: isUser ? "flex-end" : "flex-start",
//   borderRadius: isUser ? "18px 18px 0 18px" : "18px 18px 18px 0",
//   boxShadow: "none",
// }));
//
// const Timestamp = styled(Typography)(({ theme }) => ({
//   fontSize: "0.7rem",
//   color: theme.palette.text.secondary,
//   marginTop: theme.spacing(0.5),
//   textAlign: "right",
// }));
//
// interface MessageBubbleProps {
//   message: Message;
// }
//
// export default function MessageBubble({ message }: MessageBubbleProps) {
//   const formatTime = (date: Date): string => {
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };
//
//   // Generate avatar URL from name
//   const getAvatarUrl = (name: string) => {
//     return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=40&background=3f51b5&color=ffffff`;
//   };
//
//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
//       {/* Avatar */}
//       <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
//         <img
//           src={getAvatarUrl(message.sender === "user" ? "You" : "Ali")}
//           alt="Avatar"
//           style={{
//             width: 36,
//             height: 36,
//             borderRadius: "50%",
//             objectFit: "cover",
//           }}
//         />
//         <Bubble isUser={message.sender === "user"} sx={{ flex: 1 }}>
//           <Typography variant="body1" sx={{ fontWeight: 400 }}>
//             {message.text}
//           </Typography>
//           <Timestamp variant="body2">{formatTime(message.timestamp)}</Timestamp>
//         </Bubble>
//       </Box>
//     </Box>
//   );
// }
// components/message-bubble.tsx
import type { Message } from "@dealer/types/chat";
import { Box, Paper, Typography, styled } from "@mui/material";
import Image from "next/image";

const Bubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isUser",
})<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: "70%",
  padding: theme.spacing(1.5),
  margin: theme.spacing(0.5, isUser ? 1 : 3, 0.5, isUser ? 3 : 1),
  wordWrap: "break-word",
  backgroundColor: isUser
    ? theme.palette.primary.main
    : theme.palette.grey[200],
  color: isUser ? theme.palette.common.white : theme.palette.text.primary,
  alignSelf: isUser ? "flex-end" : "flex-start",
  borderRadius: isUser ? "18px 18px 0 18px" : "18px 18px 18px 0",
  boxShadow: "none",
}));

const Timestamp = styled(Typography)(({ theme }) => ({
  fontSize: "0.7rem",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  textAlign: "right",
}));

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Generate avatar URL
  const getAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=40&background=3f51b5&color=ffffff&type=png`;
  };

  const avatarUrl =
    message.sender === "user" ? getAvatarUrl("You") : getAvatarUrl("Ali");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Avatar + Message */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          flexDirection: message.sender === "user" ? "row-reverse" : "row",
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={36}
            height={36}
            style={{ objectFit: "cover" }}
          />
        </Box>
        <Bubble isUser={message.sender === "user"}>
          <Typography variant="body1" sx={{ fontWeight: 400 }}>
            {message.text}
          </Typography>
          <Timestamp variant="body2">{formatTime(message.timestamp)}</Timestamp>
        </Bubble>
      </Box>
    </Box>
  );
}
