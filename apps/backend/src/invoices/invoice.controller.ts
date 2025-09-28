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
import type {
  ApiResponse,
  CreateInvoiceDto,
  InvoiceResponse,
  InvoiceStatus,
} from '@crm/types';
import { CustomError } from 'src/common/custom-error';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

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
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @Req() req,
  ): Promise<ApiResponse<InvoiceResponse>> {
    const dealerId = req.user.dealerId; // Extracted from JWT token
    const invoice = await this.invoiceService.create(
      createInvoiceDto,
      dealerId,
    );
    return this.buildResponse(invoice);
  }

  @Get()
  async findAll(@Req() req: any): Promise<ApiResponse<InvoiceResponse[]>> {
    const dealerId = req.user.dealerId;
    const invoices = await this.invoiceService.findAll(dealerId);

    const data: InvoiceResponse[] = (await invoices).map((invoice) => ({
      id: invoice.id,
      lead: invoice.lead, // ✅ careful with relation naming
      date: invoice.date,
      items: invoice.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        productDetails: item.productDetails,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: item.unitPrice * item.quantity,
      })),
      taxAmount: invoice.taxAmount,
      subTotal: invoice.subTotal,
      grandTotal: invoice.totalAmount,
      status: invoice.status,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    }));
    return this.buildResponse(data);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<ApiResponse<InvoiceResponse>> {
    const dealerId = req.user.dealerId;
    const invoice = await this.invoiceService.findOne(id, dealerId);
    return this.buildResponse(invoice);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: InvoiceStatus },
    @Req() req: any,
  ): Promise<ApiResponse<InvoiceResponse>> {
    const dealerId = req.user.dealerId;
    const invoice = await this.invoiceService.updateStatus(
      id,
      body.status,
      dealerId,
    );
    return this.buildResponse(invoice);
  }
}
