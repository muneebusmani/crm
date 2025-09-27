import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadMessage } from './entities/lead-message.entity';
import { LeadMessageService } from './lead-message.service';
import { LeadMessageController } from './lead-message.controller';
import { Dealer, User } from 'src/user/entities';
import { Lead } from 'src/leads/entities/lead.entity';
import { CustomMailerModule } from 'src/mailer/mailer.module';
import { AppLogger } from 'src/common/logger.service';
import { DealerLead } from 'src/user/entities/dealer-lead.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeadMessage, User, Lead, DealerLead]),
    CustomMailerModule,
  ],
  controllers: [LeadMessageController],
  providers: [LeadMessageService, AppLogger],
  exports: [LeadMessageService],
})
export class LeadMessageModule {}
