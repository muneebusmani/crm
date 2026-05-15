import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ActivityLogModule } from 'src/activity-log/activity-log.module'
import { ActivityLogger } from 'src/common/activity-log.subscriber'
import { AppLogger } from 'src/common/logger.service'
import { Lead } from 'src/leads/entities/lead.entity'
import { Dealer, User } from 'src/user/entities'
import { Invoice } from './entities/invoice.entity'
import { InvoiceItem } from './entities/invoice-item.entity'
import { CustomMailerModule } from 'src/mailer/mailer.module'
import { InvoiceController } from './invoice.controller'
import { InvoiceService } from './invoice.service'
import { DealerLead } from 'src/user/entities/dealer-lead.entity'
import { PdfService } from 'src/Pdf/pdf-service'
import { BankDetails } from 'src/bank-details/entities/bank-details.entity'
import { LeadMessage } from 'src/leads-messages/entities/lead-message.entity'
import { LeadsGateway } from 'src/leads/leads.gateway'
import { DealerTierModule } from 'src/dealer-tier/dealer-tier.module'
import { BusinessSetting } from 'src/business-setting/entities/business-setting.entity'
import { SupabaseStorageService } from 'src/common/supabase-storage.service'

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Invoice, InvoiceItem, Dealer, User, DealerLead, BankDetails, LeadMessage, BusinessSetting]), CustomMailerModule, DealerTierModule], // 👈 registers LeadRepository
  controllers: [InvoiceController],
  providers: [InvoiceService, LeadsGateway, PdfService, SupabaseStorageService],
  exports: [InvoiceService],
})
export class InvoiceModule { }
