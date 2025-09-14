import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailerService } from './mailer.service';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: "alamhamza873@gmail.com",
          pass: "airv cmet gvpr lwjt",
        },
      },
      defaults: {
        from: '"CRM Quotation System" <no-reply@crm.com>',
      },
      template: {
        dir: join(process.cwd(), 'src/templates'), // 👈 remove 'apps/backend' from path
        adapter: new HandlebarsAdapter(), // use Handlebars
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class CustomMailerModule {}



  path: 'C:\\Users\\Hamza Alam\\Documents\\crm\\crm\\apps\\backend\\dist\\mailer\\src\\templates\\quotation.hbs'