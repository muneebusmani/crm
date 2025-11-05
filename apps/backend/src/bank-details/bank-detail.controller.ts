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
} from '@nestjs/common';
import { BankDetailService } from './bank-detail.service';
import type { ApiResponse, BankDetailsResponse, CreateBankDetailsDto, UpdateBankDetailsDto } from '@crm/types';
import { CustomError } from 'src/common/custom-error';
import { promises } from 'dns';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';



@Controller('bank-details')
export class BankDetailsController {

    private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
        try {
            return { data, success: true }
        } catch (error) {
            const message =
            error instanceof CustomError ? error.message : 'Internal server error'
            return { error: message, success: false }
        }
    }
  constructor(private readonly bankDetailsService: BankDetailService) {}

  // 🔹 Create bank detail for a user
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createBankDetailsDto: CreateBankDetailsDto, @Req() req) : Promise<ApiResponse<BankDetailsResponse>> {
    const dealerId = req.user.id; 
    const bankDeatils = await  this.bankDetailsService.create(createBankDetailsDto, dealerId);
    return this.buildResponse(bankDeatils);
  }

  // 🔹 Get all bank details for the authenticated dealer
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) : Promise<ApiResponse<BankDetailsResponse[]>> {
   const dealerId = req.user.id;
   const banks = await this.bankDetailsService.findByUserId(dealerId);
    return this.buildResponse(banks);
  }

  // 🔹 Get bank detail by id (with ownership check)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) : Promise<ApiResponse<BankDetailsResponse>> {
    const dealerId = req.user.id;
    const bankDetail = await this.bankDetailsService.findOne(id);
    
    // Ensure the bank detail belongs to the authenticated user
    if (bankDetail.user.id !== dealerId) {
      throw new CustomError('Unauthorized access to bank details');
    }
    
    return this.buildResponse(bankDetail);
  }

  // 🔹 Update bank detail (with ownership check)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBankDetailsDto: UpdateBankDetailsDto,
    @Req() req,
  ) {
    const dealerId = req.user.id;
    const existing = await this.bankDetailsService.findOne(id);
    
    // Ensure the bank detail belongs to the authenticated user
    if (existing.user.id !== dealerId) {
      throw new CustomError('Unauthorized access to bank details');
    }
    
    const updated = await this.bankDetailsService.update(id, updateBankDetailsDto);
    return this.buildResponse(updated);
  }

  // 🔹 Delete bank detail (with ownership check)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) : Promise<ApiResponse<BankDetailsResponse>> {
    const dealerId = req.user.id;
    const existing = await this.bankDetailsService.findOne(id);
    
    // Ensure the bank detail belongs to the authenticated user
    if (existing.user.id !== dealerId) {
      throw new CustomError('Unauthorized access to bank details');
    }
    
    const result = await this.bankDetailsService.remove(id);
    return this.buildResponse(result);
  }
}
