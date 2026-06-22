import { type ApiResponse, type QuotationResponse } from '@crm/types';
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
import { QuotationService } from './quotation.service';

@Controller('admin/quotations')
@UseGuards(AdminGuard)
export class AdminQuotationsController {
  constructor(private readonly quotationService: QuotationService) {}

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
  async findAll(): Promise<ApiResponse<QuotationResponse[]>> {
    const quotations = await this.quotationService.findAllForAdmin();

    const data: QuotationResponse[] = quotations.map((quotation) => ({
      id: quotation.id,
      quotationNumber: quotation.quotationNumber,
      lead: quotation.lead,
      date: quotation.date,
      items: quotation.items.map((item) => ({
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
      taxAmount: quotation.taxAmount,
      subTotal: quotation.subTotal,
      grandTotal: quotation.grandTotal,
      sellerNote: quotation.sellerNote,
      status: quotation.status,
      createdAt: quotation.createdAt,
      companyUser: quotation.companyUser,
      dealer: quotation.dealer,
    }));

    return this.buildResponse(data);
  }

  @Get(':id/preview')
  async preview(@Param('id') id: string): Promise<string> {
    return this.quotationService.generatePreviewForAdmin(id);
  }

  @Post(':id/download-pdf')
  async downloadPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const pdfBuffer = await this.quotationService.generatePdfForAdmin(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="quotation-${Date.now()}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }
}
