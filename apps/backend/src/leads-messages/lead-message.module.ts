import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadMessage } from './entities/lead-message.entity';
import { LeadMessageService } from './lead-message.service';
import { LeadMessageController } from './lead-message.controller';
import { Dealer, User } from 'src/user/entities';
import { Lead } from 'src/leads/entities/lead.entity';


@Module({
  imports: [TypeOrmModule.forFeature([LeadMessage, User, Lead])],
  controllers: [LeadMessageController],
  providers: [LeadMessageService],
  exports: [LeadMessageService],
})
export class LeadMessageModule {}
