// Dashboard analytics types
import type { Lead } from 'src/leads/entities/lead.entity';
import type { Quotation } from 'src/quotations/entities/quotation.entity';
import type { Invoice } from 'src/invoices/entities/invoice.entity';

export interface StatusCount {
  status: string;
  count: number;
}

export interface MonthlyCount {
  month: string;
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
