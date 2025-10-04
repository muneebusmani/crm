import { ConversationResponse } from "./ConversationResponse";

// dto/message-response.interface.ts
export interface DealerMessageReposne {
  id: number;
  senderId: number;
  conversation: ConversationResponse,
  senderRole: "dealer" | "admin";
  body: string;
  createdAt: Date;
}
