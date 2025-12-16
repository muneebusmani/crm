// src/dealer-tier/credit-reset.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DealerTierCredit } from 'src/user/entities/dealer-tier-credit.entity';
import { DealerTier } from 'src/user/entities';
import { AppLogger } from 'src/common/logger.service';

/**
 * CreditResetService - Handles monthly reset of dealer credits
 *
 * Runs on the 1st of every month at midnight (Europe/London timezone)
 * to reset all dealer credits back to their tier's creditLimit.
 */
@Injectable()
export class CreditResetService {
  private readonly logger = new Logger(CreditResetService.name);

  constructor(
    @InjectRepository(DealerTierCredit)
    private readonly dealerTierCreditRepo: Repository<DealerTierCredit>,
    @InjectRepository(DealerTier)
    private readonly dealerTierRepo: Repository<DealerTier>,
    private readonly loggerService: AppLogger,
  ) {}

  /**
   * Cron job: Runs at 00:00 on the 1st of every month (Europe/London timezone)
   * Resets all dealer credits to their tier's creditLimit
   */
  @Cron('0 0 1 * *', { timeZone: 'Europe/London' })
  async handleMonthlyCreditReset() {
    this.logger.log('🔄 Starting monthly credit reset process...');

    try {
      const result = await this.resetAllDealerCredits();

      this.loggerService.log(
        0,
        'MONTHLY_CREDIT_RESET',
        'CreditResetService',
        '0',
        `Monthly credit reset completed: ${result.resetCount} dealers reset`,
      );

      this.logger.log(
        `✅ Monthly credit reset completed: ${result.resetCount} dealers reset`,
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('❌ Monthly credit reset failed', error);
      this.loggerService.log(
        0,
        'MONTHLY_CREDIT_RESET_ERROR',
        'CreditResetService',
        '0',
        `Monthly credit reset failed: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Reset all dealer credits to their tier's creditLimit
   * Can be called manually by admin or by cron job
   */
  async resetAllDealerCredits(): Promise<{
    resetCount: number;
    details: Array<{
      dealerId: number;
      tierId: number;
      oldCredit: number;
      newCredit: number;
    }>;
  }> {
    const now = new Date();
    const details: Array<{
      dealerId: number;
      tierId: number;
      oldCredit: number;
      newCredit: number;
    }> = [];

    // Fetch all dealer tier credits with their tier information
    const dealerTierCredits = await this.dealerTierCreditRepo.find({
      relations: ['tier'],
    });

    for (const dtc of dealerTierCredits) {
      const oldCredit = dtc.credit;

      // Get the tier's creditLimit (default credit allocation)
      const tier = await this.dealerTierRepo.findOne({
        where: { id: dtc.tierId },
      });

      if (!tier) {
        this.logger.warn(
          `⚠️ Tier not found for dealer credit ID ${dtc.id}, skipping...`,
        );
        continue;
      }

      // Reset credit to tier's creditLimit
      dtc.credit = tier.creditLimit;
      dtc.lastResetAt = now;
      dtc.updated_at = now;

      await this.dealerTierCreditRepo.save(dtc);

      details.push({
        dealerId: dtc.dealerId,
        tierId: dtc.tierId,
        oldCredit,
        newCredit: tier.creditLimit,
      });

      this.logger.debug(
        `💳 Dealer ${dtc.dealerId}: ${oldCredit} → ${tier.creditLimit} credits`,
      );
    }

    return {
      resetCount: details.length,
      details,
    };
  }

  /**
   * Reset credits for a specific dealer (admin function)
   */
  async resetDealerCredits(dealerId: number): Promise<{
    dealerId: number;
    oldCredit: number;
    newCredit: number;
  }> {
    const dtc = await this.dealerTierCreditRepo.findOne({
      where: { dealerId },
      relations: ['tier'],
    });

    if (!dtc) {
      throw new Error(`Dealer tier credit not found for dealer ${dealerId}`);
    }

    const tier = await this.dealerTierRepo.findOne({
      where: { id: dtc.tierId },
    });

    if (!tier) {
      throw new Error(`Tier not found for dealer ${dealerId}`);
    }

    const oldCredit = dtc.credit;
    dtc.credit = tier.creditLimit;
    dtc.lastResetAt = new Date();
    dtc.updated_at = new Date();

    await this.dealerTierCreditRepo.save(dtc);

    this.logger.log(
      `💳 Manual reset for dealer ${dealerId}: ${oldCredit} → ${tier.creditLimit} credits`,
    );

    return {
      dealerId,
      oldCredit,
      newCredit: tier.creditLimit,
    };
  }

  /**
   * Get credit status for all dealers
   */
  async getCreditStatus(): Promise<
    Array<{
      dealerId: number;
      dealerName: string;
      tierName: string;
      currentCredit: number;
      creditLimit: number;
      lastResetAt: Date | null;
    }>
  > {
    const dealerTierCredits = await this.dealerTierCreditRepo.find({
      relations: ['tier', 'dealer', 'dealer.user'],
    });

    return dealerTierCredits.map((dtc) => ({
      dealerId: dtc.dealerId,
      dealerName:
        dtc.dealer?.user?.name ||
        dtc.dealer?.companyName ||
        `Dealer #${dtc.dealerId}`,
      tierName: dtc.tier?.name || 'Unknown',
      currentCredit: dtc.credit,
      creditLimit: dtc.tier?.creditLimit || 0,
      lastResetAt: dtc.lastResetAt,
    }));
  }
}
