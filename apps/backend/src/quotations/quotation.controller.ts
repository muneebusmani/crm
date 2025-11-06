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
import { QuotationService } from './quotation.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import type {
  ApiResponse,
  CreateQuotationDto,
  QuotationResponse,
  QuotationStatus,
} from '@crm/types';
import { CustomError } from 'src/common/custom-error';
import type { AuthenticatedRequest } from 'src/common/user.interface';

@Controller('quotations')
@UseGuards(JwtAuthGuard)
export class QuotationController {
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

  @Post()
  async create(
    @Body() createQuotationDto: CreateQuotationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<QuotationResponse>> {
    const dealerId = req.user.id; // Extracted from JWT token
    const companyUserId = createQuotationDto.companyUserId; // Get from request body
    const quotation = (await this.quotationService.create(
      createQuotationDto,
      dealerId,
      companyUserId,
    )) as unknown as QuotationResponse;
    return this.buildResponse(quotation);
  }

  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponse<QuotationResponse[]>> {
    const dealerId = req.user.id;
    const quotations = await this.quotationService.findAll(dealerId);

    const data: QuotationResponse[] = (await quotations).map((quotation) => ({
      id: quotation.id,
      quotationNumber: quotation.quotationNumber,
      lead: quotation.lead, // ✅ careful with relation naming
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
      companyUser: quotation.companyUser, // ✅ added company user info
    }));
    return this.buildResponse(data);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<ApiResponse<QuotationResponse>> {
    const dealerId = req.user.dealerId;
    const quotation = await this.quotationService.findOne(id, dealerId);
    return this.buildResponse(quotation);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: QuotationStatus },
    @Req() req: any,
  ): Promise<ApiResponse<QuotationResponse>> {
    const dealerId = req.user.dealerId;
    const quotation = await this.quotationService.updateStatus(
      id,
      body.status,
      dealerId,
    );
    return this.buildResponse(quotation);
  }

  @Post('preview')
  async generatePreview(
    @Body() createQuotationDto: CreateQuotationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<string> {
    const dealerId = req.user.id;
    const html = await this.quotationService.generatePreview(
      createQuotationDto,
      dealerId,
    );
    return html;
  }

  @Post('download-pdf')
  async downloadPdf(
    @Body() createQuotationDto: CreateQuotationDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const dealerId = req.user.id;
    console.log('🔍 Controller.downloadPdf - Received DTO:', JSON.stringify(createQuotationDto, null, 2));
    console.log('🔍 Controller.downloadPdf - DealerId:', dealerId);
    const pdfBuffer = await this.quotationService.generatePdf(
      createQuotationDto,
      dealerId,
    );

    // Set headers for PDF download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="quotation-${Date.now()}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }
}
