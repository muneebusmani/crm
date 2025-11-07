import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BusinessSettingService } from './business-setting.service';
import { type UpsertBusinessSettingDto, type ApiResponse } from '@crm/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { DealerGuard } from 'src/auth/guards/dealer.guard';

@Controller('business-setting')
export class BusinessSettingController {
  constructor(
    private readonly businessSettingService: BusinessSettingService,
  ) {}

  private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
    return {
      success: true,
      data,
    };
  }
  @UseGuards(JwtAuthGuard, DealerGuard)
  @Post()
  async upsertBusinessSetting(
    @Body() dto: UpsertBusinessSettingDto,
    @Req() req,
  ) {
    const delaerId = req.user.id;
    const result = await this.businessSettingService.upsertSetting(
      dto,
      delaerId,
    );
    return this.buildResponse(result);
  }
  @UseGuards(JwtAuthGuard, DealerGuard)
  @Get()
  async getBusinessSetting(@Req() req) {
    const delaerId = req.user.id;
    const result = await this.businessSettingService.getByDealerId(delaerId);
    return this.buildResponse(result);
  }
}
