// Type adapter to convert between frontend and backend message formats

import type { LeadMessage } from '@crm/types';
import type { Message } from '@dealer/types/chat';

export interface MessageAdapter {
  // Convert backend LeadMessage to frontend Message
  toFrontendMessage: (
    leadMessage: LeadMessage,
    currentDealerId?: number,
  ) => Message;

  // Convert frontend message text to backend CreateLeadMessageDto
  toBackendMessage: (
    text: string,
    leadId: number,
  ) => { content: string; leadId: number };
}

export const messageAdapter: MessageAdapter = {
  toFrontendMessage: (
    leadMessage: LeadMessage,
    currentDealerId?: number,
  ): Message => {
    // Determine if this message was sent by current dealer or the lead
    const isFromCurrentDealer =
      currentDealerId && leadMessage.dealer.id === currentDealerId;

    return {
      id: leadMessage.id.toString(),
      text: leadMessage.content,
      sender: isFromCurrentDealer ? 'user' : 'other',
      timestamp: new Date(leadMessage.createdAt),
    };
  },

  toBackendMessage: (text: string, leadId: number) => ({
    content: text,
    leadId: leadId,
  }),
};
