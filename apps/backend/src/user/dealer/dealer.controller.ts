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
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DealerService } from './dealer.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { CustomError } from 'src/common/custom-error';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { DealerGuard } from 'src/auth/guards/dealer.guard';
import { Lead } from 'src/leads/entities/lead.entity';
import type { Multer } from 'multer';


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
   @UseInterceptors(FileInterceptor('logoFile'))
  async create(
    @Body() dto: Omit<CreateDealerDto, 'logo'>, // exclude logo string
    @UploadedFile() file: Multer.File, // ✅ Multer file type
  ) {
    return this.dealerService.createDealer(dto, file);
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
  @UseInterceptors(FileInterceptor('logoFile'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDealerDto,
    @UploadedFile() file?: Multer.File,
  ) {
    return this.dealerService.updateDealer(id, dto, file);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dealerService.deleteDealer(id);
  }

  @UseGuards(JwtAuthGuard, DealerGuard)
  @Post("quotations")
  @UsePipes(new ZodValidationPipe(CreateQuotationSchema))
  async createQuotation(@Body() dto: CreateQuotationDto, @Req() req): Promise<ApiResponse<Quotation>> {
    dto.dealerId = req.user.id;  // cast to 'any' if TS complains
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
