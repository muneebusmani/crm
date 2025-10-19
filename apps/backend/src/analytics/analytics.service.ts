// src/analytics/leads-analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Lead } from '../leads/entities/lead.entity'; // adjust path to your Lead entity
import { CustomError } from 'src/common/custom-error';
import { LeadStatus, type ApiResponse } from '@crm/types';
import moment from 'moment';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { DealerLead } from 'src/user/entities/dealer-lead.entity';
import { Quotation } from 'src/user/entities';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,

    @InjectRepository(DealerLead)
    private readonly dealerLeadRepo : Repository<DealerLead>,

    @InjectRepository(DealerLead)
    private readonly quotationRepo : Repository<Quotation>
  ) {}

  
  // Count leads by status
  async getTotalLeadsCount() {
    return this.leadRepo.count(); // just returns a number
  }
  async getTodayUnassignedLeadsCount(dealerId: Number){
 
   const count = await this.leadRepo
    .createQueryBuilder('leads')
    .where('DATE("leads"."createdAt") = CURRENT_DATE')
    .andWhere(qb => {
      const subQuery = qb
        .subQuery()
        .select('"dealerLead"."leadId"')
        .from('dealer_leads', 'dealerLead')
        .where('"dealerLead"."userId" = :dealerId')
        .getQuery();
      return `"leads"."id" NOT IN ${subQuery}`;
    })
    .setParameter('dealerId', dealerId)
    .getCount();
    return {
      total: count,
    };
  }

  

   async getDealerTotalRevenue(userId: Number){
   const totalRevenue = await this.invoiceRepo
    .createQueryBuilder('invoice')
    .select('SUM(invoice.grandTotal)', 'total')
    .where('invoice.userId = :userId', { userId })
    .getRawOne();
    return totalRevenue;
  }

  // Count leads by month (based on createdAt)
  async getMonthlyLeads() {
    try {
      const leads = await this.leadRepo.find({ select: ['createdAt'] });
      const grouped: Record<string, number> = {};
      for (const lead of leads) {
        if (!lead.createdAt) continue;

        const month = lead.createdAt.toISOString().slice(0, 7); // e.g. "2025-09"
        grouped[month] = (grouped[month] || 0) + 1;
      }

      return Object.entries(grouped).map(([month, count]) => ({
        month,
        count,
      }));
    } catch (error: unknown) {
      throw new CustomError('Unable to find monty leads');
    }
  }


async  getDealerConversionRate(dealerId: number) {
  // Step 1: Get all leads that are already won by any dealer
  const wonLeads = await this.dealerLeadRepo
    .createQueryBuilder('dl')
    .select('DISTINCT dl.leadId', 'leadId')
    .where('dl.status = :status', { status: 'won' })
    .getRawMany();

  const wonLeadIds = wonLeads.map((x) => x.leadId);
  const wonLeadIdsList = wonLeadIds.length ? wonLeadIds : [0]; // fallback

  // Step 2: Get all quoted (but not already won) leads by this dealer
  const quoted = await this.quotationRepo
  .createQueryBuilder('q')
  .innerJoin('q.dealer', 'dealer')
  .select('dealer.id', 'dealerId')
  .addSelect('COUNT(DISTINCT q.leadId)', 'quotedCount')
  .where('dealer.id = :dealerId', { dealerId })
  .andWhere('q.leadId NOT IN (:...wonLeadIds)', { wonLeadIds: wonLeadIdsList })
  .groupBy('dealer.id')
  .getRawOne();

  const quotedCount = Number(quoted?.quotedCount || 0);

  // Step 3: Get how many leads this dealer actually won
  const won = await this.dealerLeadRepo
    .createQueryBuilder('dl')
    .select('COUNT(DISTINCT dl.leadId)', 'wonCount')
    .where('dl.userId = :dealerId', { dealerId })
    .andWhere('dl.status = :status', { status: LeadStatus.CLOSE })
    .getRawOne();

  const wonCount = Number(won?.wonCount || 0);

  // Step 4: Compute conversion rate
  const conversionRate = quotedCount > 0 ? ((wonCount / quotedCount) * 100).toFixed(2) : '0.00';

  // Step 5: Return a structured response
  return {
    dealerId,
    quotedCount,
    wonCount,
    conversionRate: `${conversionRate}%`,
  };
}

  // ✅ Leads between date range
  async getLeadsByDateRange(start: Date, end: Date) {
    try {
      const leads = await this.leadRepo.find({
        where: { createdAt: Between(start, end) },
        select: ['createdAt'],
      });

      const grouped: Record<string, number> = {};
      for (const lead of leads) {
        const day = lead.createdAt.toISOString().slice(0, 10); // e.g. "2025-09-16"
        grouped[day] = (grouped[day] || 0) + 1;
      }
      const result = Object.entries(grouped).map(([day, count]) => ({
        day,
        count,
      }));

      return result;
    } catch (error: unknown) {
      throw new CustomError('Unable to find leads');
    }
  }
}
