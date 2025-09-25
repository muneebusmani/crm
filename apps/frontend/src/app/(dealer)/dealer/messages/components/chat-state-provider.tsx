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
        // In a real app, you would fetch the list of leads/chats from the API
        // For now, we'll use an empty array and let the user start a new chat
        // TODO: Implement fetching the list of chats/leads from the API
        setChats([]);
      } catch (error) {
        console.error("Failed to load chats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);

  // Load messages when the current chat changes
  useEffect(() => {
    if (!currentChatId) return;

    let isMounted = true;
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const leadId = parseInt(currentChatId, 10);
        if (isNaN(leadId)) return;

        // Initialize with empty messages array for this chat
        setMessages((prev) => ({
          ...prev,
          [currentChatId]: prev[currentChatId] || [],
        }));

        try {
          // Fetch messages from the API
          const messages = await leadMessagesApi.getByLead(leadId);

          // Only update state if the component is still mounted
          if (!isMounted) return;

          // Format messages using the API utility
          const formattedMessages = messages.map((msg) =>
            leadMessagesApi.formatMessage(msg, msg?.sender === "user")
          );

          // Sort messages by timestamp (oldest first)
          formattedMessages.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          setMessages((prev) => ({
            ...prev,
            [currentChatId]: formattedMessages,
          }));

          // Update the chat in the sidebar if it exists, or add it if it's a new chat
          setChats((prev) => {
            const chatIndex = prev.findIndex(
              (chat) => chat.id === currentChatId
            );
            const lastMessage = formattedMessages[formattedMessages.length - 1];
            const lastMessageText = lastMessage?.text || "No messages yet";

            if (chatIndex !== -1) {
              // Update existing chat
              const updatedChats = [...prev];
              updatedChats[chatIndex] = {
                ...updatedChats[chatIndex],
                lastMessage:
                  lastMessageText.length > 30
                    ? `${lastMessageText.substring(0, 30)}...`
                    : lastMessageText,
                timestamp: lastMessage?.timestamp
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
            }

            // Add a new chat entry if it doesn't exist
            return [
              {
                id: currentChatId,
                name: `Lead #${currentChatId}`,
                lastMessage: lastMessageText,
                timestamp: lastMessage?.timestamp
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
          });
        } catch (error) {
          console.error("Error loading messages:", error);

          // Initialize with empty messages if there's an error
          setMessages((prev) => ({
            ...prev,
            [currentChatId]: [],
          }));

          // Update chat list with error state
          setChats((prev) => {
            const chatIndex = prev.findIndex(
              (chat) => chat.id === currentChatId
            );
            if (chatIndex !== -1) {
              const updatedChats = [...prev];
              updatedChats[chatIndex] = {
                ...updatedChats[chatIndex],
                lastMessage: "Error loading messages",
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              return updatedChats;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        // You might want to show an error to the user here
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
      if (!currentChatId || !text.trim()) return;

      const leadId = parseInt(currentChatId, 10);
      if (isNaN(leadId)) return;

      // Create a temporary message ID that will be replaced by the server response
      const tempMessageId = `temp-${Date.now()}`;
      const now = new Date();

      const userMessage: Message = {
        id: tempMessageId,
        text,
        sender: "user",
        timestamp: now,
        senderName: "You",
      };

      // Update UI optimistically
      setMessages((prev) => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), userMessage],
      }));

      try {
        setIsLoading(true);

        // Send the message to the server
        const createdMessage = await leadMessagesApi.create({
          content: text,
          leadId,
        });

        // Format the server response using the formatMessage utility
        const serverMessage = leadMessagesApi.formatMessage(
          createdMessage,
          true
        );

        // Update the message in the UI with the server response
        setMessages((prev) => {
          const currentMessages = prev[currentChatId] || [];
          const messageIndex = currentMessages.findIndex(
            (m) => m.id === tempMessageId
          );

          if (messageIndex === -1) {
            // If the temp message is not found, add the server message
            return {
              ...prev,
              [currentChatId]: [...currentMessages, serverMessage],
            };
          }

          // Replace the temp message with the server message
          const updatedMessages = [...currentMessages];
          updatedMessages[messageIndex] = serverMessage;

          return {
            ...prev,
            [currentChatId]: updatedMessages,
          };
        });

        // Update the chat list with the new last message
        setChats((prev) => {
          const chatIndex = prev.findIndex((chat) => chat.id === currentChatId);
          if (chatIndex === -1) return prev;

          const updatedChats = [...prev];
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            lastMessage:
              text.length > 30 ? `${text.substring(0, 30)}...` : text,
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
        console.error("Failed to send message:", error);

        // Remove the temporary message if there was an error
        setMessages((prev) => {
          const currentMessages = prev[currentChatId] || [];
          const filteredMessages = currentMessages.filter(
            (m) => m.id !== tempMessageId
          );

          return {
            ...prev,
            [currentChatId]: filteredMessages,
          };
        });

        // Show error to the user
        // You might want to use a toast or alert here
      } finally {
        setIsLoading(false);
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
