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
    const tiers = await this.dealerTierRepo.find({ relations: ['dealerTierCredits'] });
    return tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      creditLimit: tier.creditLimit,
      defaultCredit: tier.dealerTierCredits.length > 0 ? tier.dealerTierCredits[0].credit : 0,
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
      defaultCredit: tier.dealerTierCredits.length > 0 ? tier.dealerTierCredits[0].credit : 0,
    };
  }

  // Subtract credits from dealer when lead is won
  async subtractCredits(dealerId: number, amount: number): Promise<Dealer> {
    const dealer = await this.dealerRepo.findOne({ where: { id: dealerId } });
    if (!dealer) throw new BadRequestException('Dealer not found');

    if (dealer.credits < amount) {
      throw new BadRequestException('Insufficient credits');
    }

    dealer.credits -= amount;
    console.log("dealer"+ dealer.credits);
    return await this.dealerRepo.save(dealer);
  }
}
