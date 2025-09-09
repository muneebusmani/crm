import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dealer, DealerTier, User } from '../entities';
import { DealerController } from './dealer.controller';
import { DealerService } from './dealer.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Dealer, DealerTier])],
  controllers: [DealerController],
  providers: [DealerService],
  exports: [DealerService],
})
export class DealerModule {}
