import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ActivityLogModule } from 'src/activity-log/activity-log.module'
import { ActivityLogger } from 'src/common/activity-log.subscriber'
import { AppLogger } from 'src/common/logger.service'
import { Lead } from 'src/leads/entities/lead.entity'
import { Dealer, User } from 'src/user/entities'
import { Quotation } from './entities/quotation.entity'
import { QuotationItem } from './entities/quotation-item.entity'
import { CustomMailerModule } from 'src/mailer/mailer.module'
import { QuotationController } from './quotation.controller'
import { QuotationService } from './quotation.service'
import { DealerLead } from 'src/user/entities/dealer-lead.entity'
import { PdfService } from 'src/Pdf/pdf-service'
import { BankDetails } from 'src/bank-details/entities/bank-details.entity'
import { LeadMessage } from 'src/leads-messages/entities/lead-message.entity'
import { LeadsGateway } from 'src/leads/leads.gateway'
import { DealerTierModule } from 'src/dealer-tier/dealer-tier.module'
import { BusinessSetting } from 'src/business-setting/entities/business-setting.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Quotation, QuotationItem, Dealer, User, DealerLead, BankDetails, LeadMessage, BusinessSetting]), CustomMailerModule, DealerTierModule], // 👈 registers LeadRepository
  controllers: [QuotationController],
  providers: [QuotationService, LeadsGateway, PdfService],
  exports: [QuotationService],
})
export class QuotationModule {}
