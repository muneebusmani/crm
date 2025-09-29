'use client';

import { Box, CircularProgress } from '@mui/material';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  ensureChatFromLead,
  loadChats,
  loadMessagesForChat,
  sendMessage,
  startNewChat,
} from './slice';
import type { Message } from '@/app/(dealer)/dealer/types/chat';
import Sidebar from '@/app/(dealer)/dealer/messages/components/chat-sidebar';
import ChatWindow from '@/app/(dealer)/dealer/messages/components/chat-window';

export default function ChatContainer({
  dealerName,
}: {
  dealerName: string;
}) {
  const dispatch = useAppDispatch();
  const { chats, currentChatId, messagesByChatId, loading } = useAppSelector(
    (s) => s.chat,
  );
  const searchParams = useSearchParams();
  const [leadChecked, setLeadChecked] = useState(false);

  useEffect(() => {
    dispatch(loadChats());
  }, [dispatch]);

  // Handle leadId param for deep link
  useEffect(() => {
    const leadIdParam = searchParams?.get('leadId');
    if (!leadIdParam || leadChecked) return;
    const numericLeadId = parseInt(leadIdParam, 10);
    if (!Number.isNaN(numericLeadId)) {
      dispatch(ensureChatFromLead({ leadId: numericLeadId }));
    }
    setLeadChecked(true);
  }, [dispatch, leadChecked, searchParams]);

  const messages: Message[] = useMemo(() => {
    if (!currentChatId) return [];
    return (messagesByChatId[currentChatId] || []) as Message[];
  }, [currentChatId, messagesByChatId]);

  // If a chat becomes current and we don't yet have messages, load them
  useEffect(() => {
    if (!currentChatId) return;
    const existing = messagesByChatId[currentChatId];
    if (!existing || existing.length === 0) {
      dispatch(loadMessagesForChat(currentChatId));
    }
  }, [currentChatId, messagesByChatId, dispatch]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      dispatch(loadMessagesForChat(chatId));
    },
    [dispatch],
  );

  const handleNewChat = useCallback(
    (leadId: string, leadData?: { name?: string; email?: string; vehicle_brand?: string; vehicle_model?: string }) => {
      dispatch(startNewChat({ leadId, leadData }));
    },
    [dispatch],
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!currentChatId) return;
      await dispatch(sendMessage({ chatId: currentChatId, content: text }));
    },
    [dispatch, currentChatId],
  );

  if (loading && chats.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', padding: 0, margin: 0, width: '100%', height: '100%' }}>
      <Sidebar
        chats={chats}
        currentChatId={currentChatId ?? undefined}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />
      {currentChatId ? (
        <ChatWindow
          messages={messages}
          onSend={handleSend}
          isLoading={loading}
          currentChatId={currentChatId}
          leadName={chats.find((c) => c.id === currentChatId)?.name}
          dealerName={dealerName}
        />
      ) : (
        <Box sx={{ flex: 1 }} />
      )}
    </Box>
  );
}
