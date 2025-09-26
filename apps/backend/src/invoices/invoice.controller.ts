import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import type { CreateInvoiceDto } from '@crm/types';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Req() req) {
    try {
      const dealerId = req.user.dealerId; // Extracted from JWT token
      const invoice = await this.invoiceService.create(
        createInvoiceDto,
        dealerId,
      );

      return {
        success: true,
        message: 'Invoice created successfully',
        data: invoice,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create invoice',
        error: error.name,
        statusCode: error.status || 500,
        timestamp: new Date(),
      };
    }
  }

  @Get()
  async findAll(@Req() req: any): Promise<ApiResponse<InvoiceResponseDto[]>> {
    try {
      const dealerId = req.user.dealerId;
      const invoices = await this.invoiceService.findAll(dealerId);

      return {
        success: true,
        message: 'Invoices retrieved successfully',
        data: invoices,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve invoices',
        error: error.name,
        statusCode: error.status || 500,
        timestamp: new Date(),
      };
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<ApiResponse<InvoiceResponseDto>> {
    try {
      const dealerId = req.user.dealerId;
      const invoice = await this.invoiceService.findOne(id, dealerId);

      return {
        success: true,
        message: 'Invoice retrieved successfully',
        data: invoice,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve invoice',
        error: error.name,
        statusCode: error.status || 404,
        timestamp: new Date(),
      };
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Req() req: any,
  ): Promise<ApiResponse<InvoiceResponseDto>> {
    try {
      const dealerId = req.user.dealerId;
      const invoice = await this.invoiceService.updateStatus(
        id,
        body.status,
        dealerId,
      );

      return {
        success: true,
        message: 'Invoice status updated successfully',
        data: invoice,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update invoice status',
        error: error.name,
        statusCode: error.status || 500,
        timestamp: new Date(),
      };
    }
  }
}
