import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin, AdminRole, User } from '../entities';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { LeadsModule } from 'src/leads/leads.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Admin, AdminRole]), LeadsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
