import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {  DealerTier, User } from '../entities';
import { DealerController } from './dealer.controller';
import { DealerService } from './dealer.service';
import { Quotation } from '../../user/entities/quotation.entity';  // 👈 direct import is fine, but relation must be wrapped
import { Dealer } from '../../user/entities/dealer.entity';  // 👈 direct import is fine, but relation must be wrapped
import { CustomMailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Dealer, DealerTier, Quotation]), CustomMailerModule],
  controllers: [DealerController],
  providers: [DealerService],
  exports: [DealerService],
})
export class DealerModule {}
