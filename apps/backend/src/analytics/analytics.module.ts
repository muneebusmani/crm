import { Module } from '@nestjs/common';
import { LeadsModule } from 'src/leads/leads.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from 'src/leads/entities/lead.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lead]), LeadsModule], // pull in leads services/repositories
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService], // in case admin wants to use it directly
})
export class AnalyticsModule {}
