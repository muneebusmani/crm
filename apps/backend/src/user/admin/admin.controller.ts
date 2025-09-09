import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
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
}
