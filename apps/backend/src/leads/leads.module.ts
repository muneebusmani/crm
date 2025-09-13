import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsGateway } from './leads.gateway';
import { AppLogger } from 'src/common/logger.service';
import { Lead } from './entities/lead.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsController } from './leads.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Lead])], // 👈 registers LeadRepository
  providers: [LeadsGateway, LeadsService, AppLogger], // 👈 registers AppLogger
  controllers : [LeadsController],
  exports: [LeadsService],
})
export class LeadsModule {}
