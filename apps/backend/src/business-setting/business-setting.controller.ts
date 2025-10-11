import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BusinessSettingService } from './business-setting.service';
import {
   type CreateBusinessSettingDto,
  type UpdateBusinessSettingDto,
} from "@crm/types";

@Controller('business-settings')
export class BusinessSettingController {
  constructor(private readonly businessSettingService: BusinessSettingService) {}

  @Post()
  create(@Body() dto: CreateBusinessSettingDto) {
    return this.businessSettingService.create(dto);
  }

  @Get()
  findAll() {
    return this.businessSettingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessSettingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBusinessSettingDto) {
    return this.businessSettingService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessSettingService.remove(id);
  }
}
