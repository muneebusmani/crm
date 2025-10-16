import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { ActivityLogger } from 'src/common/activity-log.subscriber';
import { AppLogger } from 'src/common/logger.service';
import { Lead } from './entities/lead.entity';
import { LeadsController } from './leads.controller';
import { LeadsGateway } from './leads.gateway';
import { LeadsService } from './leads.service';
@Module({
  imports: [TypeOrmModule.forFeature([Lead]), ActivityLogModule], // 👈 registers LeadRepository
  providers: [LeadsGateway, LeadsService, AppLogger, ActivityLogger], // 👈 registers AppLogger
  controllers: [LeadsController],
  exports: [LeadsService],
})
export class LeadsModule {}
