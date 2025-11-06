import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PdfService {
  /**
   * Generate PDF using Puppeteer directly
   */
  private async generatePdfFromTemplate(
    templatePath: string,
    data: any,
    pdfOptions: any = {},
  ): Promise<Buffer> {
    let browser;
    
    try {
      // Configure Puppeteer launch options
      // const launchOptions: any = {
      //   headless: true,
      // };
      
      // In production (Docker), use system Chromium with required flags
      // if (process.env.NODE_ENV === 'production') {
      //   launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser';
      //   launchOptions.args = [
      //     '--no-sandbox',
      //     '--disable-setuid-sandbox',
      //     '--disable-dev-shm-usage',
      //     '--disable-gpu',
      //   ];
      //   console.log('🚀 Using system Chromium:', launchOptions.executablePath);
      // }
      
      console.log('🚀 Launching Puppeteer...');
      // browser = await puppeteer.launch(launchOptions);
      browser = await puppeteer.launch();
      
      const page = await browser.newPage();

      // Register Handlebars helpers
      handlebars.registerHelper('ifCond', function (this: any, v1: any, operator: string, v2: any, options: any) {
        switch (operator) {
          case '==': return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===': return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '!=': return (v1 != v2) ? options.fn(this) : options.inverse(this);
          case '!==': return (v1 !== v2) ? options.fn(this) : options.inverse(this);
          case '<': return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=': return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>': return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=': return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&': return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||': return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default: return options.inverse(this);
        }
      });

      handlebars.registerHelper({
        eq: (v1, v2) => v1 === v2,
        ne: (v1, v2) => v1 !== v2,
        lt: (v1, v2) => v1 < v2,
        gt: (v1, v2) => v1 > v2,
        lte: (v1, v2) => v1 <= v2,
        gte: (v1, v2) => v1 >= v2,
        and: function () { return Array.prototype.every.call(arguments, Boolean); },
        or: function () { return Array.prototype.slice.call(arguments, 0, -1).some(Boolean); }
      });

      // Read and compile template
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      const html = template(data);

      // Set HTML content
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const defaultPdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          left: '10mm',
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
        },
      };

      const pdfBuffer = await page.pdf({ ...defaultPdfOptions, ...pdfOptions });

      await browser.close();
      console.log('✅ PDF generated successfully, size:', pdfBuffer.length);
      
      return pdfBuffer;
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      console.error('❌ PDF generation error:', error);
      throw error;
    }
  }

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

      const pdfBuffer: Buffer = await this.generatePdfFromTemplate(
        templatePath,
        templateDataToPass,
        { format: 'A4', printBackground: true },
      );

      console.log('🔍 PdfService.generateInvoicePdf - generated PDF size:', pdfBuffer?.length);
      return pdfBuffer;
    } catch (err: any) {
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
    try {
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

      const pdfBuffer: Buffer = await this.generatePdfFromTemplate(
        templatePath,
        templateDataToPass,
        { format: 'A4', printBackground: true },
      );

      return pdfBuffer;
    } catch (err: any) {
      console.error('❌ PdfService.generateQuotationPdf - ERROR:', err && err.message);
      console.error('❌ PdfService.generateQuotationPdf - stack:', err && err.stack);
      throw err;
    }
  }
}
