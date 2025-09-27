"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { leadMessagesApi } from "@/services/lead-messages.service";
import { leadsApi } from "@/services/leads.service";
import type { Message } from "@dealer/types/chat";

import ChatWindow from "./chat-window";
import Sidebar from "./chat-sidebar";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl: string;
}

export default function ChatStateProvider() {
  const searchParams = useSearchParams();
  const leadIdParam = searchParams?.get("leadId");

  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [hasCheckedLeadParam, setHasCheckedLeadParam] = useState(false);

  // Handle leadId parameter from URL
  useEffect(() => {
    const handleLeadParam = async () => {
      if (!leadIdParam || hasCheckedLeadParam) return;

      try {
        setIsLoading(true);
        const leadId = parseInt(leadIdParam, 10);

        if (Number.isNaN(leadId)) {
          console.error("Invalid lead ID in URL:", leadIdParam);
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
            .join(" ");

          // Add the chat to the sidebar
          const newChat = {
            id: leadIdParam,
            name: leadName,
            lastMessage: vehicleInfo || "No messages yet",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              leadName
            )}&background=3f51b5&color=ffffff&type=png`,
          };

          setChats((prev) => [newChat, ...prev]);
          setCurrentChatId(leadIdParam);
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.warn(
              `Lead with ID ${leadId} not found, creating chat with minimal info: ${error.message}`
            );
          } else {
            console.warn(
              `Lead with ID ${leadId} not found, creating chat with minimal info`
            );
          }
          // Create a basic chat entry even if we can't fetch lead details
          const newChat = {
            id: leadIdParam,
            name: `Lead #${leadId}`,
            lastMessage: "No messages yet",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            avatarUrl: `https://ui-avatars.com/api/?name=Lead+${leadId}&background=3f51b5&color=ffffff&type=png`,
          };

          setChats((prev) => [newChat, ...prev]);
          setCurrentChatId(leadIdParam);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error handling lead parameter:", error.message);
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

        console.log("Fetching all messages...");
        // Fetch all messages to build the chat history
        const response = await leadMessagesApi.getAll();
        console.log("API Response:", response);

        // Handle case where response is not an array
        if (!Array.isArray(response)) {
          console.error("Invalid messages format:", response);
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
                new Date(a.createdAt).getTime()
            );

            const lastMessage = sortedMessages[0];
            const leadName = lastMessage.lead?.name || `Lead #${leadId}`;
            const safeLeadName =
              typeof leadName === "string" ? leadName : `Lead #${leadId}`;

            return {
              id: leadId,
              name: safeLeadName,
              lastMessage:
                lastMessage.content.length > 30
                  ? `${lastMessage.content.substring(0, 30)}...`
                  : lastMessage.content,
              timestamp: lastMessage.createdAt
                ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
              avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                safeLeadName
              )}&background=3f51b5&color=ffffff&type=png`,
            };
          }
        );

        setChats(chatList);

        // If there are chats, select the first one by default
        // if (chatList.length > 0 && !currentChatId) {
        //   setCurrentChatId(chatList[0].id);
        // }
      } catch (error: unknown) {
        console.error("Failed to load chats:", error);
        setChats([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []); // Add currentChatId to dependencies to prevent re-fetching when it changes

  // Load messages when the current chat changes
  useEffect(() => {
    if (!currentChatId) return;

    let isMounted = true;
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const leadId = parseInt(currentChatId, 10);
        if (Number.isNaN(leadId)) {
          console.error("Invalid lead ID");
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
        console.log("Fetched messages from API:", messages);

        // Only update state if the component is still mounted
        if (!isMounted) return;

        console.log("Messages format:", messages);

        if (!Array.isArray(messages)) {
          console.error("Invalid messages format:", messages);
          return;
        }

        // Format messages using the API utility
        const formattedMessages = messages.map((msg) => {
          // Determine if the message is from the current user (dealer)
          const isCurrentUser = msg.dealer?.id !== undefined;
          return leadMessagesApi.formatMessage(msg, isCurrentUser);
        });

        console.log("Formatted messages:", formattedMessages);

        // Sort messages by timestamp (oldest first)
        formattedMessages.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setMessages((prev) => ({
          ...prev,
          [currentChatId]: formattedMessages,
        }));
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [currentChatId]);

  const handleAttach = useCallback(() => {
    alert("Attachment feature not implemented yet.");
  }, []);

  // Handle sending a new message
  const handleSendMessage = useCallback(async (text: string) => {
    if (!currentChatId || !text.trim()) return;

    try {
      const leadId = parseInt(currentChatId, 10);
      if (Number.isNaN(leadId)) {
        console.error("Invalid lead ID");
        return;
      }

      // Use the create method to send a new message
      await leadMessagesApi.create({
        leadId,
        content: text,
        isFromDealer: true,
      });

      // The message will be added to the UI through the WebSocket or by refreshing the messages
    } catch (error) {
      console.error("Failed to send message:", error);
      // Show error to the user
      alert("Failed to send message. Please try again.");
    }
  }, [currentChatId]);

  const handleSelectChat = useCallback(
    async (chatId: string) => {
      console.log("Chat selected:", chatId);

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
          console.error("Invalid lead ID:", chatId);
          return;
        }

        console.log("Fetching messages for lead:", leadId);
        const messages = await leadMessagesApi.getByLead(leadId);

        if (!Array.isArray(messages)) {
          console.error("Expected messages to be an array, got:", messages);
          return;
        }

        console.log("Raw messages from API:", messages);

        // Get current user ID from localStorage or context
        let currentUserId: number | null = null;
        try {
          const userData = localStorage.getItem("user");
          if (userData) {
            const user = JSON.parse(userData);
            currentUserId = user?.id || null;
          }
        } catch (error) {
          console.error("Error getting current user:", error);
        }

        // Format messages using the API utility with proper error handling
        const formattedMessages = messages
          .map((msg) => {
            try {
              if (!msg) return null;

              // Determine if the message is from the current user
              const isCurrentUser = msg.dealer?.id === currentUserId;

              return leadMessagesApi.formatMessage(msg, isCurrentUser);
            } catch (error) {
              console.error("Error formatting message:", error, msg);
              return null;
            }
          })
          .filter((msg): msg is Message => msg !== null);

        console.log("Formatted messages:", formattedMessages);

        // Sort messages by timestamp (oldest first)
        const sortedMessages = [...formattedMessages].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Update the messages state
        setMessages((prev) => ({
          ...prev,
          [chatId]: sortedMessages,
        }));
      } catch (error) {
        console.error("Error loading messages for chat:", chatId, error);

        // Ensure we have at least an empty array for this chat
        setMessages((prev) => ({
          ...prev,
          [chatId]: [],
        }));
      }
    },
    [currentChatId]
  );

  const handleStartNewChat = useCallback(
    (
      leadId: string,
      leadData?: {
        name?: string;
        email?: string;
        vehicle_brand?: string;
        vehicle_model?: string;
      }
    ) => {
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

      // Generate a display name for the lead
      const leadName = leadData?.name || `Lead #${cleanLeadId}`;
      const vehicleInfo = [leadData?.vehicle_brand, leadData?.vehicle_model]
        .filter(Boolean)
        .join(" ");

      // Add a placeholder chat to the sidebar
      setChats((prev) => [
        {
          id: cleanLeadId,
          name: leadName,
          lastMessage: vehicleInfo || "No messages yet",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            leadName
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
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleStartNewChat}
      />
      {currentChatId ? (
        <ChatWindow
          messages={messages[currentChatId] || []}
          onSend={handleSendMessage}
          isLoading={isLoading}
          onAttach={handleAttach}
          onRequestQuote={() => {
            // This will be handled by the ChatWindow component
          }}
          currentChatId={currentChatId}
          leadName={chats.find((chat) => chat.id === currentChatId)?.name}
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
