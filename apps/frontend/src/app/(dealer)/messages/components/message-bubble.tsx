import { Box, Paper, styled, Typography } from "@mui/material";
import type { Message } from "@/types/chat";

const Bubble = styled(Paper)<{ isUser: boolean }>(({ theme, isUser }) => ({
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Bubble isUser={message.sender === "user"}>
        <Typography variant="body1" sx={{ fontWeight: 400 }}>
          {message.text}
        </Typography>
        <Timestamp variant="body2">{formatTime(message.timestamp)}</Timestamp>
      </Bubble>
    </Box>
  );
}
