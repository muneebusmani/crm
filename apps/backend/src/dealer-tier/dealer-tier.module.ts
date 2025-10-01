// src/user/dealer-tier/dealer-tier.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealerTierService } from './dealer-tier.service';
import { DealerTierController } from './dealer-tier.controller';
import { Dealer, DealerTier } from 'src/user/entities';
import { DealerTierCredit } from 'src/user/entities/dealer-tier-credit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DealerTier, Dealer, DealerTierCredit])],
  providers: [DealerTierService],
  controllers: [DealerTierController],
  exports: [DealerTierService],
})
export class DealerTierModule {}
