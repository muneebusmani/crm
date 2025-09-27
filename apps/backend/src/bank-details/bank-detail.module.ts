import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ActivityLogModule } from 'src/activity-log/activity-log.module'
import { ActivityLogger } from 'src/common/activity-log.subscriber'
import { AppLogger } from 'src/common/logger.service'
import { BankDetails } from 'src/bank-details/entities/bank-details.entity'
import { BankDetailService } from './bank-detail.service'
import { BankDetailsController } from './bank-detail.controller'
import { User } from 'src/user/entities'

@Module({
  imports: [TypeOrmModule.forFeature([BankDetails, User])], // 👈 registers LeadRepository
  providers: [BankDetailService],// 👈 registers AppLogger
  controllers:[BankDetailsController],
  exports:[BankDetailService],
})
export class BankDeatil {}
