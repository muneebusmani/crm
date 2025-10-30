import { Injectable } from '@nestjs/common';
import { createPdf } from '@saemhco/nestjs-html-pdf';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PdfService {
  /**
   * Generate PDF buffer from invoice data
   * @param invoiceData - invoice, items, dealer, lead, bank info
   * @returns PDF buffer
   */
  async generateInvoicePdf(invoiceData: any): Promise<Buffer> {
    try {
      console.log('🔍 PdfService.generateInvoicePdf - process.cwd():', process.cwd());
      console.log('🔍 PdfService.generateInvoicePdf - NODE_ENV:', process.env.NODE_ENV);

      const templatePath = path.join(
        process.cwd(),
        process.env.NODE_ENV !== 'production'
          ? 'src/templates/invoice-pdf.hbs'
          : 'dist/templates/templates/invoice-pdf.hbs',
      );

      console.log('🔍 PdfService.generateInvoicePdf - templatePath:', templatePath);
      console.log('🔍 PdfService.generateInvoicePdf - template exists:', fs.existsSync(templatePath));

      const templateDataToPass = { invoiceData };

      const pdfBuffer: Buffer = await createPdf(
        templatePath,
        {
          format: 'A4', // Page format
          printBackground: true, // Print background graphics
        },
        templateDataToPass,
      );

      console.log('🔍 PdfService.generateInvoicePdf - generated PDF size:', pdfBuffer?.length);
      return pdfBuffer;
    } catch (err:any) {
      console.error('❌ PdfService.generateInvoicePdf - ERROR:', err && err.message);
      console.error('❌ PdfService.generateInvoicePdf - stack:', err && err.stack);
      throw err;
    }
  }

  /**
   * Generate PDF buffer from quotation data
   * @param quotationData - quotation, items, dealer, lead, bank info
   * @returns PDF buffer
   */
  async generateQuotationPdf(quotationData: any): Promise<Buffer> {
    // Path to your Handlebars template
    console.log('🔍 PdfService.generateQuotationPdf - Received quotationData:', JSON.stringify(quotationData, null, 2));
    console.log('🔍 PdfService.generateQuotationPdf - Items count:', quotationData?.items?.length);
    console.log('🔍 PdfService.generateQuotationPdf - First item:', JSON.stringify(quotationData?.items?.[0], null, 2));
    console.log('🔍 PdfService.generateQuotationPdf - Bank details:', JSON.stringify(quotationData?.bank, null, 2));
    console.log('🔍 PdfService.generateQuotationPdf - Dealer profile:', JSON.stringify(quotationData?.dealer?.profile, null, 2));
    
    const templatePath = path.join(
      process.cwd(),
      process.env.NODE_ENV !== 'production'
        ? 'src/templates/quotation-pdf.hbs'
        : 'dist/templates/templates/quotation-pdf.hbs',
    );

    const templateDataToPass = { quotationData };
    console.log('🔍 PdfService.generateQuotationPdf - Template data structure:', JSON.stringify(templateDataToPass, null, 2));

    // Generate PDF - Pass data as THIRD parameter, not inside options!
    const pdfBuffer: Buffer = await createPdf(
      templatePath,
      {
        format: 'A4', // Page format
        printBackground: true, // Print background graphics
        // No need for executablePath; Puppeteer bundled Chromium is used automatically
      },
      templateDataToPass, // ✅ Pass data as third parameter to match template {{quotationData.xxx}}
    );

    return pdfBuffer;
  }
}
