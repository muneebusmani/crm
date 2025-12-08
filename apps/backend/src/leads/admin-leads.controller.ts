import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { LeadsService } from './leads.service';
import type { ApiResponse, Lead } from '@crm/types';
import { CustomError } from 'src/common/custom-error';

@Controller('admin/leads')
export class AdminLeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
    try {
      return { data, success: true };
    } catch (error) {
      const message =
        error instanceof CustomError ? error.message : 'Internal server error';
      return { error: message, success: false };
    }
  }

  // Get all leads for admin (not filtered by dealer)
  @UseGuards(AdminGuard)
  @Get()
  async getAllLeads(): Promise<ApiResponse<Lead[]>> {
    const result = await this.leadsService.getAllLeadsForAdmin();
    return this.buildResponse(result);
  }
}
