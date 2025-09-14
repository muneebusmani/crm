export interface Quotation {
  id: number;
  engineCodeName: string;
  dealershipName: string;
  quotationPrice: number;
  subject: string;
  message: string;
  dealer: {
    id: number;
    name: string;
  };
}
