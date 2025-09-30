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
    // Fetch messages, quotations, and invoices in parallel
    const [msgRes, quoRes, invRes] = await Promise.all([
      fetch('/api/lead-messages', { credentials: 'include' }),
      fetch('/api/dealers/quotations', { credentials: 'include' }),
      fetch('/api/invoices', { credentials: 'include' }),
    ]);

    // Get messages (tolerate errors)
    let allMessages: LeadMessageDTO[] = [];
    if (msgRes.ok) {
      try {
        const data = await msgRes.json();
        allMessages = Array.isArray(data) ? data : [];
      } catch {
        allMessages = [];
      }
    }

    // Get quotations and invoices (tolerate errors)
    const quotations: QuotationDTO[] = quoRes.ok
      ? ((await quoRes.json()) as QuotationDTO[])
      : [];
    const invoices: InvoiceDTO[] = invRes.ok
      ? ((await invRes.json()) as InvoiceDTO[])
      : [];

    // Collect all lead IDs that have any activity
    const leadIds = new Set<string>();
    const leadData: Record<
      string,
      { name?: string; lastActivity?: string; lastTimestamp?: string }
    > = {};

    // Process messages
    allMessages.forEach((m: LeadMessageDTO) => {
      const id = m.lead?.id?.toString();
      if (!id) return;
      leadIds.add(id);
      if (
        !leadData[id] ||
        new Date(m.createdAt) > new Date(leadData[id].lastTimestamp || '')
      ) {
        leadData[id] = {
          name: m.lead?.name || `Lead #${id}`,
          lastActivity:
            m.content.length > 30
              ? `${m.content.substring(0, 30)}...`
              : m.content,
          lastTimestamp: m.createdAt,
        };
      }
    });

    // Process quotations
    quotations.forEach((q: any) => {
      const id = q.lead?.id?.toString() || String(q.id);
      if (!id) return;
      leadIds.add(id);
      const activity = `Quotation: ${q.subject}`;
      const timestamp = q.createdAt || new Date().toISOString();
      if (
        !leadData[id] ||
        new Date(timestamp) > new Date(leadData[id].lastTimestamp || '')
      ) {
        leadData[id] = {
          name: q.dealershipName || leadData[id]?.name || `Lead #${id}`,
          lastActivity:
            activity.length > 30 ? `${activity.substring(0, 30)}...` : activity,
          lastTimestamp: timestamp,
        };
      }
    });

    // Process invoices
    invoices.forEach((i: any) => {
      const id = i.lead?.id?.toString() || String(i.leadId) || String(i.id);
      if (!id) return;
      leadIds.add(id);
      const activity = `Invoice #${i.id}`;
      const timestamp = i.createdAt || i.date || new Date().toISOString();
      if (
        !leadData[id] ||
        new Date(timestamp) > new Date(leadData[id].lastTimestamp || '')
      ) {
        leadData[id] = {
          name: i.lead?.name || leadData[id]?.name || `Lead #${id}`,
          lastActivity: activity,
          lastTimestamp: timestamp,
        };
      }
    });

    // Build chat list from all leads with activity
    const chatList: ChatItem[] = Array.from(leadIds).map((leadId) => {
      const data = leadData[leadId];
      const leadName = data?.name || `Lead #${leadId}`;
      return {
        id: leadId,
        name: leadName,
        lastMessage: data?.lastActivity || 'No activity yet',
        timestamp: data?.lastTimestamp
          ? new Date(data.lastTimestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(leadName)}&background=3f51b5&color=ffffff&type=png`,
      } satisfies ChatItem;
    });

    // Sort by most recent activity
    chatList.sort((a, b) => {
      const aTime = leadData[a.id]?.lastTimestamp || '';
      const bTime = leadData[b.id]?.lastTimestamp || '';
      return new Date(bTime).getTime() - new Date(aTime).getTime();
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
    fetch(`/api/dealers/quotations?leadId=${leadId}`, {
      credentials: 'include',
    }),
    fetch(`/api/invoices?leadId=${leadId}`, { credentials: 'include' }),
  ]);

  // Handle empty or error responses gracefully - new chats might not have messages yet
  let baseMessages: LeadMessageDTO[] = [];
  if (msgRes.ok) {
    try {
      const data = await msgRes.json();
      baseMessages = Array.isArray(data) ? data : [];
    } catch {
      baseMessages = [];
    }
  }

  const quotations: QuotationDTO[] = quoRes.ok
    ? ((await quoRes.json()) as QuotationDTO[])
    : [];
  const invoices: InvoiceDTO[] = invRes.ok
    ? ((await invRes.json()) as InvoiceDTO[])
    : [];

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
      total: i.grandTotal ?? i.total ?? (i.subTotal ?? 0) + (i.taxAmount ?? 0),
      status: i.status,
    }),
    type: 'invoice',
    createdAt: i.createdAt ?? i.date ?? new Date().toISOString(),
  }));

  const merged: Message[] = [
    ...normalizedBase,
    ...normalizedQuotations,
    ...normalizedInvoices,
  ].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

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
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(leadName)}&background=3f51b5&color=ffffff&type=png`,
    };
    return { chat, chatId: String(leadId) };
  } catch {
    const chat: ChatItem = {
      id: String(leadId),
      name: `Lead #${leadId}`,
      lastMessage: 'No messages yet',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
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
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
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
  // Re-fetch merged feed (messages + quotations + invoices) to ensure consistency
  const [msgRes, quoRes, invRes] = await Promise.all([
    fetch(`/api/lead-messages/${leadId}`, { credentials: 'include' }),
    fetch(`/api/dealers/quotations?leadId=${leadId}`, {
      credentials: 'include',
    }),
    fetch(`/api/invoices?leadId=${leadId}`, { credentials: 'include' }),
  ]);

  // Base messages (tolerate empty)
  let baseMessages: LeadMessageDTO[] = [];
  if (msgRes.ok) {
    try {
      const data = await msgRes.json();
      baseMessages = Array.isArray(data) ? data : [];
    } catch {
      baseMessages = [];
    }
  }

  const quotations: QuotationDTO[] = quoRes.ok
    ? ((await quoRes.json()) as QuotationDTO[])
    : [];
  const invoices: InvoiceDTO[] = invRes.ok
    ? ((await invRes.json()) as InvoiceDTO[])
    : [];

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
      total: i.grandTotal ?? i.total ?? (i.subTotal ?? 0) + (i.taxAmount ?? 0),
      status: i.status,
    }),
    type: 'invoice',
    createdAt: i.createdAt ?? i.date ?? new Date().toISOString(),
  }));

  const merged: Message[] = [
    ...normalizedBase,
    ...normalizedQuotations,
    ...normalizedInvoices,
  ].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return { chatId, messages: merged };
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
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
        if (!state.messagesByChatId[chatId])
          state.messagesByChatId[chatId] = [];
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
        // Do not prefill messages array here; leaving it undefined triggers initial load
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
        // Do not prefill messages array; let the effect fetch merged feed
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

export const { setCurrentChatId, resetError, appendMessage } =
  chatSlice.actions;
export default chatSlice.reducer;
