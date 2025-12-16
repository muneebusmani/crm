// src/user/dealer-tier/dealer-tier.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealerTierService } from './dealer-tier.service';
import { DealerTierController } from './dealer-tier.controller';
import { CreditResetService } from './credit-reset.service';
import { Dealer, DealerTier } from 'src/user/entities';
import { DealerTierCredit } from 'src/user/entities/dealer-tier-credit.entity';
import { AppLogger } from 'src/common/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([DealerTier, Dealer, DealerTierCredit])],
  providers: [DealerTierService, CreditResetService, AppLogger],
  controllers: [DealerTierController],
  exports: [DealerTierService, CreditResetService],
})
export class DealerTierModule {}
