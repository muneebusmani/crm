import { Module } from '@nestjs/common';
import { LeadsModule } from 'src/leads/leads.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from 'src/leads/entities/lead.entity';
import { Quotation } from 'src/quotations/entities/quotation.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { User } from 'src/user/entities/user.entity';
import { DealerLead } from 'src/user/entities/dealer-lead.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, Quotation, Invoice, User, DealerLead]),
    LeadsModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
