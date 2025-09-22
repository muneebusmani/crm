import type { ApiResponse, CreateLeadDto, UpdateLeadDto } from '@crm/types'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ActivityLogger } from 'src/common/activity-log.subscriber'
import { Repository } from 'typeorm'
import { CustomError } from '../common/custom-error'
import { AppLogger } from '../common/logger.service'
import { Lead } from './entities/lead.entity'

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    private readonly logger: AppLogger,
    private readonly activityLogger: ActivityLogger,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    try {
      const lead = this.leadRepo.create(createLeadDto)
      const result = await this.leadRepo.save(lead)

      await this.activityLogger.log(
        0,
        'CREATE_LEAD',
        'Lead',
        result.id.toString(),
        `Created lead (${result.vehicle_model})`,
      )

      return result // return raw entity
    } catch (error: unknown) {
      this.logger.error(
        'Failed to create lead',
        error instanceof Error ? error.stack : '',
        'LeadsService',
      )
      throw new CustomError('Unable to create lead')
    }
  }

async findAll(
  dealerId: number,
): Promise<Lead[]> {
  try {
    const leads = await this.leadRepo.find({
      relations: ["dealerLeads", "dealerLeads.dealer"],
    });

    return leads.map((lead) => {
      const dealerLead = lead.dealerLeads.find(
        (dl) => dl.dealer.id === dealerId,
      );

      return {
        ...lead,
        status: dealerLead ? dealerLead.status : lead.status, // overwrite status
      };
    });
  } catch (error: unknown) {
    this.logger.error(
      "Failed to fetch leads",
      error instanceof Error ? error.stack : "",
      "LeadsService",
    );
    throw new CustomError("Unable to fetch leads");
  }
}



  async findAllForDealer(dealerId: number): Promise<Lead[]> {
    try {
      return await this.leadRepo.find({
        relations: ['dealerLeads', 'dealerLeads.dealer'],
        where: {
          dealerLeads: {
            dealer: { id: dealerId },
          },
        },
      });
    } catch (error: unknown) {
      this.logger.error(
        'Failed to fetch leads',
        error instanceof Error ? error.stack : '',
        'LeadsService',
      )
      throw new CustomError('Unable to fetch leads')
    }
  }

   async getLeadById(id: number, dealerId: number): Promise<Lead> {
    try {
      const lead = await this.leadRepo.findOne({
        relations: ['dealerLeads', 'dealerLeads.dealer', 'dealerLeads.lead'],
        where: {
          dealerLeads: {
            dealer: { id: dealerId},
            lead :  {id : id}
          },
        },
      });
      if (!lead) throw new CustomError(`Lead with ID ${id} not found`, 404)
      return lead
    } catch (error: unknown) {
      this.logger.error(
        `Failed to fetch lead ${id}`,
        error instanceof Error ? error.stack : '',
        'LeadsService',
      )
      if (error instanceof CustomError) throw error
      throw new CustomError('Unable to fetch lead')
    }
  }

  async findOne(id: number): Promise<Lead> {
    try {
      const lead = await this.leadRepo.findOneBy({ id })
      if (!lead) throw new CustomError(`Lead with ID ${id} not found`, 404)
      return lead
    } catch (error: unknown) {
      this.logger.error(
        `Failed to fetch lead ${id}`,
        error instanceof Error ? error.stack : '',
        'LeadsService',
      )
      if (error instanceof CustomError) throw error
      throw new CustomError('Unable to fetch lead')
    }
  }

  async update(id: number, updateLeadDto: UpdateLeadDto) {
    try {
      const lead = await this.findOne(id) // will throw CustomError if not found
      const updated = Object.assign(lead, updateLeadDto)
      return await this.leadRepo.save(updated)
    } catch (error: unknown) {
      this.logger.error(
        `Failed to update lead ${id}`,
        error instanceof Error ? error.stack : '',
        'LeadsService',
      )
      if (error instanceof CustomError) throw error
      throw new CustomError('Unable to update lead')
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.leadRepo.delete(id)
      if (result.affected === 0) {
        throw new CustomError(`Lead with ID ${id} not found`, 404)
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to delete lead ${id}`,
        error instanceof Error ? error.stack : '',
        'LeadsService',
      )
      if (error instanceof CustomError) throw error
      throw new CustomError('Unable to delete lead')
    }
  }
}
