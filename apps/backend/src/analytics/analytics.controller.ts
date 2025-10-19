// src/analytics/analytics.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CustomError } from 'src/common/custom-error';
import { type ApiResponse } from '@crm/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
// import { AdminAuthGuard } from '../admin/guards/admin-auth.guard'; // adjust to your guard path
@Controller('analytics')
// @UseGuards(AdminAuthGuard) // ✅ Only admins can see analytics
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
    try {
      return { data, success: true };
    } catch (error) {
      const message =
        error instanceof CustomError ? error.message : 'Internal server error';
      return { error: message, success: false };
    }
  }
  // Get leads count grouped by status (e.g., new, contacted, converted)
  @Get('leads/total')
  async getTotalLeads() {
    const total = await this.analytics.getTotalLeadsCount();
    return await this.buildResponse(total);
  }

  @UseGuards(JwtAuthGuard)
  @Get("today/unassigned-leads/count")
  async getTodayUnassignedLeadsCount(@Req() req){
    const dealerId = req.user.id;
    const totalLeads = await this.analytics.getTodayUnassignedLeadsCount(dealerId);
    return await this.buildResponse(totalLeads);
  }

  @UseGuards(JwtAuthGuard)
  @Get("dealer/revenue")
  async getRevneue(@Req() req){
    const dealerId = req.user.id;
    const totalRevenue = await this.analytics.getDealerTotalRevenue(dealerId);
    return await this.buildResponse(totalRevenue);
  }

  @UseGuards(JwtAuthGuard)
  @Get("dealer/conversation/rate")
  async getDealerConversionRate(@Req() req){
    const dealerId = req.user.id;
    const totalRevenue = await this.analytics.getDealerConversionRate(dealerId);
    return await this.buildResponse(totalRevenue);
  }

  @UseGuards(JwtAuthGuard)
  @Get("dealer/conversation/rate")

  async getDealerRemainingLeads(@Req() req){
    const dealerId = req.user.id;
    const totalRevenue = await this.analytics.getDealerConversionRate(dealerId);
    return await this.buildResponse(totalRevenue);
  }

  @UseGuards(JwtAuthGuard)
  @Get("dealer/credits")
  async getDealerCredits(@Req() req){
    const dealerId = req.user.id;
    const totalCredits = await this.analytics.getDealerTierCreditsByUser(dealerId);
    return await this.buildResponse(totalCredits);
  }

  @Get('leads/monthly')
  async getMonthlyLeads() {
    return await this.analytics.getMonthlyLeads();
  }

  // 📊 Leads grouped by day (within a date range)
  @Get('leads/date-range')
  async getLeadsByDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    if (!start || !end) {
      return {
        error: 'Please provide both start and end query params (YYYY-MM-DD)',
      };
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    const result = await this.analytics.getLeadsByDateRange(startDate, endDate);
    return this.buildResponse(result);
  }
}
