// // components/chat-state-provider.tsx
// "use client";
//
// import ChatWindow from "@dealer/components/chat-window";
// import type { Message } from "@dealer/types/chat";
// import { useCallback, useState } from "react";
//
// export default function ChatStateProvider() {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: "1",
//       text: "Hello! How can I help you today?",
//       sender: "other",
//       timestamp: new Date(),
//     },
//   ]);
//   const [isLoading, setIsLoading] = useState(false);
//
//   const addMessage = useCallback((text: string) => {
//     const userMessage: Message = {
//       id: Date.now().toString(),
//       text,
//       sender: "user",
//       timestamp: new Date(),
//     };
//
//     setMessages((prev) => [...prev, userMessage]);
//     setIsLoading(true);
//
//     setTimeout(() => {
//       const botMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         text: `You said: "${text}". I'm just a demo bot! 😊`,
//         sender: "other",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, botMessage]);
//       setIsLoading(false);
//     }, 1500);
//   }, []);
//
//   return (
//     <ChatWindow messages={messages} onSend={addMessage} isLoading={isLoading} />
//   );
// }
// components/chat-state-provider.tsx
// "use client";
//
// import ChatWindow from "@dealer/components/chat-window";
// import type { Message } from "@dealer/types/chat";
// import { useCallback, useState } from "react";
//
// export default function ChatStateProvider() {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: "1",
//       text: "Hello! How can I help you today?",
//       sender: "other",
//       timestamp: new Date(),
//     },
//   ]);
//   const [isLoading, setIsLoading] = useState(false);
//
//   const addMessage = useCallback((text: string) => {
//     const userMessage: Message = {
//       id: Date.now().toString(),
//       text,
//       sender: "user",
//       timestamp: new Date(),
//     };
//
//     setMessages((prev) => [...prev, userMessage]);
//     setIsLoading(true);
//
//     setTimeout(() => {
//       const botMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         text: `You said: "${text}". I'm just a demo bot! 😊`,
//         sender: "other",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, botMessage]);
//       setIsLoading(false);
//     }, 1500);
//   }, []);
//
//   const handleAttach = useCallback(() => {
//     alert("Attachment feature not implemented yet.");
//     // You can open file picker here:
//     // const input = document.createElement("input");
//     // input.type = "file";
//     // input.onchange = (e) => {
//     //   const file = e.target.files?.[0];
//     //   console.log(file);
//     // };
//     // input.click();
//   }, []);
//
//   return (
//     <ChatWindow
//       messages={messages}
//       onSend={addMessage}
//       isLoading={isLoading}
//       onAttach={handleAttach}
//     />
//   );
// }
// components/chat-state-provider.tsx
"use client";

import Sidebar from "./chat-sidebar";
import ChatWindow from "./chat-window";
import type { Message } from "@dealer/types/chat";
import { useCallback, useState } from "react";
import { Box, useTheme } from "@mui/material";

// Mock data for multiple chats
const mockChats = [
  {
    id: "1",
    name: "John Conner",
    lastMessage: "Thanks",
    timestamp: "5:12 PM",
    avatarUrl:
      "https://ui-avatars.com/api/?name=John+Conner&background=3f51b5&color=ffffff&type=png",
  },
  {
    id: "2",
    name: "Haley Ann",
    lastMessage: "I will get back to you",
    timestamp: "5:07 PM",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Haley+Ann&background=3f51b5&color=ffffff&type=png",
  },
  {
    id: "3",
    name: "Michael Scott",
    lastMessage: "That's what she said 😂",
    timestamp: "4:55 PM",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Michael+Scott&background=3f51b5&color=ffffff&type=png",
  },
  {
    id: "4",
    name: "Sarah Lee",
    lastMessage: "See you tomorrow!",
    timestamp: "4:40 PM",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Sarah+Lee&background=3f51b5&color=ffffff&type=png",
  },
  {
    id: "5",
    name: "David Kim",
    lastMessage: "Got it 👍",
    timestamp: "4:20 PM",
    avatarUrl:
      "https://ui-avatars.com/api/?name=David+Kim&background=3f51b5&color=ffffff&type=png",
  },
  {
    id: "6",
    name: "Emma Watson",
    lastMessage: "Can we reschedule?",
    timestamp: "3:58 PM",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Emma+Watson&background=3f51b5&color=ffffff&type=png",
  },
  {
    id: "7",
    name: "Chris Evans",
    lastMessage: "On my way 🚗",
    timestamp: "3:40 PM",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Chris+Evans&background=3f51b5&color=ffffff&type=png",
  },
  {
    id: "8",
    name: "Olivia Brown",
    lastMessage: "Let's catch up soon!",
    timestamp: "3:10 PM",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Olivia+Brown&background=3f51b5&color=ffffff&type=png",
  },
  {
    id: "9",
    name: "Daniel Craig",
    lastMessage: "Mission accomplished 🕶",
    timestamp: "2:55 PM",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Daniel+Craig&background=3f51b5&color=ffffff&type=png",
  },
  {
    id: "10",
    name: "Sophia Turner",
    lastMessage: "Call me when you're free",
    timestamp: "2:30 PM",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Sophia+Turner&background=3f51b5&color=ffffff&type=png",
  },
];

export default function ChatStateProvider() {
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    "1": [
      {
        id: "1",
        text: "Hello! How can I help you today?",
        sender: "other",
        timestamp: new Date(),
      },
    ],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState("1");

  const addMessage = useCallback(
    (text: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const newMessages = [...(prev[currentChatId] || []), userMessage];
        return { ...prev, [currentChatId]: newMessages };
      });

      setIsLoading(true);

      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `You said: "${text}". I'm just a demo bot! 😊`,
          sender: "other",
          timestamp: new Date(),
        };
        setMessages((prev) => {
          const newMessages = [...(prev[currentChatId] || []), botMessage];
          return { ...prev, [currentChatId]: newMessages };
        });
        setIsLoading(false);
      }, 1500);
    },
    [currentChatId],
  );

  const handleAttach = useCallback(() => {
    alert("Attachment feature not implemented yet.");
  }, []);

  const handleSelectChat = useCallback((id: string) => {
    setCurrentChatId(id);
  }, []);
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        padding: 0,
        margin: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <Sidebar
        chats={mockChats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
      />
      <ChatWindow
        messages={messages[currentChatId] || []}
        onSend={addMessage}
        isLoading={isLoading}
        onAttach={handleAttach}
      />
    </Box>
  );
}
