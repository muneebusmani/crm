import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { ActivityLogger } from 'src/common/activity-log.subscriber';
import { AppLogger } from 'src/common/logger.service';
import { Lead } from 'src/leads/entities/lead.entity';
import { User } from 'src/user/entities';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { CustomMailerModule } from 'src/mailer/mailer.module';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, User, Invoice, InvoiceItem]),
    CustomMailerModule,
  ], // 👈 registers LeadRepository
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
