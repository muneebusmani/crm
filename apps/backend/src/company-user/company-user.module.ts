import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyUserService } from './company-user.service';
import { CompanyUserController } from './company-user.controller';
import { CompanyUser } from './entities/company-user.entity';
import { Dealer } from 'src/user/entities';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyUser, Dealer])],
  providers: [CompanyUserService],
  controllers: [CompanyUserController],
})
export class CompanyUserModule {}
