import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin, AdminRole, User, UserDevice } from '../entities';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { LeadsModule } from 'src/leads/leads.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Admin, AdminRole, UserDevice]),
    LeadsModule,
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
