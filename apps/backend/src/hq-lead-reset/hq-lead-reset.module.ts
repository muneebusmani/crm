import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HqLeadDistribution } from '../leads/entities/hq-lead-distribution.entity';
import { HqLeadVisibility } from '../leads/entities/hq-lead-visibility.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Dealer } from '../user/entities/dealer.entity';
import { HqLeadResetService } from './hq-lead-reset.service';
import { HqLeadBackfillService } from './hq-lead-backfill.service';
import { AppLogger } from '../common/logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HqLeadDistribution,
      HqLeadVisibility,
      Lead,
      Dealer,
    ]),
  ],
  providers: [HqLeadResetService, HqLeadBackfillService, AppLogger],
  exports: [HqLeadResetService, HqLeadBackfillService],
})
export class HqLeadResetModule {}
