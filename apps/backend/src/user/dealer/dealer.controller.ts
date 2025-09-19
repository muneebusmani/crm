import { type CreateDealerDto, type UpdateDealerDto, type CreateQuotationDto, CreateQuotationSchema, ApiResponse, Quotation, User } from '@crm/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes
} from '@nestjs/common';
import { DealerService } from './dealer.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { CustomError } from 'src/common/custom-error';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { DealerGuard } from 'src/auth/guards/dealer.guard';
import { Lead } from 'src/leads/entities/lead.entity';


@Controller('dealers')
export class DealerController {
  constructor(private readonly dealerService: DealerService) { }
  private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
    try {
      return { success: true, data };
    } catch (error) {
      const message =
        error instanceof CustomError
          ? error.message
          : 'Internal server error';
      return { success: false, error: message };
    }
  }
  @Post()
  create(@Body() dto: CreateDealerDto) {
    return this.dealerService.createDealer(dto);
  }

  @Get()
  findAll() {
    return this.dealerService.getAllDealers();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dealerService.getDealerById(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDealerDto) {
    return this.dealerService.updateDealer(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dealerService.deleteDealer(id);
  }

  @Post("quotations")
  @UsePipes(new ZodValidationPipe(CreateQuotationSchema))
  async createQuotation(@Body() dto: CreateQuotationDto): Promise<ApiResponse<Quotation>> {
    const result = await this.dealerService.createQuotation(dto)
    return this.buildResponse(result);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string): Promise<ApiResponse<User>> {
    const result =  await this.dealerService.forgotPassword(email);
    return this.buildResponse(result);
  }

  @UseGuards(JwtAuthGuard, DealerGuard)
  @Get('/leads/:id')
  async findLeadById(@Param('id') id: number,  @Req() req): Promise<ApiResponse<Lead>> {
    const dealerId = req.user.id; // dealer is the logged-in user
    const result = await this.dealerService.getLeadById(id, dealerId);
    return this.buildResponse(result)
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string,@Body('newPassword') newPassword: string) 
  : Promise<ApiResponse<User>>   {
     const result = await this.dealerService.resetPassword(token, newPassword);
      return this.buildResponse(result);
  }


}
