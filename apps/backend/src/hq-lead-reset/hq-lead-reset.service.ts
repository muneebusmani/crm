import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HqLeadDistribution } from '../leads/entities/hq-lead-distribution.entity';
import { AppLogger } from '../common/logger.service';

@Injectable()
export class HqLeadResetService {
  private readonly logger = new Logger(HqLeadResetService.name);

  constructor(
    @InjectRepository(HqLeadDistribution)
    private hqLeadDistributionRepository: Repository<HqLeadDistribution>,
    private readonly loggerService: AppLogger,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyReset() {
    this.logger.log('Starting daily HQ lead reset process');
    
    try {
      // In a real implementation, you might need to archive old records
      // but for now, the system checks against the assignedDate field
      // so no explicit reset is needed - the next assignment will check against today's date
      
      // We'll log this action for tracking
      this.loggerService.log(
        0,
        'HQ_LEAD_RESET',
        'HqLeadResetService',
        '0',
        'Daily HQ lead quota reset completed',
      );
      
      this.logger.log('Daily HQ lead reset process completed successfully');
    } catch (error) {
      this.logger.error('Error during daily HQ lead reset process', error);
      this.loggerService.log(
        0,
        'HQ_LEAD_RESET_ERROR',
        'HqLeadResetService',
        '0',
        `Daily HQ lead quota reset failed: ${error.message}`,
      );
    }
  }
}