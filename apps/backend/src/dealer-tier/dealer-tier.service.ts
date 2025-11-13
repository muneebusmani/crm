// src/user/dealer-tier/dealer-tier.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dealer, DealerTier } from 'src/user/entities';
import { DealerTierCredit } from 'src/user/entities/dealer-tier-credit.entity';

@Injectable()
export class DealerTierService {
  constructor(
    @InjectRepository(DealerTier)
    private readonly dealerTierRepo: Repository<DealerTier>,
    @InjectRepository(Dealer)
    private readonly dealerRepo: Repository<Dealer>,
    @InjectRepository(DealerTierCredit)
    private readonly dealerTierCreditRepo: Repository<DealerTierCredit>,
  ) {}

  // Fetch all tiers with their default credits
  async getAllTiers(): Promise<any[]> {
    const tiers = await this.dealerTierRepo.find({
      relations: ['dealerTierCredits'],
    });
    return tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      creditLimit: tier.creditLimit,
      defaultCredit:
        tier.dealerTierCredits.length > 0
          ? tier.dealerTierCredits[0].credit
          : 0,
    }));
  }

  // Fetch tier by id
  async getTierById(id: number): Promise<any> {
    const tier = await this.dealerTierRepo.findOne({
      where: { id },
      relations: ['dealerTierCredits'],
    });
    if (!tier) throw new BadRequestException('Dealer tier not found');

    return {
      id: tier.id,
      name: tier.name,
      creditLimit: tier.creditLimit,
      defaultCredit:
        tier.dealerTierCredits.length > 0
          ? tier.dealerTierCredits[0].credit
          : 0,
    };
  }

  // Subtract credits from dealer when lead is won
  async subtractCredits(
    dealerId: number,
    amount: number,
  ): Promise<DealerTierCredit> {
    // Find the dealer's tier credit entry
    const dealerTierCredit = await this.dealerTierCreditRepo.findOne({
      where: { dealerId },
      relations: ['dealer', 'tier'],
    });

    if (!dealerTierCredit) {
      throw new BadRequestException('Dealer tier credit not found');
    }

    if (dealerTierCredit.credit < amount) {
      throw new BadRequestException('Insufficient credits');
    }

    dealerTierCredit.credit -= amount;
    console.log(
      `🔻 Deducting ${amount} credit(s) from dealer ${dealerId}. Remaining: ${dealerTierCredit.credit}`,
    );

    return await this.dealerTierCreditRepo.save(dealerTierCredit);
  }
}
