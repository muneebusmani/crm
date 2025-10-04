import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealerTier } from '../user/entities/dealer-tier.entity';
import { DealerTierSeeder } from './dealer-tier.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([DealerTier])],
  providers: [DealerTierSeeder],
})
export class SeederModule {}
