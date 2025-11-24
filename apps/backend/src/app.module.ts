import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZodValidationPipe } from 'nestjs-zod';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { LeadMessageModule } from './leads-messages/lead-message.module';
import { AdminModule } from './user/admin/admin.module';
import { DealerModule } from './user/dealer/dealer.module';
import { InvoiceModule } from './invoices/invocie.module';
import { QuotationModule } from './quotations/quotation.module';
import { BankDeatil } from './bank-details/bank-detail.module';
import { SeederModule } from './seeder/seeder.module';
import { DealerTierModule } from './dealer-tier/dealer-tier.module';
import { MessagesModule } from './dealer-chat/messages.module';
import { BusinessSettingModule } from './business-setting/business-setting.module';
import { CompanyUserModule } from './company-user/company-user.module';
import { UploadsModule } from './uploads/uploads.module';
import { HqLeadResetModule } from './hq-lead-reset/hq-lead-reset.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      isGlobal: true,
    }),
    HqLeadResetModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        // synchronize: configService.get<string>('NODE_ENV') !== 'production',
        synchronize: false,
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        // logging: configService.get('NODE_ENV') === 'development',
        logging: false,
      }),
      inject: [ConfigService],
    }),
    LeadsModule,
    AuthModule,
    AdminModule,
    DealerModule,
    MessagesModule,
    ActivityLogModule,
    CompanyUserModule,
    LeadMessageModule,
    BusinessSettingModule,
    DealerTierModule,
    SeederModule,
    AnalyticsModule,
    InvoiceModule,
    QuotationModule,
    BankDeatil,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
