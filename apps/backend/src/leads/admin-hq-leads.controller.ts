import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { UpdateHqLeadSettingsDto } from './dto/update-hq-lead-settings.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('admin/hq-leads')
export class AdminHqLeadsController {
  constructor(private readonly leadsService: LeadsService) {}

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

  @UseGuards(AdminGuard)
  @Post('assign/:leadId/to/:dealerId')
  async assignHqLead(
    @Param('leadId') leadId: number,
    @Param('dealerId') dealerId: number,
  ) {
    return await this.leadsService.assignHqLeadToDealer(leadId, dealerId);
  }

  @UseGuards(AdminGuard)
  @Post('reset-quota/:dealerId')
  async resetDealerQuota(@Param('dealerId') dealerId: number) {
    return await this.leadsService.resetDealerHqLeadQuota(dealerId);
  }
}
