// src/analytics/leads-analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Lead } from '../leads/entities/lead.entity'; // adjust path to your Lead entity
import { CustomError } from 'src/common/custom-error';
import {type ApiResponse} from '@crm/types'

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
  ) {}

   private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
      try {
        return { data, success: true }
      } catch (error) {
        const message =
          error instanceof CustomError ? error.message : 'Internal server error'
        return { error: message, success: false }
      }
    }
  // Count leads by status
   async getTotalLeadsCount() {
     return this.leadRepo.count(); // just returns a number
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
    }catch(error : unknown){
        throw new CustomError('Unable to find monty leads')
    }
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
    }
    catch(error: unknown){
        throw new CustomError('Unable to find leads')
    }
  }
}
