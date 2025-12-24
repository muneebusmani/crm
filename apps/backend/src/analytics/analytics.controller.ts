// src/analytics/analytics.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CustomError } from 'src/common/custom-error';
import { type ApiResponse } from '@crm/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('analytics')
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

  // ========================================
  // DASHBOARD ENDPOINT (Main endpoint for dashboard)
  // ========================================
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@Req() req) {
    try {
      // console.log('🎯 Dashboard endpoint hit');
      // console.log('👤 User:', req.user);
      const userType = req.user.role; // 'admin' or 'dealer'
      // console.log('🔍 Logging Request', req);
      const dealerId = userType === 'dealer' ? req.user.id : undefined;
      // console.log('🔍 User type:', userType, 'Dealer ID:', dealerId);

      const stats = await this.analytics.getDashboardStats(dealerId);
      // console.log('✅ Dashboard stats retrieved:', Object.keys(stats));
      return this.buildResponse(stats);
    } catch (error) {
      console.error('❌ Dashboard endpoint error:', error);
      const message =
        error instanceof CustomError ? error.message : 'Internal server error';
      return { success: false, error: message };
    }
  }

  // ========================================
  // LEGACY ENDPOINTS (Keep for backward compatibility)
  // ========================================
  @Get('leads/total')
  async getTotalLeads() {
    const total = await this.analytics.getTotalLeadsCount();
    return await this.buildResponse(total);
  }

  @Get('leads/monthly')
  async getMonthlyLeads() {
    return await this.analytics.getMonthlyLeads();
  }

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
