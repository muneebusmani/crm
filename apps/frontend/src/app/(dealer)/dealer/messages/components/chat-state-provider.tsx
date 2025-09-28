/** biome-ignore-all lint/suspicious/noExplicitAny: <idk> */
'use client';

import type { Message } from '@dealer/types/chat';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { leadMessagesApi } from '@/services/lead-messages.service';
import { leadsApi } from '@/services/leads.service';
import Sidebar from './chat-sidebar';
import ChatWindow from './chat-window';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl: string;
}

export default function ChatStateProvider({
  dealerName,
}: {
  dealerName: string;
}) {
  const searchParams = useSearchParams();
  const leadIdParam = searchParams?.get('leadId');

  const [messages, setMessages] = useState<Record<string, any[]>>({});
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string>('' as string);
  const [hasCheckedLeadParam, setHasCheckedLeadParam] = useState(false);

  // Handle leadId parameter from URL
  useEffect(() => {
    const handleLeadParam = async () => {
      if (!leadIdParam || hasCheckedLeadParam) return;

      try {
        setIsLoading(true);
        const leadId = parseInt(leadIdParam, 10);

        if (Number.isNaN(leadId)) {
          console.error('Invalid lead ID in URL:', leadIdParam);
          return;
        }

        // Check if we already have a chat with this lead
        const existingChat = chats.find((chat) => chat.id === leadIdParam);

        if (existingChat) {
          // Chat already exists, just select it
          setCurrentChatId(leadIdParam);
          return;
        }

        try {
          // Try to fetch lead details
          const lead = await leadsApi.getOne(leadId);

          // Generate a display name for the lead
          const leadName = lead?.name || `Lead #${leadId}`;
          const vehicleInfo = [lead?.vehicle_brand, lead?.vehicle_model]
            .filter(Boolean)
            .join(' ');

          // Add the chat to the sidebar
          const newChat = {
            id: leadIdParam,
            name: leadName,
            lastMessage: vehicleInfo || 'No messages yet',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              leadName,
            )}&background=3f51b5&color=ffffff&type=png`,
          };

          setChats((prev) => [newChat, ...prev]);
          setCurrentChatId(leadIdParam);
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.warn(
              `Lead with ID ${leadId} not found, creating chat with minimal info: ${error.message}`,
            );
          } else {
            console.warn(
              `Lead with ID ${leadId} not found, creating chat with minimal info`,
            );
          }
          // Create a basic chat entry even if we can't fetch lead details
          const newChat = {
            id: leadIdParam,
            name: `Lead #${leadId}`,
            lastMessage: 'No messages yet',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            avatarUrl: `https://ui-avatars.com/api/?name=Lead+${leadId}&background=3f51b5&color=ffffff&type=png`,
          };

          setChats((prev) => [newChat, ...prev]);
          setCurrentChatId(leadIdParam);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error handling lead parameter:', error.message);
        }
      } finally {
        setHasCheckedLeadParam(true);
        setIsLoading(false);
      }
    };

    handleLeadParam();
  }, [leadIdParam, hasCheckedLeadParam, chats]);

  // Load chats when the component mounts
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);

        // Fetch all messages to build the chat history
        const response = await leadMessagesApi.getAll();

        // Handle case where response is not an array
        if (!Array.isArray(response)) {
          console.error('Invalid messages format:', response);
          setChats([]);
          return;
        }

        const allMessages = response;

        // Group messages by lead ID
        const chatsByLeadId = allMessages.reduce<
          Record<string, typeof allMessages>
        >((acc, message) => {
          if (message.lead?.id) {
            const leadId = message.lead.id.toString();
            if (!acc[leadId]) {
              acc[leadId] = [];
            }
            acc[leadId].push(message);
          }
          return acc;
        }, {});

        // Create chat objects for each lead
        const chatList = Object.entries(chatsByLeadId).map(
          ([leadId, messages]) => {
            // Sort messages by timestamp (newest first)
            const sortedMessages = [...messages].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );

            const lastMessage = sortedMessages[0];
            const leadName = lastMessage.lead?.name || `Lead #${leadId}`;
            const safeLeadName =
              typeof leadName === 'string' ? leadName : `Lead #${leadId}`;

            return {
              id: leadId,
              name: safeLeadName,
              lastMessage:
                lastMessage.content.length > 30
                  ? `${lastMessage.content.substring(0, 30)}...`
                  : lastMessage.content,
              timestamp: lastMessage.createdAt
                ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
              avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                safeLeadName,
              )}&background=3f51b5&color=ffffff&type=png`,
            };
          },
        );

        setChats(chatList);

        // If there are chats, select the first one by default
        // if (chatList.length > 0 && !currentChatId) {
        //   setCurrentChatId(chatList[0].id);
        // }
      } catch (error: unknown) {
        console.error('Failed to load chats:', error);
        setChats([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []); // Add currentChatId to dependencies to prevent re-fetching when it changes

  let isMounted = true;
  const loadMessages = useCallback(() => {
    async () => {
      try {
        setIsLoading(true);
        const leadId = parseInt(currentChatId, 10);
        if (Number.isNaN(leadId)) {
          console.error('Invalid lead ID');
          return;
        }

        // Initialize with empty messages array for this chat
        setMessages((prev) => ({
          ...prev,
          [currentChatId]: prev[currentChatId] || [],
        }));

        // Fetch messages from the API
        const messages = await leadMessagesApi.getByLead(leadId);
        console.log('messages ===>', messages);

        // Only update state if the component is still mounted
        if (!isMounted) return;

        if (!Array.isArray(messages)) {
          console.error('Invalid messages format:', messages);
          return;
        }

        // Sort messages by timestamp (oldest first)

        setMessages((prev) => ({
          ...prev,
          [currentChatId]: messages,
        }));
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
  }, [currentChatId, isMounted]); // Load messages when the current chat changes
  useEffect(() => {
    if (!currentChatId) return;

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [currentChatId, isMounted, loadMessages]);

  // Handle sending a new message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!currentChatId) return;

      // Create a temporary message for optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        content,
        createdAt: new Date().toISOString(),
        type: 'message',
      };

      // Optimistically update the UI
      setMessages((prev) => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), tempMessage],
      }));

      try {
        // Send the message to the server
        await leadMessagesApi.create({
          content,
          leadId: parseInt(currentChatId, 10),
        });

        // Replace the temporary message with the server response
        setMessages((prev) => {
          const currentMessages = prev[currentChatId] || [];
          return {
            ...prev,
            [currentChatId]: currentMessages,
          };
        });
      } catch (error) {
        console.error('Error sending message:', error);
        // Revert optimistic update on error
        setMessages((prev) => ({
          ...prev,
          [currentChatId]: (prev[currentChatId] || []).filter(
            (msg) => msg?.id !== tempId,
          ),
        }));
      }
    },
    [currentChatId],
  );

  const handleSelectChat = useCallback(
    async (chatId: string) => {
      // Don't do anything if we're already on this chat
      if (chatId === currentChatId) {
        return;
      }

      try {
        // Update the current chat ID first to show loading state
        setCurrentChatId(chatId);

        // Initialize with empty messages array for this chat if it doesn't exist
        setMessages((prev) => ({
          ...prev,
          [chatId]: prev[chatId] || [],
        }));

        // Load messages for the selected chat
        const leadId = parseInt(chatId, 10);
        if (Number.isNaN(leadId)) {
          console.error('Invalid lead ID:', chatId);
          return;
        }

        const messages = await leadMessagesApi.getByLead(leadId);

        if (!Array.isArray(messages)) {
          console.error('Expected messages to be an array, got:', messages);
          return;
        }

        // Format messages using the API utility with proper error handling

        // Sort messages by createdAt (oldest first)
        const sortedMessages = [...messages].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

        // Update the messages state
        setMessages((prev) => ({
          ...prev,
          [chatId]: sortedMessages,
        }));
      } catch (error) {
        console.error('Error loading messages for chat:', chatId, error);

        // Ensure we have at least an empty array for this chat
        setMessages((prev) => ({
          ...prev,
          [chatId]: [],
        }));
      }
    },
    [currentChatId],
  );

  const handleStartNewChat = useCallback(
    (
      leadId: string,
      leadData?: {
        name?: string;
        email?: string;
        vehicle_brand?: string;
        vehicle_model?: string;
      },
    ) => {
      // Clean the leadId (remove any non-numeric characters)
      const cleanLeadId = leadId.replace(/\D/g, '');

      if (!cleanLeadId) {
        console.error('Invalid lead ID');
        return;
      }

      // Check if the chat already exists
      const existingChat = chats.find((chat) => chat.id === cleanLeadId);

      if (existingChat) {
        // If it exists, just switch to it
        setCurrentChatId(cleanLeadId);
        return;
      }

      // Create a new chat and switch to it
      setCurrentChatId(cleanLeadId);

      // Generate a display name for the lead
      const leadName = leadData?.name || `Lead #${cleanLeadId}`;
      const vehicleInfo = [leadData?.vehicle_brand, leadData?.vehicle_model]
        .filter(Boolean)
        .join(' ');

      // Add a placeholder chat to the sidebar
      setChats((prev) => [
        {
          id: cleanLeadId,
          name: leadName,
          lastMessage: vehicleInfo || 'No messages yet',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            leadName,
          )}&background=3f51b5&color=ffffff&type=png`,
        },
        ...prev,
      ]);

      // Initialize with empty messages for this chat if it doesn't exist
      setMessages((prev) => ({
        ...prev,
        [cleanLeadId]: [],
      }));

      // Focus the message input after a short delay to ensure it's rendered
      setTimeout(() => {
        const messageInput = document.querySelector(
          'textarea[aria-label="Message"]',
        ) as HTMLTextAreaElement;
        messageInput?.focus();
      }, 100);
    },
    [chats],
  );

  if (isLoading && chats.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        padding: 0,
        margin: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleStartNewChat}
      />
      {currentChatId ? (
        <ChatWindow
          messages={(messages[currentChatId] || []) as Message[]}
          onSend={handleSendMessage}
          isLoading={isLoading}
          currentChatId={currentChatId}
          leadName={chats.find((chat) => chat.id === currentChatId)?.name}
          dealerName={dealerName}
        />
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'Background',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Box>
            <Typography variant="h5" gutterBottom>
              No chat selected
            </Typography>
            <Typography variant="body1" color="textSecondary" component={'p'}>
              Select an existing chat or start a new one
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                const newLeadId = Math.floor(Math.random() * 1000).toString();
                handleStartNewChat(newLeadId);
              }}
              sx={{ mt: 2 }}
            >
              Start New Chat
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
