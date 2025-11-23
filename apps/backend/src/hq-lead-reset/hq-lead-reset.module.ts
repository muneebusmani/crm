import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HqLeadDistribution } from '../leads/entities/hq-lead-distribution.entity';
import { HqLeadResetService } from './hq-lead-reset.service';
import { AppLogger } from '../common/logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HqLeadDistribution]),
  ],
  providers: [
    HqLeadResetService,
    AppLogger,
  ],
  exports: [
    HqLeadResetService,
  ],
})
export class HqLeadResetModule {}