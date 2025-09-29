/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Message } from '@/app/(dealer)/dealer/types/chat';
import type { Lead } from '@crm/types';

// DTO used by our internal API routes
type LeadMessageDTO = {
  id: number | string;
  content: string;
  createdAt: string;
  type: 'message' | 'quotation' | 'invoice' | string;
  lead?: { id: number; name?: string };
  dealer?: { id: number };
};

// Quotations as returned by /api/dealers/quotations
type QuotationDTO = {
  id?: number | string;
  subject?: string;
  message?: string;
  quotationPrice?: number;
  price?: number;
  createdAt?: string;
};

// Invoices as returned by /api/invoices
type InvoiceDTO = {
  id: number | string;
  date: string;
  subTotal?: number;
  taxAmount?: number;
  grandTotal?: number;
  total?: number;
  status?: string;
  createdAt?: string;
};
import type {
  ChatItem,
  ChatState,
  EnsureChatFromLeadArgs,
  SendMessageArgs,
  StartNewChatArgs,
} from './types';

// Thunks
export const loadChats = createAsyncThunk<ChatItem[]>(
  'chat/loadChats',
  async () => {
    const res = await fetch('/api/lead-messages', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load chats');
    const allMessages = (await res.json()) as LeadMessageDTO[];

    // Group by leadId and build chat list
    const byLead: Record<string, LeadMessageDTO[]> = {};
    allMessages.forEach((m: LeadMessageDTO) => {
      const id = m.lead?.id?.toString();
      if (!id) return;
      byLead[id] = byLead[id] || [];
      byLead[id].push(m);
    });

    const chatList: ChatItem[] = Object.entries(byLead).map(([leadId, list]) => {
      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      const last = sorted[0];
      const leadName = last.lead?.name || `Lead #${leadId}`;
      return {
        id: leadId,
        name: leadName,
        lastMessage:
          last.content.length > 30 ? `${last.content.substring(0, 30)}...` : last.content,
        timestamp: last.createdAt
          ? new Date(last.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(leadName)}&background=3f51b5&color=ffffff&type=png`,
      } satisfies ChatItem;
    });

    return chatList;
  },
);

export const loadMessagesForChat = createAsyncThunk<
  { chatId: string; messages: Message[] },
  string
>('chat/loadMessagesForChat', async (chatId: string) => {
  const leadId = parseInt(chatId, 10);
  if (Number.isNaN(leadId)) {
    throw new Error('Invalid lead id');
  }
  // Fetch lead messages, quotations, and invoices in parallel
  const [msgRes, quoRes, invRes] = await Promise.all([
    fetch(`/api/lead-messages/${leadId}`, { credentials: 'include' }),
    fetch(`/api/dealers/quotations?leadId=${leadId}`, { credentials: 'include' }),
    fetch(`/api/invoices?leadId=${leadId}`, { credentials: 'include' }),
  ]);
  if (!msgRes.ok) throw new Error('Failed to load messages');
  const baseMessages = (await msgRes.json()) as LeadMessageDTO[];
  const quotations: QuotationDTO[] = quoRes.ok ? ((await quoRes.json()) as QuotationDTO[]) : [];
  const invoices: InvoiceDTO[] = invRes.ok ? ((await invRes.json()) as InvoiceDTO[]) : [];

  const normalizedBase: Message[] = baseMessages.map((m) => ({
    id: String(m.id),
    content: m.content,
    type: (m.type as 'message' | 'quotation' | 'invoice') || 'message',
    createdAt: m.createdAt,
  }));

  const normalizedQuotations: Message[] = quotations.map((q) => ({
    id: `q-${q.id ?? `${leadId}-${q.createdAt}`}`,
    content: JSON.stringify({
      subject: q.subject,
      message: q.message,
      price: q.quotationPrice ?? q.price ?? 0,
    }),
    type: 'quotation',
    createdAt: q.createdAt ?? new Date().toISOString(),
  }));

  const normalizedInvoices: Message[] = invoices.map((i) => ({
    id: `inv-${i.id}`,
    content: JSON.stringify({
      invoiceNumber: String(i.id),
      date: i.date,
      total: (i.grandTotal ?? i.total ?? ((i.subTotal ?? 0) + (i.taxAmount ?? 0))),
      status: i.status,
    }),
    type: 'invoice',
    createdAt: i.createdAt ?? i.date ?? new Date().toISOString(),
  }));

  const merged: Message[] = [...normalizedBase, ...normalizedQuotations, ...normalizedInvoices]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return { chatId, messages: merged };
});

export const ensureChatFromLead = createAsyncThunk<
  { chat: ChatItem; chatId: string },
  EnsureChatFromLeadArgs
>('chat/ensureChatFromLead', async ({ leadId }) => {
  try {
    const res = await fetch(`/api/leads/${leadId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Lead not found');
    const lead: Lead = (await res.json()) as Lead;
    const leadName = lead?.name || `Lead #${leadId}`;
    const vehicleInfo = [lead?.vehicle_brand, lead?.vehicle_model]
      .filter(Boolean)
      .join(' ');

    const chat: ChatItem = {
      id: String(leadId),
      name: leadName,
      lastMessage: vehicleInfo || 'No messages yet',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(leadName)}&background=3f51b5&color=ffffff&type=png`,
    };
    return { chat, chatId: String(leadId) };
  } catch {
    const chat: ChatItem = {
      id: String(leadId),
      name: `Lead #${leadId}`,
      lastMessage: 'No messages yet',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatarUrl: `https://ui-avatars.com/api/?name=Lead+${leadId}&background=3f51b5&color=ffffff&type=png`,
    };
    return { chat, chatId: String(leadId) };
  }
});

export const startNewChat = createAsyncThunk<
  { chat: ChatItem; chatId: string },
  StartNewChatArgs
>('chat/startNewChat', async ({ leadId, leadData }) => {
  const leadName = leadData?.name || `Lead #${leadId}`;
  const vehicleInfo = [leadData?.vehicle_brand, leadData?.vehicle_model]
    .filter(Boolean)
    .join(' ');
  const chat: ChatItem = {
    id: leadId,
    name: leadName,
    lastMessage: vehicleInfo || 'No messages yet',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(leadName)}&background=3f51b5&color=ffffff&type=png`,
  };
  return { chat, chatId: leadId };
});

export const sendMessage = createAsyncThunk<
  { chatId: string; messages: Message[] },
  SendMessageArgs
>('chat/sendMessage', async ({ chatId, content }) => {
  const leadId = parseInt(chatId, 10);
  if (Number.isNaN(leadId)) throw new Error('Invalid lead id');

  // Persist message
  const createRes = await fetch('/api/lead-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content, leadId }),
  });
  if (!createRes.ok) throw new Error('Failed to send message');
  // Re-fetch messages to ensure consistency
  const res = await fetch(`/api/lead-messages/${leadId}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load messages');
  const messages = (await res.json()) as LeadMessageDTO[];
  const normalized: Message[] = messages
    .map((m: LeadMessageDTO) => ({
      id: String(m.id),
      content: m.content,
      type: (m.type as 'message' | 'quotation') || 'message',
      createdAt: m.createdAt,
    }))
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  return { chatId, messages: normalized };
});

const initialState: ChatState = {
  chats: [],
  messagesByChatId: {},
  currentChatId: null,
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChatId(state, action: PayloadAction<string | null>) {
      state.currentChatId = action.payload;
    },
    resetError(state) {
      state.error = null;
    },
    appendMessage(
      state,
      action: PayloadAction<{ chatId: string; message: Message }>,
    ) {
      const { chatId, message } = action.payload;
      const arr = state.messagesByChatId[chatId] || [];
      state.messagesByChatId[chatId] = [...arr, message].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(loadChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load chats';
      })

      .addCase(loadMessagesForChat.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Initialize array
        const chatId = action.meta.arg;
        if (!state.messagesByChatId[chatId]) state.messagesByChatId[chatId] = [];
      })
      .addCase(loadMessagesForChat.fulfilled, (state, action) => {
        state.loading = false;
        const { chatId, messages } = action.payload;
        state.currentChatId = chatId;
        state.messagesByChatId[chatId] = messages;
      })
      .addCase(loadMessagesForChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load messages';
      })

      .addCase(ensureChatFromLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ensureChatFromLead.fulfilled, (state, action) => {
        state.loading = false;
        const { chat, chatId } = action.payload;
        const exists = state.chats.some((c) => c.id === chat.id);
        if (!exists) state.chats.unshift(chat);
        state.currentChatId = chatId;
        if (!state.messagesByChatId[chatId]) state.messagesByChatId[chatId] = [];
      })
      .addCase(ensureChatFromLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to ensure chat';
      })

      .addCase(startNewChat.fulfilled, (state, action) => {
        const { chat, chatId } = action.payload;
        const exists = state.chats.some((c) => c.id === chat.id);
        if (!exists) state.chats.unshift(chat);
        state.currentChatId = chatId;
        if (!state.messagesByChatId[chatId]) state.messagesByChatId[chatId] = [];
      })

      .addCase(sendMessage.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        const { chatId, content } = action.meta.arg;
        const tempId = `temp-${Date.now()}`;
        const arr = state.messagesByChatId[chatId] || [];
        const temp: Message = {
          id: tempId,
          content,
          type: 'message',
          createdAt: new Date().toISOString(),
        };
        state.messagesByChatId[chatId] = [...arr, temp];
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { chatId, messages } = action.payload;
        state.messagesByChatId[chatId] = messages;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      });
  },
});

export const { setCurrentChatId, resetError, appendMessage } = chatSlice.actions;
export default chatSlice.reducer;
