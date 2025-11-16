// src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Lead } from '../leads/entities/lead.entity';
import { Quotation } from '../quotations/entities/quotation.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { User } from '../user/entities/user.entity';
import { DealerLead } from '../user/entities/dealer-lead.entity';
import { DealerTier } from '../user/entities/dealer-tier.entity';
import { CustomError } from 'src/common/custom-error';
import { UserType } from '@crm/types';
import type {
  DashboardStats,
  StatusCount,
  MonthlyCount,
  MonthlyTrend,
  DealerRanking,
  RecentActivity,
} from './types/dashboard.types';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Quotation)
    private readonly quotationRepo: Repository<Quotation>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(DealerLead)
    private readonly dealerLeadRepo: Repository<DealerLead>,
    @InjectRepository(DealerTier)
    private readonly dealerTierRepo: Repository<DealerTier>,
  ) {}

  // ========================================
  // MAIN DASHBOARD STATS METHOD
  // ========================================
  async getDashboardStats(dealerId?: number): Promise<DashboardStats> {
    try {
      const [
        totalLeads,
        totalQuotations,
        wonLeadsCount,
        totalDealers,
        conversionRate,
        leadsByStatus,
        monthlyTrends,
        topDealers,
        recentActivity,
        dealerCredits,
        dealerTier,
        totalRevenue,
        pendingQuotations,
      ] = await Promise.all([
        this.getTotalLeadsCount(dealerId),
        this.getQuotationsCount(dealerId),
        this.getWonLeadsCount(dealerId), // Unique won leads (leads with at least one invoice)
        dealerId ? Promise.resolve(undefined) : this.getTotalDealersCount(),
        this.getConversionRate(dealerId),
        this.getLeadsByStatus(dealerId),
        this.getMonthlyTrends(dealerId),
        dealerId ? Promise.resolve(undefined) : this.getTopDealers(10),
        this.getRecentActivity(dealerId, 5),
        dealerId ? this.getDealerCredits(dealerId) : Promise.resolve(undefined),
        dealerId ? this.getDealerTier(dealerId) : Promise.resolve(undefined),
        dealerId ? this.getTotalRevenue(dealerId) : Promise.resolve(undefined),
        dealerId ? this.getPendingQuotationsCount(dealerId) : Promise.resolve(undefined),
      ]);

      return {
        overview: {
          totalLeads,
          totalQuotations,
          totalInvoices: wonLeadsCount, // Unique won leads (not total invoice count)
          totalDealers,
          conversionRate, // Based on unique won leads / quotations
          dealerCredits,
          dealerTier,
          totalRevenue,
          pendingQuotations,
        },
        leadsByStatus,
        monthlyTrends,
        topDealers,
        recentActivity,
      };
    } catch (error) {
      console.error('❌ Error in getDashboardStats:', error);
      console.error(
        'Error stack:',
        error instanceof Error ? error.stack : 'No stack trace',
      );
      throw new CustomError(
        `Unable to fetch dashboard stats: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // ========================================
  // OVERVIEW STATS
  // ========================================
  async getTotalLeadsCount(dealerId?: number): Promise<number> {
    if (dealerId) {
      // Count leads assigned to this dealer via DealerLead relation
      return this.leadRepo
        .createQueryBuilder('lead')
        .innerJoin('lead.dealerLeads', 'dealerLead')
        .where('"dealerLead"."userId" = :dealerId', { dealerId })
        .andWhere('lead.is_deleted = false')
        .getCount();
    }
    return this.leadRepo.count({ where: { is_deleted: false } });
  }

  async getQuotationsCount(dealerId?: number): Promise<number> {
    if (dealerId) {
      return this.quotationRepo
        .createQueryBuilder('quotation')
        .innerJoin('quotation.dealer', 'dealer')
        .where('dealer.id = :dealerId', { dealerId })
        .getCount();
    }
    return this.quotationRepo.count();
  }

  async getInvoicesCount(dealerId?: number): Promise<number> {
    if (dealerId) {
      return this.invoiceRepo
        .createQueryBuilder('invoice')
        .innerJoin('invoice.dealer', 'dealer')
        .where('dealer.id = :dealerId', { dealerId })
        .getCount();
    }
    return this.invoiceRepo.count();
  }

  async getWonLeadsCount(dealerId?: number): Promise<number> {
    // Count leads won by dealer (using wonByDealerId field)
    let query = this.leadRepo
      .createQueryBuilder('lead')
      .where('lead.wonByDealerId IS NOT NULL');

    if (dealerId) {
      query = query.andWhere('lead.wonByDealerId = :dealerId', { dealerId });
    }

    return await query.getCount();
  }

  async getTotalDealersCount(): Promise<number> {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.dealer', 'dealer')
      .where('user.type = :type', { type: UserType.DEALER })
      .andWhere('dealer.id IS NOT NULL')
      .getCount();
  }

  async getDealerCredits(dealerId: number): Promise<number> {
    const user = await this.userRepo.findOne({
      where: { id: dealerId },
      relations: ['dealer'],
    });
    return user?.dealer?.credits || 0;
  }

  async getDealerTier(dealerId: number): Promise<string | undefined> {
    const user = await this.userRepo.findOne({
      where: { id: dealerId },
      relations: ['dealer'],
    });
    
    if (!user?.dealer?.tierId) return undefined;

    const tier = await this.dealerTierRepo.findOne({ 
      where: { id: user.dealer.tierId } 
    });
    
    return tier?.name;
  }

  async getTotalRevenue(dealerId: number): Promise<number> {
    // Sum all invoice amounts for the dealer
    const result = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .select('SUM(invoice.grandTotal)', 'total')
      .innerJoin('invoice.dealer', 'dealer')
      .where('dealer.id = :dealerId', { dealerId })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  async getPendingQuotationsCount(dealerId: number): Promise<number> {
    // Count quotations that haven't converted to invoices yet
    const quotationsWithInvoices = await this.invoiceRepo
      .createQueryBuilder('invoice')
      .select('DISTINCT invoice.leadId', 'leadId')
      .innerJoin('invoice.dealer', 'dealer')
      .where('dealer.id = :dealerId', { dealerId })
      .getRawMany();

    const leadsWithInvoices = quotationsWithInvoices.map((row) => row.leadId);

    const query = this.quotationRepo
      .createQueryBuilder('quotation')
      .innerJoin('quotation.dealer', 'dealer')
      .where('dealer.id = :dealerId', { dealerId });

    if (leadsWithInvoices.length > 0) {
      query.andWhere('quotation.lead NOT IN (:...leadIds)', {
        leadIds: leadsWithInvoices,
      });
    }

    return query.getCount();
  }

  async getConversionRate(dealerId?: number): Promise<number> {
    // Count unique leads with quotations
    const quotationsCount = await this.getQuotationsCount(dealerId);

    // Count unique leads with invoices (won leads)
    let wonLeadsQuery = this.invoiceRepo
      .createQueryBuilder('invoice')
      .select('COUNT(DISTINCT invoice.leadId)', 'count');

    if (dealerId) {
      wonLeadsQuery = wonLeadsQuery
        .innerJoin('invoice.dealer', 'dealer')
        .where('dealer.id = :dealerId', { dealerId });
    }

    const result = await wonLeadsQuery.getRawOne();
    const wonLeadsCount = parseInt(result?.count || '0', 10);

    if (quotationsCount === 0) return 0;

    return Math.round((wonLeadsCount / quotationsCount) * 100 * 100) / 100; // 2 decimal places
  }

  // ========================================
  // LEADS BY STATUS
  // ========================================
  async getLeadsByStatus(dealerId?: number): Promise<StatusCount[]> {
    try {
      // Query from dealer_leads pivot table to get status per dealer per lead
      let query = this.dealerLeadRepo
        .createQueryBuilder('dealerLead')
        .select('dealerLead.status', 'status')
        .addSelect('COUNT(DISTINCT dealerLead.leadId)', 'count')
        .innerJoin('dealerLead.lead', 'lead')
        .where('lead.is_deleted = false')
        .groupBy('dealerLead.status');

      if (dealerId) {
        query = query
          .innerJoin('dealerLead.dealer', 'dealer')
          .andWhere('dealer.id = :dealerId', { dealerId });
      }

      const results = await query.getRawMany();

      // Get total leads count
      const totalLeads = await this.getTotalLeadsCount(dealerId);

      // Get count of leads tracked in pivot table
      let trackedLeadsQuery = this.dealerLeadRepo
        .createQueryBuilder('dealerLead')
        .select('COUNT(DISTINCT "dealerLead"."leadId")', 'count')
        .innerJoin('dealerLead.lead', 'lead')
        .where('lead.is_deleted = false');

      if (dealerId) {
        trackedLeadsQuery = trackedLeadsQuery
          .innerJoin('dealerLead.dealer', 'dealer')
          .andWhere('"dealer"."id" = :dealerId', { dealerId });
      }

      const trackedResult = await trackedLeadsQuery.getRawOne();
      const trackedLeadsCount = parseInt(trackedResult?.count || '0', 10);

      // Calculate new leads (not in pivot table)
      const newLeadsCount = totalLeads - trackedLeadsCount;

      const statusCounts = results.map((row) => ({
        status: row.status || 'unknown',
        count: parseInt(row.count, 10),
      }));

      // Add NEW leads if any exist
      if (newLeadsCount > 0) {
        statusCounts.push({
          status: 'NEW',
          count: newLeadsCount,
        });
      }

      return statusCounts;
    } catch (error) {
      console.error('❌ Error in getLeadsByStatus:', error);
      throw new CustomError('Unable to get leads by status');
    }
  }

  // ========================================
  // MONTHLY TRENDS
  // ========================================
  async getMonthlyTrends(dealerId?: number): Promise<MonthlyTrend[]> {
    try {
      const [leadsData, quotationsData, invoicesData] = await Promise.all([
        this.getMonthlyLeads(dealerId),
        this.getMonthlyQuotations(dealerId),
        this.getMonthlyInvoices(dealerId),
      ]);

      // Merge all months
      const allMonths = new Set<string>();
      for (const item of leadsData) allMonths.add(item.month);
      for (const item of quotationsData) allMonths.add(item.month);
      for (const item of invoicesData) allMonths.add(item.month);

      const sortedMonths = Array.from(allMonths).sort();

      return sortedMonths.map((month) => ({
        month,
        leads: leadsData.find((item) => item.month === month)?.count || 0,
        quotations:
          quotationsData.find((item) => item.month === month)?.count || 0,
        invoices: invoicesData.find((item) => item.month === month)?.count || 0,
      }));
    } catch (error) {
      throw new CustomError('Unable to get monthly trends');
    }
  }

  async getMonthlyLeads(dealerId?: number): Promise<MonthlyCount[]> {
    try {
      let query = this.leadRepo
        .createQueryBuilder('lead')
        .select("TO_CHAR(lead.createdAt, 'YYYY-MM')", 'month')
        .addSelect('COUNT(*)', 'count')
        .where('lead.is_deleted = false')
        .groupBy('month')
        .orderBy('month', 'ASC');

      if (dealerId) {
        query = query
          .innerJoin('lead.dealerLeads', 'dealerLead')
          .andWhere('"dealerLead"."userId" = :dealerId', { dealerId });
      }

      const results = await query.getRawMany();

      return results.map((row) => ({
        month: row.month,
        count: parseInt(row.count, 10),
      }));
    } catch (error) {
      throw new CustomError('Unable to find monthly leads');
    }
  }

  async getMonthlyQuotations(dealerId?: number): Promise<MonthlyCount[]> {
    try {
      let query = this.quotationRepo
        .createQueryBuilder('quotation')
        .select("TO_CHAR(quotation.createdAt, 'YYYY-MM')", 'month')
        .addSelect('COUNT(*)', 'count')
        .groupBy('month')
        .orderBy('month', 'ASC');

      if (dealerId) {
        query = query
          .innerJoin('quotation.dealer', 'dealer')
          .where('dealer.id = :dealerId', { dealerId });
      }

      const results = await query.getRawMany();

      return results.map((row) => ({
        month: row.month,
        count: parseInt(row.count, 10),
      }));
    } catch (error) {
      throw new CustomError('Unable to find monthly quotations');
    }
  }

  async getMonthlyInvoices(dealerId?: number): Promise<MonthlyCount[]> {
    try {
      let query = this.invoiceRepo
        .createQueryBuilder('invoice')
        .select("TO_CHAR(invoice.createdAt, 'YYYY-MM')", 'month')
        .addSelect('COUNT(*)', 'count')
        .groupBy('month')
        .orderBy('month', 'ASC');

      if (dealerId) {
        query = query
          .innerJoin('invoice.dealer', 'dealer')
          .where('dealer.id = :dealerId', { dealerId });
      }

      const results = await query.getRawMany();

      return results.map((row) => ({
        month: row.month,
        count: parseInt(row.count, 10),
      }));
    } catch (error) {
      throw new CustomError('Unable to find monthly invoices');
    }
  }

  // ========================================
  // TOP DEALERS (ADMIN ONLY)
  // ========================================
  async getTopDealers(limit: number = 10): Promise<DealerRanking[]> {
    try {
      const dealers = await this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.dealer', 'dealer')
        .where('user.type = :type', { type: UserType.DEALER })
        .andWhere('dealer.id IS NOT NULL')
        .getMany();

      const rankings: DealerRanking[] = await Promise.all(
        dealers.map(async (user) => {
          // Count unique won leads (leads with at least one invoice)
          const wonLeadsResult = await this.invoiceRepo
            .createQueryBuilder('invoice')
            .select('COUNT(DISTINCT invoice.leadId)', 'count')
            .innerJoin('invoice.dealer', 'dealer')
            .where('dealer.id = :dealerId', { dealerId: user.id })
            .getRawOne();
          const wonLeadsCount = parseInt(wonLeadsResult?.count || '0', 10);

          const quotationCount = await this.getQuotationsCount(user.id);
          const conversionRate =
            quotationCount > 0
              ? Math.round((wonLeadsCount / quotationCount) * 100 * 100) / 100
              : 0;

          return {
            dealerId: user.id,
            dealerName: user.dealer?.name || user.username,
            dealerEmail: user.email,
            invoiceCount: wonLeadsCount, // Now represents unique won leads
            quotationCount,
            conversionRate,
          };
        }),
      );

      // Sort by won leads count descending
      return rankings
        .sort((a, b) => b.invoiceCount - a.invoiceCount)
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Error in getTopDealers:', error);
      throw new CustomError('Unable to get top dealers');
    }
  }

  // ========================================
  // RECENT ACTIVITY
  // ========================================
  async getRecentActivity(
    dealerId?: number,
    limit: number = 5,
  ): Promise<RecentActivity> {
    try {
      const [leads, quotations, invoices] = await Promise.all([
        this.getRecentLeads(dealerId, limit),
        this.getRecentQuotations(dealerId, limit),
        this.getRecentInvoices(dealerId, limit),
      ]);

      return { leads, quotations, invoices };
    } catch (error) {
      throw new CustomError('Unable to get recent activity');
    }
  }

  async getRecentLeads(dealerId?: number, limit: number = 5): Promise<Lead[]> {
    // Get recent NEW leads that are NOT tracked in dealer_leads table (by ANY dealer)
    // These are leads that haven't been contacted/quoted/won/lost yet
    const trackedLeadIds = await this.dealerLeadRepo
      .createQueryBuilder('dealerLead')
      .select('DISTINCT dealerLead.leadId')
      .getRawMany();

    const trackedIds = trackedLeadIds.map((row) => row.leadId);

    let query = this.leadRepo
      .createQueryBuilder('lead')
      .where('lead.is_deleted = false')
      .orderBy('lead.createdAt', 'DESC')
      .limit(limit);

    if (trackedIds.length > 0) {
      query = query.andWhere('lead.id NOT IN (:...trackedIds)', { trackedIds });
    }

    return query.getMany();
  }

  async getRecentQuotations(
    dealerId?: number,
    limit: number = 5,
  ): Promise<Quotation[]> {
    let query = this.quotationRepo
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.dealer', 'dealer')
      .leftJoinAndSelect('quotation.lead', 'lead')
      .orderBy('quotation.createdAt', 'DESC')
      .limit(limit);

    if (dealerId) {
      query = query.where('dealer.id = :dealerId', { dealerId });
    }

    return query.getMany();
  }

  async getRecentInvoices(
    dealerId?: number,
    limit: number = 5,
  ): Promise<Invoice[]> {
    let query = this.invoiceRepo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.dealer', 'dealer')
      .leftJoinAndSelect('invoice.lead', 'lead')
      .orderBy('invoice.createdAt', 'DESC')
      .limit(limit);

    if (dealerId) {
      query = query.where('dealer.id = :dealerId', { dealerId });
    }

    return query.getMany();
  }

  // ========================================
  // LEGACY METHODS (KEEP FOR BACKWARD COMPATIBILITY)
  // ========================================
  async getLeadsByDateRange(start: Date, end: Date) {
    try {
      const leads = await this.leadRepo.find({
        where: { createdAt: Between(start, end), is_deleted: false },
        select: ['createdAt'],
      });

      const grouped: Record<string, number> = {};
      for (const lead of leads) {
        const day = lead.createdAt.toISOString().slice(0, 10);
        grouped[day] = (grouped[day] || 0) + 1;
      }

      return Object.entries(grouped).map(([day, count]) => ({ day, count }));
    } catch (error: unknown) {
      throw new CustomError('Unable to find leads');
    }
  }
}
