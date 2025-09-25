"use client";

import type { Message } from "@dealer/types/chat";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { useCallback, useEffect, useState, useRef } from "react";
import Sidebar from "./chat-sidebar";
import ChatWindow from "./chat-window";
import { leadMessagesApi } from "@/services/lead-messages.service";
import { useRouter } from "next/navigation";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl: string;
}

export default function ChatStateProvider() {
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const router = useRouter();

  // Load chats when the component mounts
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        
        console.log('Fetching all messages...');
        // Fetch all messages to build the chat history
        const response = await leadMessagesApi.getAll();
        console.log('API Response:', response);
        
        // Handle case where response is not an array
        if (!Array.isArray(response)) {
          console.error('Invalid messages format:', response);
          setChats([]);
          return;
        }
        
        const allMessages = response;
        
        // Group messages by lead ID
        const chatsByLeadId = allMessages.reduce<Record<string, typeof allMessages>>((acc, message) => {
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
        const chatList = Object.entries(chatsByLeadId).map(([leadId, messages]) => {
          // Sort messages by timestamp (newest first)
          const sortedMessages = [...messages].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          const lastMessage = sortedMessages[0];
          const leadName = lastMessage.lead?.name || `Lead #${leadId}`;
          const safeLeadName = typeof leadName === 'string' ? leadName : `Lead #${leadId}`;
          
          return {
            id: leadId,
            name: safeLeadName,
            lastMessage: lastMessage.content.length > 30 
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
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(safeLeadName)}&background=3f51b5&color=ffffff&type=png`,
          };
        });
        
        setChats(chatList);
        
        // If there are chats, select the first one by default
        if (chatList.length > 0 && !currentChatId) {
          setCurrentChatId(chatList[0].id);
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
        setChats([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [currentChatId]); // Add currentChatId to dependencies to prevent re-fetching when it changes

  // Load messages when the current chat changes
  useEffect(() => {
    if (!currentChatId) return;

    let isMounted = true;
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const leadId = parseInt(currentChatId, 10);
        if (isNaN(leadId)) {
          console.error('Invalid lead ID');
          return;
        }

        console.log(`Loading messages for lead ${leadId}...`);

        // Initialize with empty messages array for this chat
        setMessages((prev) => ({
          ...prev,
          [currentChatId]: prev[currentChatId] || [],
        }));

        // Fetch messages from the API
        const messages = await leadMessagesApi.getByLead(leadId);
        console.log('Fetched messages from API:', messages);

        // Only update state if the component is still mounted
        if (!isMounted) return;

        if (!Array.isArray(messages)) {
          console.error('Invalid messages format:', messages);
          return;
        }

        // Format messages using the API utility
        const formattedMessages = messages.map((msg) => {
          // Determine if the message is from the current user (dealer)
          const isCurrentUser = msg.dealer?.id !== undefined; // Assuming dealer messages have dealer.id
          return leadMessagesApi.formatMessage(msg, isCurrentUser);
        });

        console.log('Formatted messages:', formattedMessages);

        // Sort messages by timestamp (oldest first)
        formattedMessages.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setMessages((prev) => ({
          ...prev,
          [currentChatId]: formattedMessages,
        }));

        // Update the chat in the sidebar if it exists
        if (formattedMessages.length > 0) {
          setChats((prev) => {
            const chatIndex = prev.findIndex(
              (chat) => chat.id === currentChatId
            );
            
            if (chatIndex === -1) {
              console.log('Chat not found in sidebar, adding new one');
              const lastMessage = formattedMessages[formattedMessages.length - 1];
              return [
                {
                  id: currentChatId,
                  name: `Lead #${currentChatId}`,
                  lastMessage: lastMessage.text.length > 30 
                    ? `${lastMessage.text.substring(0, 30)}...` 
                    : lastMessage.text,
                  timestamp: lastMessage.timestamp
                    ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                  avatarUrl: `https://ui-avatars.com/api/?name=Lead+${currentChatId}&background=3f51b5&color=ffffff&type=png`,
                },
                ...prev,
              ];
            }

            console.log('Updating existing chat in sidebar');
            const lastMessage = formattedMessages[formattedMessages.length - 1];
            const updatedChats = [...prev];
            updatedChats[chatIndex] = {
              ...updatedChats[chatIndex],
              lastMessage: lastMessage.text.length > 30 
                ? `${lastMessage.text.substring(0, 30)}...` 
                : lastMessage.text,
              timestamp: lastMessage.timestamp
                ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
            };

            return updatedChats;
          });
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        // Initialize with empty messages if there's an error
        setMessages((prev) => {
          const updated = {
            ...prev,
            [currentChatId]: [],
          };
          console.log('Error loading messages, reset to empty:', updated);
          return updated;
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMessages();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [currentChatId]);

  const addMessage = useCallback(
    async (text: string) => {
      if (!currentChatId || !text.trim()) {
        console.log('No current chat ID or empty message');
        return;
      }

      const leadId = parseInt(currentChatId, 10);
      if (isNaN(leadId)) {
        console.error('Invalid lead ID:', currentChatId);
        return;
      }

      const tempMessageId = `temp-${Date.now()}`;
      const now = new Date();

      // Create a temporary message with a unique ID
      const tempMessage: Message = {
        id: tempMessageId,
        text,
        sender: "user",
        timestamp: now,
        senderName: "You",
      };

      console.log('Adding temporary message:', tempMessage);

      // Update UI optimistically
      setMessages((prev) => {
        const currentMessages = prev[currentChatId] || [];
        const updatedMessages = {
          ...prev,
          [currentChatId]: [...currentMessages, tempMessage],
        };
        console.log('Updated messages state:', updatedMessages);
        return updatedMessages;
      });

      try {
        console.log('Sending message to server...');
        const createdMessage = await leadMessagesApi.create({
          content: text,
          leadId,
        });

        console.log('Server response for create message:', createdMessage);

        if (!createdMessage) {
          throw new Error('No valid response from server');
        }

        // Format the server response
        const serverMessage = leadMessagesApi.formatMessage(createdMessage, true);
        console.log('Formatted server message:', serverMessage);

        // Update the message in the UI with the server response
        setMessages((prev) => {
          const currentMessages = prev[currentChatId] || [];
          const messageIndex = currentMessages.findIndex(
            (m) => m.id === tempMessageId
          );

          const updatedMessages = {
            ...prev,
            [currentChatId]: messageIndex === -1
              ? [...currentMessages, serverMessage]
              : currentMessages.map((msg, idx) => 
                  idx === messageIndex ? serverMessage : msg
                )
          };

          console.log('Updated messages after server response:', updatedMessages);
          return updatedMessages;
        });

        // Update the chat in the sidebar
        setChats((prev) => {
          const chatIndex = prev.findIndex((chat) => chat.id === currentChatId);
          if (chatIndex === -1) {
            console.log('Chat not found in sidebar, adding new one');
            return [
              {
                id: currentChatId,
                name: `Lead #${currentChatId}`,
                lastMessage: text.length > 30 ? `${text.substring(0, 30)}...` : text,
                timestamp: now.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                avatarUrl: `https://ui-avatars.com/api/?name=Lead+${currentChatId}&background=3f51b5&color=ffffff&type=png`,
              },
              ...prev,
            ];
          }

          console.log('Updating existing chat in sidebar');
          const updatedChats = [...prev];
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            lastMessage: text.length > 30 ? `${text.substring(0, 30)}...` : text,
            timestamp: now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          // Move the updated chat to the top
          const [updatedChat] = updatedChats.splice(chatIndex, 1);
          return [updatedChat, ...updatedChats];
        });
      } catch (error) {
        console.error('Failed to send message:', error);

        // Remove the temporary message on error
        setMessages((prev) => {
          const currentMessages = prev[currentChatId] || [];
          const filteredMessages = currentMessages.filter(
            (m) => m.id !== tempMessageId
          );

          const updatedMessages = {
            ...prev,
            [currentChatId]: filteredMessages,
          };

          console.log('Removed temporary message after error:', updatedMessages);
          return updatedMessages;
        });

        // Show error to the user
        alert(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    [currentChatId]
  );

  const handleAttach = useCallback(() => {
    alert("Attachment feature not implemented yet.");
  }, []);

  const handleSelectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  const handleStartNewChat = useCallback(
    (leadId: string) => {
      // Clean the leadId (remove any non-numeric characters)
      const cleanLeadId = leadId.replace(/\D/g, "");

      if (!cleanLeadId) {
        console.error("Invalid lead ID");
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

      // Add a placeholder chat to the sidebar
      setChats((prev) => [
        {
          id: cleanLeadId,
          name: `Lead #${cleanLeadId}`,
          lastMessage: "No messages yet",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatarUrl: `https://ui-avatars.com/api/?name=Lead+${cleanLeadId}&background=3f51b5&color=ffffff&type=png`,
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
          'textarea[aria-label="Message"]'
        ) as HTMLTextAreaElement;
        messageInput?.focus();
      }, 100);
    },
    [chats]
  );

  if (isLoading && chats.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
        chats={chats}
        currentChatId={currentChatId || undefined}
        onSelectChat={handleSelectChat}
        onNewChat={handleStartNewChat}
      />
      {currentChatId ? (
        <ChatWindow
          messages={messages[currentChatId] || []}
          onSend={addMessage}
          isLoading={isLoading}
          onAttach={handleAttach}
          currentChatId={currentChatId}
        />
      ) : (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "background.default",
            p: 3,
            textAlign: "center",
          }}
        >
          <Box>
            <Typography variant="h5" gutterBottom>
              No chat selected
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
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
