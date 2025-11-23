import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { ActivityLogger } from 'src/common/activity-log.subscriber';
import { AppLogger } from 'src/common/logger.service';
import { Lead } from './entities/lead.entity';
import { LeadNote } from './entities/lead-note.entity';
import { VehicleDetails } from './entities/vehicle-details.entity';
import { CompanyUser } from '../company-user/entities/company-user.entity';
import { User } from 'src/user/entities';
import { LeadsController } from './leads.controller';
import { LeadNotesController } from './lead-notes.controller';
import { LeadsGateway } from './leads.gateway';
import { LeadsService } from './leads.service';
import { LeadNotesService } from './lead-notes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, LeadNote, VehicleDetails, CompanyUser, User]),
    ActivityLogModule,
  ],
  providers: [
    LeadsGateway,
    LeadsService,
    LeadNotesService,
    AppLogger,
    ActivityLogger,
  ],
  controllers: [LeadsController, LeadNotesController],
  exports: [LeadsService, LeadNotesService],
})
export class LeadsModule {}
