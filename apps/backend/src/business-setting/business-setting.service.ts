import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertBusinessSettingDto } from '@crm/types';
import { BusinessSetting } from './entities/business-setting.entity';

@Injectable()
export class BusinessSettingService {
  constructor(
    @InjectRepository(BusinessSetting)
    private readonly businessSettingRepo: Repository<BusinessSetting>,
  ) {}

  async upsertSetting(dto: UpsertBusinessSettingDto, dealerId: Number) {
    const existing = await this.businessSettingRepo.findOne({
      where: { dealerId: dealerId },
    });

    if (existing) {
      existing.salesTerms = dto.salesTerms;
      existing.quotation = dto.quotation;
      return await this.businessSettingRepo.save(existing);
    }

    const newSetting = this.businessSettingRepo.create({
      dealerId: dealerId,
      salesTerms: dto.salesTerms,
      quotation: dto.quotation,
    });

    return await this.businessSettingRepo.save(newSetting);
  }

  async getByDealerId(dealerId: Number) {
    const setting = await this.businessSettingRepo.findOne({ where: { dealerId } });
    if (!setting) throw new NotFoundException('Business setting not found');
    return setting;
  }
}
