import { type ApiResponse, type InvoiceResponse } from '@crm/types';
import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { CustomError } from 'src/common/custom-error';
import { InvoiceService } from './invoice.service';

@Controller('admin/invoices')
@UseGuards(AdminGuard)
export class AdminInvoicesController {
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

  @Get()
  async findAll(): Promise<ApiResponse<InvoiceResponse[]>> {
    const invoices = await this.invoiceService.findAllForAdmin();

    const data: InvoiceResponse[] = invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      lead: invoice.lead,
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
      companyUser: invoice.companyUser,
      dealer: invoice.dealer,
    }));

    return this.buildResponse(data);
  }

  @Get(':id/preview')
  async preview(@Param('id') id: string): Promise<string> {
    return this.invoiceService.generatePreviewForAdmin(id);
  }

  @Post(':id/download-pdf')
  async downloadPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const pdfBuffer = await this.invoiceService.generatePdfForAdmin(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${Date.now()}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }
}
