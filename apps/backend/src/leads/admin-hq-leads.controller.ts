import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { UpdateHqLeadSettingsDto } from './dto/update-hq-lead-settings.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('admin/hq-leads')
export class AdminHqLeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // === Package Tier Settings (Legacy) ===
  @UseGuards(AdminGuard)
  @Get('settings')
  async getHqLeadSettings() {
    return await this.leadsService.getAllHqLeadSettings();
  }

  @UseGuards(AdminGuard)
  @Post('settings')
  async createHqLeadSettings(
    @Body() createHqLeadSettingsDto: UpdateHqLeadSettingsDto,
  ) {
    return await this.leadsService.createHqLeadSetting(createHqLeadSettingsDto);
  }

  @UseGuards(AdminGuard)
  @Put('settings/:packageTier')
  async updateHqLeadSettings(
    @Param('packageTier') packageTier: string,
    @Body() updateHqLeadSettingsDto: UpdateHqLeadSettingsDto,
  ) {
    return await this.leadsService.updateHqLeadSetting(
      packageTier,
      updateHqLeadSettingsDto,
    );
  }

  // === Per-Dealer HQ Lead Limits (New Simple System) ===
  
  // Get all dealers with their HQ lead limits and today's usage
  @UseGuards(AdminGuard)
  @Get('dealers')
  async getAllDealersHqStatus() {
    return await this.leadsService.getAllDealersHqLeadStatus();
  }

  // Update a specific dealer's daily HQ lead limit
  // dailyLimit: -1 = unlimited, 0 = no HQ leads, positive integer = specific limit
  @UseGuards(AdminGuard)
  @Put('dealers/:dealerId/limit')
  async updateDealerHqLimit(
    @Param('dealerId', ParseIntPipe) dealerId: number,
    @Body('dailyLimit') dailyLimit: number,
  ) {
    return await this.leadsService.updateDealerHqLeadLimit(dealerId, dailyLimit);
  }

  // Check a dealer's current HQ lead quota status
  @UseGuards(AdminGuard)
  @Get('dealers/:dealerId/quota')
  async getDealerQuotaStatus(@Param('dealerId', ParseIntPipe) dealerId: number) {
    return await this.leadsService.checkHqLeadQuota(dealerId);
  }

  // === Assignment & Reset ===
  @UseGuards(AdminGuard)
  @Post('assign/:leadId/to/:dealerId')
  async assignHqLead(
    @Param('leadId', ParseIntPipe) leadId: number,
    @Param('dealerId', ParseIntPipe) dealerId: number,
  ) {
    return await this.leadsService.assignHqLeadToDealer(leadId, dealerId);
  }

  @UseGuards(AdminGuard)
  @Post('reset-quota/:dealerId')
  async resetDealerQuota(@Param('dealerId', ParseIntPipe) dealerId: number) {
    return await this.leadsService.resetDealerHqLeadQuota(dealerId);
  }
}
