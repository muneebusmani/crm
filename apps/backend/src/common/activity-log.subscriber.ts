import { Injectable } from '@nestjs/common';
import { ActivityLogService } from 'src/activity-log/activity-log.service';

@Injectable()
export class ActivityLogger {
  constructor(private readonly activityLogService: ActivityLogService) {}

  async log(
    userId: number,
    action: string,
    entity: string,
    entityId: string,
    description?: string,
  ) {
    await this.activityLogService.logActivity({
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      description,
    });
  }
}
