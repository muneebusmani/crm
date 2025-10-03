/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * Chat Redux Slice
 *
 * This module handles all chat-related state management including:
 * - Loading chats and messages
 * - Sending new messages
 * - Managing active chat state
 * - Handling chat creation and updates
 */

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Message } from '@/app/(dealer)/dealer/types/chat';
import type { Lead } from '@crm/types';

/**
 * Data Transfer Object for lead messages from the API
 * @property {number | string} id - Unique message identifier
 * @property {string} content - The message content
 * @property {string} createdAt - ISO timestamp of when the message was created
 * @property {'message' | 'quotation' | 'invoice' | string} type - Type of the message
 * @property {Object} [lead] - Optional lead information
 * @property {number} lead.id - Lead ID
 * @property {string} [lead.name] - Lead's name
 * @property {Object} [dealer] - Optional dealer information
 * @property {number} dealer.id - Dealer ID
 */
type LeadMessageDTO = {
  id: number | string;
  content: string;
  createdAt: string;
  type: 'message' | 'quotation' | 'invoice' | string;
  lead?: { id: number; name?: string };
  dealer?: { id: number };
};

/**
 * Data Transfer Object for quotations from the API
 * @property {number | string} [id] - Optional quotation ID
 * @property {string} [subject] - Quotation subject
 * @property {string} [message] - Quotation message/content
 * @property {number} [quotationPrice] - Price in the quotation
 * @property {number} [price] - Alias for quotationPrice
 * @property {string} [createdAt] - ISO timestamp of when the quotation was created
 */
type QuotationDTO = {
  id?: number | string;
  subject?: string;
  message?: string;
  quotationPrice?: number;
  price?: number;
  createdAt?: string;
};

/**
 * Data Transfer Object for invoices from the API
 * @property {number | string} id - Invoice ID
 * @property {string} date - Invoice date
 * @property {number} [subTotal] - Subtotal amount before tax
 * @property {number} [taxAmount] - Tax amount
 * @property {number} [grandTotal] - Total amount including tax
 * @property {number} [total] - Alias for grandTotal
 * @property {string} [status] - Invoice status
 * @property {string} [createdAt] - ISO timestamp of when the invoice was created
 */
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

/**
 * Thunk to load all chat conversations for the current dealer
 * Fetches messages from the API, groups them by lead, and formats them for the UI
 * @returns {Promise<ChatItem[]>} Array of formatted chat items
 */
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

    const chatList: ChatItem[] = Object.entries(byLead).map(
      ([leadId, list]) => {
        const sorted = [...list].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        const last = sorted[0];
        const leadName = last.lead?.name || `Lead #${leadId}`;
        return {
          id: leadId,
          name: leadName,
          lastMessage:
            last.content.length > 30
              ? `${last.content.substring(0, 30)}...`
              : last.content,
          timestamp: last.createdAt
            ? new Date(last.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(leadName)}&background=3f51b5&color=ffffff&type=png`,
        } satisfies ChatItem;
      },
    );

    return chatList;
  },
);

/**
 * Thunk to load all messages for a specific chat
 * Fetches messages, quotations, and invoices for a lead and combines them
 * @param {string} chatId - The ID of the chat (lead ID as string)
 * @returns {Promise<{chatId: string, messages: Message[]}>} Chat ID and array of messages
 */
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

  // Merge all message types and ensure proper sorting by createdAt timestamp
  const merged: Message[] = [
    ...normalizedBase,
    ...normalizedQuotations,
    ...normalizedInvoices,
  ].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateA - dateB;
  });

  return { chatId, messages: merged };
});

/**
 * Thunk to ensure a chat exists for a lead
 * Creates a new chat item if one doesn't exist, otherwise returns existing
 * @param {EnsureChatFromLeadArgs} args - Arguments object
 * @param {number} args.leadId - The ID of the lead to ensure a chat for
 * @returns {Promise<{chat: ChatItem, chatId: string}>} The chat item and its ID
 */
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
  console.log('starting new chat:', chat);
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

  // Re-fetch all messages, quotations, and invoices to ensure consistency
  const [msgRes, quoRes, invRes] = await Promise.all([
    fetch(`/api/lead-messages/${leadId}`, { credentials: 'include' }),
    fetch(`/api/dealers/quotations?leadId=${leadId}`, {
      credentials: 'include',
    }),
    fetch(`/api/invoices?leadId=${leadId}`, { credentials: 'include' }),
  ]);

  // Handle empty or error responses gracefully
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

  // Merge all message types and ensure proper sorting by createdAt timestamp
  const merged: Message[] = [
    ...normalizedBase,
    ...normalizedQuotations,
    ...normalizedInvoices,
  ].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateA - dateB;
  });

  return { chatId, messages: merged };
});

// Initial state for the chat slice
const initialState: ChatState = {
  chats: [], // List of all chat conversations
  messagesByChatId: {}, // Messages organized by chat ID
  currentChatId: null, // ID of the currently active chat
  loading: false, // Whether an async operation is in progress
  error: null, // Current error message, if any
};

// Create the chat slice with reducers and extra reducers for async thunks
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    /**
     * Sets the currently active chat
     * @param {ChatState} state - Current state
     * @param {PayloadAction<string | null>} action - Action with the chat ID to set as current
     */
    setCurrentChatId(state, action: PayloadAction<string | null>) {
      state.currentChatId = action.payload;
    },
    /**
     * Resets any error in the state
     * @param {ChatState} state - Current state
     */
    resetError(state) {
      state.error = null;
    },
    /**
     * Appends a new message to a chat
     * @param {ChatState} state - Current state
     * @param {PayloadAction<{chatId: string, message: Message}>} action - Action with chat ID and message
     */
    appendMessage(
      state,
      action: PayloadAction<{ chatId: string; message: Message }>,
    ) {
      const { chatId, message } = action.payload;
      const arr = state.messagesByChatId[chatId] || [];
      state.messagesByChatId[chatId] = [...arr, message].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
    },
  },
  // Handle actions from async thunks
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
        // Only set loading state if we don't already have messages
        const chatId = action.meta.arg;
        const existing = state.messagesByChatId[chatId];
        if (existing === undefined) {
          state.loading = true;
        }
        state.error = null;
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
        if (!state.messagesByChatId[chatId])
          state.messagesByChatId[chatId] = [];
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
        if (!state.messagesByChatId[chatId])
          state.messagesByChatId[chatId] = [];
      })

      .addCase(sendMessage.pending, (state, action) => {
        // Only set loading state if we have messages already
        const { chatId } = action.meta.arg;
        const existing = state.messagesByChatId[chatId];
        if (existing !== undefined) {
          state.loading = true;
        }
        state.error = null;
        const { chatId: chatId2, content } = action.meta.arg;
        const tempId = `temp-${Date.now()}`;
        const arr = state.messagesByChatId[chatId2] || [];
        // Use a timestamp that's slightly in the past to ensure proper ordering
        const createdAt = new Date(Date.now() - 1000).toISOString();
        const temp: Message = {
          id: tempId,
          content,
          type: 'message',
          createdAt,
        };
        state.messagesByChatId[chatId2] = [...arr, temp];
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
