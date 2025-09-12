import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsGateway } from './leads.gateway';
import { LeadsController } from './leads.controller';

@Module({
  providers: [LeadsGateway, LeadsService],
  controllers : [LeadsController]
})
export class LeadsModule {}
