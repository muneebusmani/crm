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
import {
  CreateCompanyUserSchema,
  UpdateCompanyUserSchema,
} from  '@crm/types';
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

  @Get()
  async findAll() {
    return this.companyUserService.findAll();
  }

//   @Get(':id')
//   async findOne(@Param('id', ParseIntPipe) id: number) {
//     return this.companyUserService.findOne(id);
//   }
    @UseGuards(JwtAuthGuard)
    @Get('dealers')
    async findByDealer(
        @Req() req,
    ) {
        const dealerId = req.user.id; // ✅ Convert string → number
        return await this.companyUserService.findByDealerId(dealerId);
    }
    
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
