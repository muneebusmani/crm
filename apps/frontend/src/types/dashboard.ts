// Dashboard analytics types
export interface StatusCount {
  status: string;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  leads: number;
  quotations: number;
  invoices: number;
}

export interface DealerRanking {
  dealerId: number;
  dealerName: string;
  dealerEmail: string;
  invoiceCount: number;
  quotationCount: number;
  conversionRate: number;
}

export interface Lead {
  id: number;
  number: string;
  name: string;
  email: string;
  status: string;
  vehicle_model?: string;
  vehicle_brand?: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  grandTotal: number;
  date: string;
  status: string;
  createdAt: string;
  lead?: Lead;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  grandTotal: number;
  date: string;
  status: string;
  createdAt: string;
  lead?: Lead;
}

export interface RecentActivity {
  leads: Lead[];
  quotations: Quotation[];
  invoices: Invoice[];
}

export interface DashboardStats {
  overview: {
    totalLeads: number;
    totalQuotations: number;
    totalInvoices: number;
    totalDealers?: number;
    conversionRate: number;
    dealerCredits?: number;
  };
  leadsByStatus: StatusCount[];
  monthlyTrends: MonthlyTrend[];
  topDealers?: DealerRanking[];
  recentActivity: RecentActivity;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
  error?: string;
}
