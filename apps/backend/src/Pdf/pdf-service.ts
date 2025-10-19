import { Injectable } from '@nestjs/common';
import { createPdf } from '@saemhco/nestjs-html-pdf';
import * as path from 'path';

@Injectable()
export class PdfService {
  /**
   * Generate PDF buffer from invoice data
   * @param invoiceData - invoice, items, dealer, lead, bank info
   * @returns PDF buffer
   */
  async generateInvoicePdf(invoiceData: any): Promise<Buffer> {
    // Path to your Handlebars template
    console.log('🔍 PdfService.generateInvoicePdf - Received invoiceData:', JSON.stringify(invoiceData, null, 2));
    console.log('🔍 PdfService.generateInvoicePdf - Items count:', invoiceData?.items?.length);
    console.log('🔍 PdfService.generateInvoicePdf - First item:', JSON.stringify(invoiceData?.items?.[0], null, 2));
    console.log('🔍 PdfService.generateInvoicePdf - Bank details:', JSON.stringify(invoiceData?.bank, null, 2));
    console.log('🔍 PdfService.generateInvoicePdf - Dealer profile:', JSON.stringify(invoiceData?.dealer?.profile, null, 2));
    
    const templatePath = path.join(
      process.cwd(),
      process.env.NODE_ENV !== 'production'
        ? 'src/templates/invoice-pdf.hbs'
        : 'dist/templates/templates/invoice-pdf.hbs',
    );

    const templateDataToPass = { invoiceData };
    console.log('🔍 PdfService.generateInvoicePdf - Template data structure:', JSON.stringify(templateDataToPass, null, 2));

    // Generate PDF - Pass data as THIRD parameter, not inside options!
    const pdfBuffer: Buffer = await createPdf(
      templatePath,
      {
        format: 'A4', // Page format
        printBackground: true, // Print background graphics
        // No need for executablePath; Puppeteer bundled Chromium is used automatically
      },
      templateDataToPass, // ✅ Pass data as third parameter to match template {{invoiceData.xxx}}
    );

    return pdfBuffer;
  }
}
