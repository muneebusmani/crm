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
    const templatePath = path.join(process.cwd(), 'src/templates/invoice-pdf.hbs');

    // Generate PDF
    const pdfBuffer: Buffer = await createPdf(templatePath, {
      format: 'A4',               // Page format
      templateData: invoiceData,  // Data passed to template
      // No need for executablePath; Puppeteer bundled Chromium is used automatically
    });

    return pdfBuffer;
  }
}
