import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../leads/entities/lead.entity';
import { HqLeadVisibility } from '../leads/entities/hq-lead-visibility.entity';
import { Dealer } from '../user/entities/dealer.entity';
import { AppLogger } from '../common/logger.service';

export interface BackfillResult {
  dealerId: number;
  dealerName: string;
  leadsAssigned: number;
  remainingQuota: number;
}

export interface BackfillSummary {
  totalLeadsAssigned: number;
  dealersProcessed: number;
  results: BackfillResult[];
  startedAt: Date;
  completedAt: Date;
  triggeredBy: 'cron' | 'manual';
}

@Injectable()
export class HqLeadBackfillService {
  private readonly logger = new Logger(HqLeadBackfillService.name);
  private isRunning = false;
  private lastRunSummary: BackfillSummary | null = null;

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(HqLeadVisibility)
    private readonly visibilityRepository: Repository<HqLeadVisibility>,
    @InjectRepository(Dealer)
    private readonly dealerRepository: Repository<Dealer>,
    private readonly activityLogger: AppLogger,
  ) {}

  /**
   * Scheduled job that runs at 1 AM UK time daily.
   * UK is UTC+0 in winter (GMT) and UTC+1 in summer (BST).
   * Running at 1 AM UTC covers both scenarios reasonably well.
   */
  @Cron('0 1 * * *', { timeZone: 'Europe/London' })
  async handleScheduledBackfill(): Promise<void> {
    this.logger.log('Starting scheduled HQ lead backfill (1 AM UK time)');
    await this.runBackfill('cron');
  }

  /**
   * Manual trigger for admin to run backfill immediately.
   * Returns the summary of the backfill operation.
   */
  async triggerManualBackfill(): Promise<BackfillSummary> {
    this.logger.log('Manual backfill triggered by admin');
    return await this.runBackfill('manual');
  }

  /**
   * Get the last backfill run summary.
   */
  getLastRunSummary(): BackfillSummary | null {
    return this.lastRunSummary;
  }

  /**
   * Check if backfill is currently running.
   */
  isBackfillRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Main backfill logic.
   * Finds all HQ leads that are missing visibility records for eligible dealers
   * and assigns them in order (oldest first) until each dealer's quota is filled.
   */
  private async runBackfill(
    triggeredBy: 'cron' | 'manual',
  ): Promise<BackfillSummary> {
    if (this.isRunning) {
      this.logger.warn('Backfill is already running, skipping...');
      throw new Error('Backfill is already in progress');
    }

    this.isRunning = true;
    const startedAt = new Date();
    const results: BackfillResult[] = [];
    let totalLeadsAssigned = 0;

    try {
      // Get today's date for quota calculation
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all dealers with their tier info
      const dealers = await this.dealerRepository
        .createQueryBuilder('dealer')
        .leftJoinAndSelect('dealer.tier', 'tier')
        .getMany();

      this.logger.log(`Processing ${dealers.length} dealers for backfill`);

      for (const dealer of dealers) {
        // Calculate effective quota
        const effectiveQuota =
          dealer.customHqQuota !== null && dealer.customHqQuota !== undefined
            ? dealer.customHqQuota
            : (dealer.tier?.hqLeadQuota ?? 0);

        // Skip dealers with no HQ access
        if (effectiveQuota === 0) {
          continue;
        }

        // Count today's assignments for this dealer
        const todayCount = await this.visibilityRepository.count({
          where: {
            dealerId: dealer.id,
            assignedDate: today,
          },
        });

        // Calculate remaining quota
        let remainingQuota: number;
        if (effectiveQuota === -1) {
          // Unlimited - can receive up to 100 leads per backfill run to prevent overload
          remainingQuota = 100;
        } else {
          remainingQuota = Math.max(0, effectiveQuota - todayCount);
        }

        if (remainingQuota <= 0) {
          continue;
        }

        // Find missed HQ leads for this dealer (oldest first)
        // Get IDs of leads already visible to this dealer
        const existingVisibility = await this.visibilityRepository.find({
          where: { dealerId: dealer.id },
          select: ['leadId'],
        });
        const existingLeadIds = existingVisibility.map((v) => v.leadId);

        // Find HQ leads not visible to this dealer, ordered by creation date (oldest first)
        const missedLeadsQuery = this.leadRepository
          .createQueryBuilder('lead')
          .where('lead.isHqLead = :isHq', { isHq: true })
          .andWhere('lead.is_deleted = :isDeleted', { isDeleted: false })
          .orderBy('lead.createdAt', 'ASC')
          .take(remainingQuota);

        if (existingLeadIds.length > 0) {
          missedLeadsQuery.andWhere('lead.id NOT IN (:...existingLeadIds)', {
            existingLeadIds,
          });
        }

        const missedLeads = await missedLeadsQuery.getMany();

        if (missedLeads.length === 0) {
          continue;
        }

        // Assign missed leads to this dealer
        let assignedCount = 0;
        for (const lead of missedLeads) {
          try {
            await this.visibilityRepository.insert({
              leadId: lead.id,
              dealerId: dealer.id,
              assignedDate: today, // Assigned today (counts against today's quota)
              isManualOverride: false,
            });
            assignedCount++;
          } catch (error: unknown) {
            // Ignore duplicate key errors (race condition protection)
            const dbError = error as { code?: string };
            if (dbError.code !== '23505') {
              this.logger.error(
                `Failed to assign lead ${lead.id} to dealer ${dealer.id}:`,
                error,
              );
            }
          }
        }

        if (assignedCount > 0) {
          results.push({
            dealerId: dealer.id,
            dealerName: dealer.name,
            leadsAssigned: assignedCount,
            remainingQuota: remainingQuota - assignedCount,
          });
          totalLeadsAssigned += assignedCount;

          this.logger.log(
            `Backfilled ${assignedCount} leads to dealer ${dealer.name} (ID: ${dealer.id})`,
          );
        }
      }

      const completedAt = new Date();
      const summary: BackfillSummary = {
        totalLeadsAssigned,
        dealersProcessed: results.length,
        results,
        startedAt,
        completedAt,
        triggeredBy,
      };

      this.lastRunSummary = summary;

      // Log activity
      await this.activityLogger.log(
        0,
        'HQ_LEAD_BACKFILL',
        'HqLeadBackfillService',
        '0',
        `Backfill completed: ${totalLeadsAssigned} leads assigned to ${results.length} dealers (${triggeredBy})`,
      );

      this.logger.log(
        `Backfill completed: ${totalLeadsAssigned} leads assigned to ${results.length} dealers`,
      );

      return summary;
    } catch (error) {
      this.logger.error('Backfill failed:', error);
      await this.activityLogger.log(
        0,
        'HQ_LEAD_BACKFILL_ERROR',
        'HqLeadBackfillService',
        '0',
        `Backfill failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    } finally {
      this.isRunning = false;
    }
  }
}
