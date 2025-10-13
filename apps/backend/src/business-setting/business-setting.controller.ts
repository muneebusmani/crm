import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { BusinessSettingService } from './business-setting.service';
import { type UpsertBusinessSettingDto } from '@crm/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { DealerGuard } from 'src/auth/guards/dealer.guard';

@Controller('business-setting')
export class BusinessSettingController {
  constructor(private readonly businessSettingService: BusinessSettingService) {}
  @UseGuards(JwtAuthGuard, DealerGuard)
  @Post()
  async upsertBusinessSetting(@Body() dto: UpsertBusinessSettingDto, @Req() req) {
     const delaerId = req.user.id; 
    return await this.businessSettingService.upsertSetting(dto,delaerId);
  }
  @UseGuards(JwtAuthGuard, DealerGuard)
  @Get()
  async getBusinessSetting(@Req() req) {
    const delaerId = req.user.id;
    return await this.businessSettingService.getByDealerId(delaerId);
  }
}
