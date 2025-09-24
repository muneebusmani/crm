// import type { Message } from "@dealer/types/chat";
// import {
//   Box,
//   CircularProgress,
//   Container,
//   Typography,
//   useTheme,
// } from "@mui/material";
// import { useCallback, useEffect, useRef } from "react";
// import ChatInput from "./chat-input";
// import MessageBubble from "./message-bubble";
//
// interface ChatWindowProps {
//   messages: Message[];
//   onSend: (text: string) => void;
//   isLoading: boolean;
// }
//
// export default function ChatWindow({
//   messages,
//   onSend,
//   isLoading,
// }: ChatWindowProps) {
//   const theme = useTheme();
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//
//   const scrollToBottom = useCallback(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, []);
//
//   useEffect(() => {
//     scrollToBottom();
//   }, [scrollToBottom]);
//
//   return (
//     <Container
//       sx={{
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         backgroundColor: "white",
//         padding: 0,
//         overflow: "hidden",
//       }}
//     >
//       <Box
//         sx={{
//           flex: 1,
//           overflowY: "auto",
//           padding: theme.spacing(2),
//           display: "flex",
//           flexDirection: "column",
//           gap: 1,
//         }}
//       >
//         {messages.length === 0 ? (
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               height: "100%",
//             }}
//           >
//             <Typography variant="h6" gutterBottom>
//               Welcome to Chat
//             </Typography>
//             <Typography variant="body1">
//               Send your first message to get started.
//             </Typography>
//           </Box>
//         ) : (
//           messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
//         )}
//         {isLoading && (
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "flex-start",
//               marginLeft: 2,
//               marginTop: 1,
//             }}
//           >
//             <CircularProgress size={20} color="primary" />
//           </Box>
//         )}
//         <div ref={messagesEndRef} />
//       </Box>
//
//       <ChatInput onSend={onSend} disabled={isLoading} />
//     </Container>
//   );
// }
// components/chat-window.tsx
import type { Message } from '@dealer/types/chat'
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  useTheme,
} from '@mui/material'
import { useCallback, useEffect, useRef } from 'react'
import ChatInput from './chat-input'
import MessageBubble from './message-bubble'

interface ChatWindowProps {
  messages: Message[]
  onSend: (text: string) => void
  isLoading: boolean
  onAttach: () => void // New prop
}

export default function ChatWindow({
  messages,
  onSend,
  isLoading,
  onAttach,
}: ChatWindowProps) {
  const theme = useTheme()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: theme.spacing(2),
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
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
            }}
          >
            <Typography variant="h6" gutterBottom>
              Welcome to Chat
            </Typography>
            <Typography variant="body1">
              Send your first message to get started.
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginLeft: 2,
              marginTop: 1,
            }}
          >
            <CircularProgress size={20} color="primary" />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <ChatInput onSend={onSend} onAttach={onAttach} disabled={isLoading} />
    </Container>
  )
}
