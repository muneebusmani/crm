import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule, // 👈 make sure ConfigModule is imported
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: configService.get<boolean>('MAIL_SECURE'), // true for 465, false for other ports
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: '"Enginefinders" <sales@enginefinders.co.uk>',
        },
        template: {
          dir:
            process.env.NODE_ENV !== 'production'
              ? join(process.cwd(), 'src/templates')
              : join(process.cwd(), 'dist/templates/templates'), // ✅ path for templates
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class CustomMailerModule {}
