import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsGateway } from './leads.gateway';
import { AppLogger } from 'src/common/logger.service';
import { Lead } from './entities/lead.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsController } from './leads.controller';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { ActivityLogger } from 'src/common/activity-log.subscriber';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
@Module({
  imports: [TypeOrmModule.forFeature([Lead]), ActivityLogModule], // 👈 registers LeadRepository
  providers: [LeadsGateway, LeadsService, AppLogger, ActivityLogger], // 👈 registers AppLogger
  controllers : [LeadsController],
  exports: [LeadsService],
})
export class LeadsModule {}
