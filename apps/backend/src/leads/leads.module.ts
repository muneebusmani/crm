import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsGateway } from './leads.gateway';

@Module({
  providers: [LeadsGateway, LeadsService],
})
export class LeadsModule {}
