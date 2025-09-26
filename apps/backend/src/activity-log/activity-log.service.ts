import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityRepo: Repository<ActivityLog>,
  ) {}

  async logActivity(options: {
    action: string;
    description?: string;
    user_id?: number;
    entity?: string;
    entity_id?: string;
  }) {
    const log = this.activityRepo.create(options);
    await this.activityRepo.save(log);
  }

  async getRecentActivities(limit = 50): Promise<ActivityLog[]> {
    return this.activityRepo.find({
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
