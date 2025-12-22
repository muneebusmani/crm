import type {
  ApiResponse,
  CreateAdminDto,
  UpdateAdminDto,
  UpdateDealerStatusDto,
} from '@crm/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CustomError } from 'src/common/custom-error';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
    try {
      return { data, success: true };
    } catch (error) {
      const message =
        error instanceof CustomError ? error.message : 'Internal server error';
      return { error: message, success: false };
    }
  }

  @Post()
  create(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  @Get()
  findAll() {
    return this.adminService.getAllAdmins();
  }

  @Get('dealers-status')
  @UseGuards(AdminGuard)
  async getDealersWithQuota() {
    const statuses = await this.adminService.getDealersWithQuota();
    return this.buildResponse(statuses);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getAdminById(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminDto) {
    return this.adminService.updateAdmin(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteAdmin(id);
  }

  @Patch('dealer/:id/status')
  async updateDealerStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDealerStatusDto,
  ) {
    const user = this.adminService.updateDealerStatus(id, dto.status);
    return this.buildResponse(user);
  }

  /**
   * Update device limit for a dealer.
   * @param id - Dealer user ID
   * @param limit - Number of allowed devices (null = unlimited)
   */
  @Patch('dealer/:id/device-limit')
  @UseGuards(AdminGuard)
  async updateDeviceLimit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { limit: number | null },
  ) {
    const result = await this.adminService.updateDeviceLimit(id, dto.limit);
    return this.buildResponse(result);
  }

  /**
   * Get all devices for a dealer.
   */
  @Get('dealer/:id/devices')
  @UseGuards(AdminGuard)
  async getDealerDevices(@Param('id', ParseIntPipe) id: number) {
    const devices = await this.adminService.getDealerDevices(id);
    return this.buildResponse(devices);
  }

  /**
   * Deactivate a specific device for a dealer.
   */
  @Delete('dealer/:dealerId/devices/:deviceId')
  @UseGuards(AdminGuard)
  async deactivateDevice(
    @Param('dealerId', ParseIntPipe) dealerId: number,
    @Param('deviceId', ParseIntPipe) deviceId: number,
  ) {
    await this.adminService.deactivateDevice(dealerId, deviceId);
    return this.buildResponse({ message: 'Device deactivated successfully' });
  }
}
