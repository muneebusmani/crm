export interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date | string;
  senderName?: string;
}

export type ChatContextType = {
  messages: Message[];
  addMessage: (text: string) => void;
  isLoading: boolean;
};
