'use client';

import { useEffect, useState, useCallback } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { get, post } from '@/lib/api'; // Added post import

// Message type
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
  lead?: {
    id: number;
    name: string;
    vehicle_model: string;
  };
  dealer?: {
    id: number;
    name: string;
  };
};

type ApiMessage = {
  id: number;
  content: string;
  createdAt: string;
  lead: { id: number; name: string; vehicle_model: string };
  dealer: { id: number; name: string };
};

type ApiResponse = {
  data?: ApiMessage[];
  success: boolean;
};

// Sidebar UI
function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
}: {
  chats: {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    avatarUrl: string;
  }[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
}) {
  return (
    <Box width="280px" bgcolor="#f3f4f6" p={2} overflow="auto">
      {chats.map((chat) => (
        <Box
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          p={2}
          display="flex"
          alignItems="center"
          bgcolor={currentChatId === chat.id ? '#e5e7eb' : 'transparent'}
          sx={{ cursor: 'pointer', borderRadius: '12px', mb: 1 }}
        >
          <img
            src={chat.avatarUrl}
            alt={chat.name}
            style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12 }}
          />
          <Box flex={1}>
            <div style={{ fontWeight: 'bold' }}>{chat.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{chat.lastMessage}</div>
          </Box>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>{chat.timestamp}</div>
        </Box>
      ))}
    </Box>
  );
}

// Chat window
function ChatWindow({
  messages,
  onSend,
  isLoading,
}: {
  messages: Message[];
  onSend: (text: string) => void;
  isLoading: boolean;
}) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    onSend(input);
    setInput('');
  };

  return (
    <Box flex={1} display="flex" flexDirection="column" bgcolor="white" borderLeft="1px solid #e5e7eb">
      <Box flex={1} p={3} overflow="auto">
        {messages.length === 0 ? (
          <div style={{ color: '#9ca3af' }}>No messages yet</div>
        ) : (
          messages.map((msg) => (
            <Box key={msg.id} mb={2} textAlign={msg.sender === 'user' ? 'right' : 'left'}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: 12,
                  backgroundColor: msg.sender === 'user' ? '#3f51b5' : '#e5e7eb',
                  color: msg.sender === 'user' ? 'white' : 'black',
                }}
              >
                {msg.text}
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>{msg.timestamp.toLocaleString()}</div>
            </Box>
          ))
        )}
        {isLoading && <div style={{ color: '#9ca3af' }}>Bot is typing...</div>}
      </Box>

      <Box display="flex" p={2} borderTop="1px solid #e5e7eb">
        <TextField
          fullWidth
          size="small"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <IconButton onClick={handleSend} color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

// Main ChatApp
export default function ChatApp({ initialLeadId }: { initialLeadId?: number }) {
  const [chats, setChats] = useState<
    { id: string; name: string; lastMessage: string; timestamp: string; avatarUrl: string }[]
  >([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch messages from API
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res: ApiResponse = await get(`/lead-messages/`);
        if (res.success && Array.isArray(res.data)) {
          const grouped: Record<string, Message[]> = {};
          res.data.forEach((msg) => {
            const chatId = String(msg.lead.id);
            if (!grouped[chatId]) grouped[chatId] = [];
            grouped[chatId].push({
              id: String(msg.id),
              text: msg.content,
              sender: 'other',
              timestamp: new Date(msg.createdAt),
              lead: msg.lead,
              dealer: msg.dealer,
            });
          });

          setMessages(grouped);

          const chatList = Object.entries(grouped).map(([chatId, msgs]) => {
            const lastMsg = msgs[msgs.length - 1];
            return {
              id: chatId,
              name: lastMsg.lead?.name ?? 'Unknown Lead',
              lastMessage: lastMsg.text,
              timestamp: lastMsg.timestamp.toLocaleTimeString(),
              avatarUrl: `https://ui-avatars.com/api/?name=${
                lastMsg.lead?.name ?? 'Lead'
              }&background=3f51b5&color=ffffff&type=png`,
            };
          });

          setChats(chatList);

          // If initialLeadId is provided, open that chat
          if (initialLeadId) {
            const targetChatId = String(initialLeadId);
            if (grouped[targetChatId]) {
              setCurrentChatId(targetChatId);
              return;
            }
          }

          // Otherwise open first chat
          if (chatList.length > 0 && !currentChatId) {
            setCurrentChatId(chatList[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch lead-messages:', error);
      }
    }

    fetchMessages();
  }, [currentChatId, initialLeadId]);

  // Add message to current chat
  const addMessage = useCallback(
    async (text: string) => {
      if (!currentChatId) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date(),
      };

      // Add user message to UI immediately
      setMessages((prev) => {
        const newMessages = [...(prev[currentChatId] || []), userMessage];
        return { ...prev, [currentChatId]: newMessages };
      });

      setIsLoading(true);

      try {
        // Send POST request to lead-messages API
        const response = await post('/lead-messages', {
          leadId: parseInt(currentChatId),
          content: text,
        });

        console.log('Message sent successfully:', response);

        // Simulate bot response (remove this if your API handles bot responses)
        setTimeout(() => {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `You said: "${text}". I'm just a demo bot! 😊`,
            sender: 'other',
            timestamp: new Date(),
          };
          setMessages((prev) => {
            const newMessages = [...(prev[currentChatId] || []), botMessage];
            return { ...prev, [currentChatId]: newMessages };
          });
          setIsLoading(false);
        }, 1500);

      } catch (error) {
        console.error('Failed to send message:', error);
        setIsLoading(false);
        
        // Optionally show error message to user
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Failed to send message. Please try again.',
          sender: 'other',
          timestamp: new Date(),
        };
        setMessages((prev) => {
          const newMessages = [...(prev[currentChatId] || []), errorMessage];
          return { ...prev, [currentChatId]: newMessages };
        });
      }
    },
    [currentChatId]
  );

  // Function to open a chat by leadId programmatically
  const openLeadChat = (leadId: number) => {
    const chatId = String(leadId);
    if (messages[chatId]) setCurrentChatId(chatId);
    else console.warn('No messages for this lead');
  };

  return (
    <Box display="flex" height="100vh" bgcolor="#f9fafb">
      <Sidebar chats={chats} onSelectChat={setCurrentChatId} currentChatId={currentChatId} />
      <ChatWindow
        messages={currentChatId ? messages[currentChatId] || [] : []}
        onSend={addMessage}
        isLoading={isLoading}
      />
    </Box>
  );
}