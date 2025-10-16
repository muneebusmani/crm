import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DealerTier } from '../user/entities/dealer-tier.entity';

@Injectable()
export class DealerTierSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(DealerTierSeeder.name);

  constructor(
    @InjectRepository(DealerTier)
    private readonly dealerTierRepo: Repository<DealerTier>,
  ) {}

  async onApplicationBootstrap() {
    const tiers = [
      { name: 'Bronze', creditLimit: 200 },
      { name: 'Silver', creditLimit: 400 },
      { name: 'Gold', creditLimit: 600 },
    ];

    for (const t of tiers) {
      const exists = await this.dealerTierRepo.findOne({ where: { name: t.name } });
      if (!exists) {
        // use save/create to ensure TypeORM respects entity lifecycle
        await this.dealerTierRepo.save(this.dealerTierRepo.create(t));
        this.logger.log(`Inserted tier: ${t.name}`);
      } else {
        this.logger.log(`Tier already exists: ${t.name}`);
      }
    }

    this.logger.log('✅ Dealer tiers seeding finished');
  }
}
