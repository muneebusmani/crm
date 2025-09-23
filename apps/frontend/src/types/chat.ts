export interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
}

export type ChatContextType = {
  messages: Message[];
  addMessage: (text: string) => void;
  isLoading: boolean;
};
