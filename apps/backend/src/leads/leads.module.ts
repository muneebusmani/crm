import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { ActivityLogger } from 'src/common/activity-log.subscriber';
import { AppLogger } from 'src/common/logger.service';
import { Lead } from './entities/lead.entity';
import { LeadNote } from './entities/lead-note.entity';
import { VehicleDetails } from './entities/vehicle-details.entity';
import {
  HqLeadDistribution,
  HqLeadSettings,
  HqLeadVisibility,
} from './entities';
import { CompanyUser } from '../company-user/entities/company-user.entity';
import { User, Dealer, DealerTier } from 'src/user/entities';
import { LeadsController } from './leads.controller';
import { LeadNotesController } from './lead-notes.controller';
import { LeadsGateway } from './leads.gateway';
import { LeadsService } from './leads.service';
import { LeadNotesService } from './lead-notes.service';
import { AdminHqLeadsController } from './admin-hq-leads.controller';
import { AdminLeadsController } from './admin-leads.controller';
import { HqLeadResetModule } from 'src/hq-lead-reset/hq-lead-reset.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lead,
      LeadNote,
      VehicleDetails,
      HqLeadDistribution,
      HqLeadSettings,
      HqLeadVisibility,
      CompanyUser,
      User,
      Dealer,
      DealerTier,
    ]),
    ActivityLogModule,
    HqLeadResetModule,
  ],
  providers: [
    LeadsGateway,
    LeadsService,
    LeadNotesService,
    AppLogger,
    ActivityLogger,
  ],
  controllers: [
    LeadsController,
    LeadNotesController,
    AdminHqLeadsController,
    AdminLeadsController,
  ],
  exports: [LeadsService, LeadNotesService],
})
export class LeadsModule {}
