import { Module } from '@nestjs/common';
import { LeadsModule } from 'src/leads/leads.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from 'src/leads/entities/lead.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { DealerLead } from 'src/user/entities/dealer-lead.entity';
import { Dealer, Quotation, User } from 'src/user/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Invoice, DealerLead, Quotation, Dealer, User ]), LeadsModule], // pull in leads services/repositories
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService], // in case admin wants to use it directly
})
export class AnalyticsModule {}
