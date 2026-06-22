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
  Req,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CustomError } from 'src/common/custom-error';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import type { Request } from 'express';

@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

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

  @Post('dealer/:id/impersonate')
  @UseGuards(AdminGuard)
  async impersonateDealer(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: { id: number } },
  ) {
    const session = await this.adminService.impersonateDealer(req.user.id, id);
    return this.buildResponse(session);
  }

  @Get('dealer/:id/presence')
  @UseGuards(AdminGuard)
  async getDealerPresence(@Param('id', ParseIntPipe) id: number) {
    const presence = this.adminService.isDealerConnected(id);
    return this.buildResponse(presence);
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
   * Deactivate (revoke) a specific device for a dealer.
   * Device record is preserved but user is logged out.
   */
  @Patch('dealer/:dealerId/devices/:deviceId/revoke')
  @UseGuards(AdminGuard)
  async revokeDevice(
    @Param('dealerId', ParseIntPipe) dealerId: number,
    @Param('deviceId', ParseIntPipe) deviceId: number,
  ) {
    await this.adminService.deactivateDevice(dealerId, deviceId);
    return this.buildResponse({ message: 'Device revoked successfully' });
  }

  /**
   * Reactivate a previously revoked device.
   */
  @Patch('dealer/:dealerId/devices/:deviceId/reactivate')
  @UseGuards(AdminGuard)
  async reactivateDevice(
    @Param('dealerId', ParseIntPipe) dealerId: number,
    @Param('deviceId', ParseIntPipe) deviceId: number,
  ) {
    await this.adminService.reactivateDevice(dealerId, deviceId);
    return this.buildResponse({ message: 'Device reactivated successfully' });
  }

  /**
   * Permanently remove a device (frees up device slot).
   */
  @Delete('dealer/:dealerId/devices/:deviceId')
  @UseGuards(AdminGuard)
  async removeDevice(
    @Param('dealerId', ParseIntPipe) dealerId: number,
    @Param('deviceId', ParseIntPipe) deviceId: number,
  ) {
    await this.adminService.removeDevice(dealerId, deviceId);
    return this.buildResponse({ message: 'Device removed successfully' });
  }

  /**
   * Revoke all devices for a dealer (logs out everywhere).
   */
  @Patch('dealer/:dealerId/devices/revoke-all')
  @UseGuards(AdminGuard)
  async revokeAllDevices(@Param('dealerId', ParseIntPipe) dealerId: number) {
    await this.adminService.deactivateAllDevices(dealerId);
    return this.buildResponse({ message: 'All devices revoked successfully' });
  }
}
