import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';

import { AppLogger } from '../common/logger.service';
import { CustomError } from '../common/custom-error';
import { CreateLeadSchema, CreateLeadDto, UpdateLeadSchema, UpdateLeadDto } from '@crm/types'; 

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    private readonly logger: AppLogger,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    try {
      const lead = this.leadRepo.create(createLeadDto);
      return await this.leadRepo.save(lead);
    } catch (error: unknown) {
      this.logger.error('Failed to create lead', error instanceof Error ? error.stack : '', 'LeadsService');
      throw new CustomError('Unable to create lead');
    }
  }

  async findAll(): Promise<Lead[]> {
    try {
      return await this.leadRepo.find();
    } catch (error: unknown) {
      this.logger.error('Failed to fetch leads', error instanceof Error ? error.stack : '', 'LeadsService');
      throw new CustomError('Unable to fetch leads');
    }
  }

  async findOne(id: number): Promise<Lead> {
    try {
      const lead = await this.leadRepo.findOneBy({ id });
      if (!lead) throw new CustomError(`Lead with ID ${id} not found`, 404);
      return lead;
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch lead ${id}`, error instanceof Error ? error.stack : '', 'LeadsService');
      if (error instanceof CustomError) throw error;
      throw new CustomError('Unable to fetch lead');
    }
  }

  async update(id: number, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    try {
      const lead = await this.findOne(id); // will throw CustomError if not found
      const updated = Object.assign(lead, updateLeadDto);
      return await this.leadRepo.save(updated);
    } catch (error: unknown) {
      this.logger.error(`Failed to update lead ${id}`, error instanceof Error ? error.stack : '', 'LeadsService');
      if (error instanceof CustomError) throw error;
      throw new CustomError('Unable to update lead');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.leadRepo.delete(id);
      if (result.affected === 0) throw new CustomError(`Lead with ID ${id} not found`, 404);
    } catch (error: unknown) {
      this.logger.error(`Failed to delete lead ${id}`, error instanceof Error ? error.stack : '', 'LeadsService');
      if (error instanceof CustomError) throw error;
      throw new CustomError('Unable to delete lead');
    }
  }
}
