export interface LeadMessage {
  id: number;
  content: string;
  dealer: {
    id: number;
    name: string; // adjust based on Dealer entity
  };
  createdAt: string; // use string for ISO dates when sending in API response
}
