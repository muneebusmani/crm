import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CompanyUserService } from './company-user.service';
import { CreateCompanyUserSchema, UpdateCompanyUserSchema } from '@crm/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('company-users')
export class CompanyUserController {
  constructor(private readonly companyUserService: CompanyUserService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: unknown, @Req() req) {
    const dto = CreateCompanyUserSchema.parse(body);
    return await this.companyUserService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    // Return only profiles for the authenticated dealer
    return this.companyUserService.findByDealerId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('select/:id')
  async selectProfile(
    @Param('id', ParseIntPipe) profileId: number,
    @Req() req,
  ) {
    // Verify profile belongs to dealer and return profile data
    const dealer = await this.companyUserService.findByDealerId(req.user.id);
    const profile = dealer.find((p) => p.id === profileId);

    if (!profile) {
      throw new Error('Profile not found or does not belong to this dealer');
    }

    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    const dto = UpdateCompanyUserSchema.parse(body);
    return await this.companyUserService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.companyUserService.remove(id);
    return { message: 'Deleted successfully' };
  }
}
