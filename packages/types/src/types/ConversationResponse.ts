// dto/conversation-response.interface.ts
export interface ConversationResponse {
  id: number;
  dealerId: number;
  adminId: number | null;   // nullable since it's optional
  createdAt: Date;
}
