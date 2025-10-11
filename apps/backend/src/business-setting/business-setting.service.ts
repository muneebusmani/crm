import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessSetting } from './entities/business-setting.entity';
import { CreateBusinessSettingDto, UpdateBusinessSettingDto } from '@crm/types';
import { Exception } from 'handlebars';

@Injectable()
export class BusinessSettingService {
  constructor(
    @InjectRepository(BusinessSetting)
    private readonly businessSettingRepository: Repository<BusinessSetting>,
  ) {}

  async create(dto: CreateBusinessSettingDto): Promise<BusinessSetting> {
    const setting = this.businessSettingRepository.create(dto);
    return this.businessSettingRepository.save(setting);
  }

  async findAll(): Promise<BusinessSetting[]> {
    return this.businessSettingRepository.find();
  }

  async findOne(id: string): Promise<BusinessSetting> {
    const setting = await this.businessSettingRepository.findOne({ where: { id } });
    if (!setting) throw new NotFoundException('Business setting not found');
    return setting;
  }

  async update(id: string, dto: UpdateBusinessSettingDto): Promise<BusinessSetting> {
    const setting = await this.findOne(id);
    Object.assign(setting, dto);
    return this.businessSettingRepository.save(setting);
  }

  async remove(id: string): Promise<void> {
    await this.businessSettingRepository.delete(id);
  }
}
