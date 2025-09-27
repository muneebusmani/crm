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

  // 🔹 Get all bank details
  @Get()
  async findAll() : Promise<ApiResponse<BankDetailsResponse[]>> {
   const banks =  await this.bankDetailsService.findAll();
    return this.buildResponse(banks);
  }

  // 🔹 Get bank detail by id
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) : Promise<ApiResponse<BankDetailsResponse>> {
    const banks = await this.bankDetailsService.findOne(id);
    return this.buildResponse(banks);
  }

  // 🔹 Update bank detail
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBankDetailsDto: UpdateBankDetailsDto,
  ) {
    const updated = this.bankDetailsService.update(id, updateBankDetailsDto);
    return this.buildResponse(updated);
  }

  // 🔹 Delete bank detail
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) : Promise<ApiResponse<BankDetailsResponse>> {
    const result = await this.bankDetailsService.remove(id);
    return  this.buildResponse(result);
  }
}
