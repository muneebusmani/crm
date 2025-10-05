'use client';

/**
 * Chat Container Component
 *
 * This is the main container component for the chat interface. It manages:
 * - Loading and displaying the list of chats
 * - Handling the current active chat
 * - Message sending and receiving
 * - Integration with Redux for state management
 */

import { Box, CircularProgress } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '@/app/(dealer)/dealer/messages/components/chat-sidebar';
import ChatWindow from '@/app/(dealer)/dealer/messages/components/chat-window';
import type { Message } from '@/app/(dealer)/dealer/types/chat';
import {
  ensureChatFromLead,
  loadChats,
  loadMessagesForChat,
  sendMessage,
  startNewChat,
} from '@/features/chat/slice';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';

/**
 * Main chat container component
 * @param {Object} props - Component props
 * @param {string} props.dealerName - Name of the current dealer
 */
export default function ChatContainer({ dealerName }: { dealerName: string }) {
  // Redux hooks for dispatching actions and selecting state
  const dispatch = useAppDispatch();
  const { chats, currentChatId, messagesByChatId, loading } = useAppSelector(
    (s) => s.chat,
  );

  // Hook to access URL search params
  const searchParams = useSearchParams();

  // State to track if we've checked for a lead ID in the URL
  const [leadChecked, setLeadChecked] = useState(false);
  // State to track if we're loading a chat from URL parameter
  const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(false);

  // Load all chats when the component mounts
  useEffect(() => {
    dispatch(loadChats());
  }, [dispatch]);

  /**
   * Handle deep linking to a specific chat via URL parameter
   * This allows users to directly open a chat using a URL like /messages?leadId=123
   */
  useEffect(() => {
    const leadIdParam = searchParams?.get('leadId');
    // Only run once and only if we have a leadId param
    if (!leadIdParam || leadChecked) return;

    const numericLeadId = parseInt(leadIdParam, 10);
    if (!Number.isNaN(numericLeadId)) {
      setIsLoadingFromUrl(true);
      // Ensure the chat exists for this lead and set it as active
      dispatch(ensureChatFromLead({ leadId: numericLeadId }))
        .unwrap()
        .then(({ chatId }) => {
          // Set the chat as active after it's been ensured to exist
          if (chatId) {
            return dispatch(loadMessagesForChat(chatId)).unwrap();
          }
          return null;
        })
        .catch((error) => {
          console.error('Failed to load chat from lead:', error);
        })
        .finally(() => {
          setIsLoadingFromUrl(false);
          setLeadChecked(true);
        });
    } else {
      setLeadChecked(true);
    }
  }, [dispatch, leadChecked, searchParams]);

  /**
   * Get messages for the current chat, memoized for performance
   * Returns an empty array if no chat is selected
   */
  const messages: Message[] = useMemo(() => {
    if (!currentChatId) return [];
    return (messagesByChatId[currentChatId] || []) as Message[];
  }, [currentChatId, messagesByChatId]);

  /**
   * Lazy load messages when a chat is selected
   * Only loads messages if they haven't been loaded already
   */
  useEffect(() => {
    if (!currentChatId) return;
    const existing = messagesByChatId[currentChatId];
    // Only load messages if we don't have any for this chat yet
    if (existing === undefined) {
      dispatch(loadMessagesForChat(currentChatId));
    }
  }, [currentChatId, messagesByChatId, dispatch]);

  /**
   * Handle selecting a chat from the sidebar
   * Loads messages for the selected chat
   */
  const handleSelectChat = useCallback(
    (chatId: string) => {
      dispatch(loadMessagesForChat(chatId));
    },
    [dispatch],
  );

  /**
   * Handle starting a new chat with a lead
   * @param {string} leadId - ID of the lead to start a chat with
   * @param {Object} [leadData] - Optional lead data for new leads
   */
  const handleNewChat = useCallback(
    (
      leadId: string,
      leadData?: {
        name?: string;
        email?: string;
        vehicle_brand?: string;
        vehicle_model?: string;
      },
    ) => {
      dispatch(startNewChat({ leadId, leadData }));
    },
    [dispatch],
  );

  /**
   * Handle sending a new message in the current chat
   * @param {string} text - The message text to send
   */
  const handleSend = useCallback(
    async (text: string) => {
      if (!currentChatId) return;
      await dispatch(sendMessage({ chatId: currentChatId, content: text }));
    },
    [dispatch, currentChatId],
  );

  // Show loading spinner when initially loading chats and we don't have any yet
  if (loading && chats.length === 0) {
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
      {/* Left sidebar showing list of chats */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId ?? undefined}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />

      {/* Main chat area - show loader when loading from URL or show chat when selected */}
      {isLoadingFromUrl ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            backgroundColor: 'background.paper',
          }}
        >
          <CircularProgress />
        </Box>
      ) : currentChatId ? (
        <ChatWindow
          messages={messages}
          onSend={handleSend}
          isLoading={loading}
          currentChatId={currentChatId}
          leadName={chats.find((c) => c.id === currentChatId)?.name}
          dealerName={dealerName}
        />
      ) : (
        // Empty state when no chat is selected
        <Box sx={{ flex: 1 }} />
      )}
    </Box>
  );
}
