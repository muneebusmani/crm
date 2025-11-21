import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import type {
  ApiResponse,
  CreateInvoiceDto,
  InvoiceResponse,
  InvoiceStatus,
} from '@crm/types';
import { CustomError } from 'src/common/custom-error';
import type { AuthenticatedRequest } from 'src/common/user.interface';

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
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<InvoiceResponse>> {
    const dealerId = req.user.id;
    const companyUserId = createInvoiceDto.companyUserId; // Get from request body
    const invoice = (await this.invoiceService.create(
      createInvoiceDto,
      dealerId,
      companyUserId,
    )) as unknown as InvoiceResponse;
    return this.buildResponse(invoice);
  }

  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<InvoiceResponse[]>> {
    const dealerId = req.user.id;
    const invoices = await this.invoiceService.findAll(dealerId);

    const data: InvoiceResponse[] = (await invoices).map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      lead: invoice.lead, // ✅ careful with relation naming
      date: invoice.date,
      items: invoice.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        productDetails: item.productDetails,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        discount: item.discount,
        taxAmount: item.taxAmount,
        totalPrice: item.totalPrice,
        subTotal: item.subTotal,
      })),
      taxAmount: invoice.taxAmount,
      subTotal: invoice.subTotal,
      grandTotal: invoice.grandTotal,
      sellerNote: invoice.sellerNote,
      status: invoice.status,
      createdAt: invoice.createdAt,
      companyUser: invoice.companyUser, // ✅ added company user info
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

  @Post('preview')
  async generatePreview(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<string> {
    const dealerId = req.user.id;
    const html = await this.invoiceService.generatePreview(
      createInvoiceDto,
      dealerId,
    );
    return html;
  }

  @Post('download-pdf')
  async downloadPdf(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    try {
      // Get the actual dealer ID from the user's dealer relationship
      const dealerId = req.user.dealer?.id || req.user.id;
      console.log(
        '🔍 Controller.downloadPdf - Received DTO:',
        JSON.stringify(createInvoiceDto, null, 2),
      );
      console.log('🔍 Controller.downloadPdf - DealerId:', dealerId);

      const pdfBuffer = await this.invoiceService.generatePdf(
        createInvoiceDto,
        dealerId,
      );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      return new StreamableFile(pdfBuffer);
    } catch (error: any) {
      // Very explicit logging
      console.error(
        '❌ Controller.downloadPdf - ERROR message:',
        (error && error?.message) || error,
      );
      console.error(
        '❌ Controller.downloadPdf - ERROR stack:',
        (error && error?.stack) || 'no stack',
      );
      // Optionally send more info in body for local debugging only
      throw error; // Nest will return 500; but logs will show stack
    }
  }
}
