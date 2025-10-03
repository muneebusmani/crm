// dto/message-response.interface.ts
export interface DealerMessageReposne {
  id: number;
  conversationId: number;   // just return the ID, not the full Conversation object
  senderId: number;
  senderRole: "dealer" | "admin";
  body: string;
  createdAt: Date;
}
