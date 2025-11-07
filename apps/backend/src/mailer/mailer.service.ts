import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailer: NestMailerService) {}

  async sendQuotationEmail(to: string, context: any) {
    await this.mailer.sendMail({
      to,
      // subject: `New Quotation: ${context.subject}`,
      // template: 'quotation', // file name in templates folder
      context, // variables to replace in template
    });
  }
}
