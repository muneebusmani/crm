import type {
  ApiResponse,
  CreateAdminDto,
  UpdateAdminDto,
  User,
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
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CustomError } from 'src/common/custom-error';

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

  

  @Patch("/dealers/:id/device-limit")
  updateDeviceLimit(@Param("id") id: number, @Body() {limit} : {limit : number}){
    try{
      const deviceLimit = this.adminService.updateDeviceLimit(id, limit);
      return this.buildResponse(deviceLimit);
    }catch (error) {
      const message =
        error instanceof CustomError ? error.message : 'Internal server error';
      return { error: message, success: false };
    }
  }

  @Get()
  findAll() {
    return this.adminService.getAllAdmins();
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
  async dealerStatus(@Param('id') id: number) {
    const user = this.adminService.DealerStatus(id);
    return this.buildResponse(user);
  }

  @Patch('dealer/:id/suspend')
  async suspendDealer(@Param('id') id: number): Promise<ApiResponse<User>> {
    const user = await this.adminService.suspendDealer(id);
    return this.buildResponse(user);
  }

}
