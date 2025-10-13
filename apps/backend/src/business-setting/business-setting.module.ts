import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessSettingService } from './business-setting.service';
import { BusinessSettingController } from './business-setting.controller';
import { BusinessSetting } from './entities/business-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessSetting])],
  controllers: [BusinessSettingController],
  providers: [BusinessSettingService],
  exports: [BusinessSettingService],
})
export class BusinessSettingModule {}
