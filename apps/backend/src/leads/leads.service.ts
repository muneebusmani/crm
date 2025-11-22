import type { ApiResponse, CreateLeadDto, UpdateLeadDto } from '@crm/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityLogger } from 'src/common/activity-log.subscriber';
import { Repository } from 'typeorm';
import { CustomError } from '../common/custom-error';
import { AppLogger } from '../common/logger.service';
import { Lead } from './entities/lead.entity';
import { User } from 'src/user/entities';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    private readonly logger: AppLogger,
    private readonly activityLogger: ActivityLogger,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    try {
      const lead = this.leadRepo.create(createLeadDto);
      const result = await this.leadRepo.save(lead);

      await this.activityLogger.log(
        0,
        'CREATE_LEAD',
        'Lead',
        result.id.toString(),
        `Created lead (${result.vehicle_model})`,
      );

      return result; // return raw entity
    } catch (error: unknown) {
      this.logger.error(
        'Failed to create lead',
        error instanceof Error ? error.stack : '',
        'LeadsService',
      );
      throw new CustomError('Unable to create lead');
    }
  }

  async findAll(userId: number): Promise<Lead[]> {
    try {
      // 🔍 Find dealer with profile to get Dealer Entity ID
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['dealer'],
      });

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const dealerEntityId = user.dealer?.id;

      const leads = await this.leadRepo.find({
        where: { is_deleted: false },
        relations: ['dealerLeads', 'dealerLeads.dealer'],
      });

      return leads.map((lead) => {
        // dealer's own entry for this lead (linked by User ID)
        const dealerLead = lead.dealerLeads
          .filter((dl) => dl.dealer.id === userId)
          .slice(-1)[0];

        // check if any dealer has WON this lead via wonByDealerId field
        const leadWon =
          lead.wonByDealerId !== null && lead.wonByDealerId !== undefined;

        let status: string;

        if (leadWon) {
          // someone won already - check if it's this dealer (linked by Dealer Entity ID)
          status = lead.wonByDealerId === dealerEntityId ? 'WON' : 'LOST';
        } else {
          // nobody has WON yet → show dealer's own status
          status = dealerLead ? dealerLead.status : 'NEW';
        }

        return {
          ...lead,
          status, // 👈 per-dealer status
        } as Lead;
      });
    } catch (error: unknown) {
      this.logger.error(
        'Failed to fetch leads',
        error instanceof Error ? error.stack : '',
        'LeadsService',
      );
      throw new CustomError('Unable to fetch leads');
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
      );
      throw new CustomError('Unable to fetch leads');
    }
  }

  async getLeadById(id: number, dealerId: number): Promise<Lead> {
    try {
      const lead = await this.leadRepo.findOne({
        relations: ['dealerLeads', 'dealerLeads.dealer', 'dealerLeads.lead'],
        where: {
          dealerLeads: {
            dealer: { id: dealerId },
            lead: { id: id },
          },
        },
      });
      if (!lead) throw new CustomError(`Lead with ID ${id} not found`, 404);
      return lead;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to fetch lead ${id}`,
        error instanceof Error ? error.stack : '',
        'LeadsService',
      );
      if (error instanceof CustomError) throw error;
      throw new CustomError('Unable to fetch lead');
    }
  }

  async findOne(id: number): Promise<Lead> {
    try {
      const lead = await this.leadRepo.findOneBy({ id });
      if (!lead) throw new CustomError(`Lead with ID ${id} not found`, 404);
      return lead;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to fetch lead ${id}`,
        error instanceof Error ? error.stack : '',
        'LeadsService',
      );
      if (error instanceof CustomError) throw error;
      throw new CustomError('Unable to fetch lead');
    }
  }

  async update(id: number, updateLeadDto: UpdateLeadDto) {
    try {
      const lead = await this.findOne(id); // will throw CustomError if not found
      const updated = Object.assign(lead, updateLeadDto);
      return await this.leadRepo.save(updated);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to update lead ${id}`,
        error instanceof Error ? error.stack : '',
        'LeadsService',
      );
      if (error instanceof CustomError) throw error;
      throw new CustomError('Unable to update lead');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const lead = await this.leadRepo.findOneBy({ id });
      if (!lead) {
        throw new CustomError('Lead not found!', 404);
      }
      lead.is_deleted = true;
      this.leadRepo.save(lead); // better than lead.save()
    } catch (error: unknown) {
      this.logger.error(
        `Failed to delete lead ${id}`,
        error instanceof Error ? error.stack : '',
        'LeadsService',
      );
      if (error instanceof CustomError) throw error;
      throw new CustomError('Unable to delete lead');
    }
  }

  async fetchMoreInfo(id: number, dealerId: number) {
    try {
      // First, get the lead
      const lead = await this.leadRepo.findOne({
        where: { id },
        relations: ['dealerLeads', 'dealerLeads.dealer'],
      });

      if (!lead) {
        throw new CustomError(`Lead with ID ${id} not found`, 404);
      }

      // Check if lead has already been fetched for more info
      if (lead.moreInfoFetched) {
        throw new CustomError(
          'Additional lead info has already been fetched for this lead',
          400,
        );
      }

      // 🔍 Find dealer with profile to get Dealer Entity ID
      const dealer = await this.userRepository.findOne({
        where: { id: dealerId },
        relations: ['dealer'],
      });

      if (!dealer) {
        throw new CustomError('Dealer not found', 404);
      }

      // Check if another dealer has already won this lead
      // Use dealer.dealer.id (Dealer Entity ID) for comparison
      if (lead.wonByDealerId && lead.wonByDealerId !== dealer.dealer?.id) {
        throw new CustomError(
          'This lead has already been won by another dealer',
          403,
        );
      }

      // Simulate API call to fetch more info (replace with actual API call)
      // For now, this is a placeholder for the actual implementation
      // You would typically call an external API here to get more vehicle info, etc.

      // In a real implementation, you would make an external API call here
      // For example: const externalData = await fetch('https://api.example.com/vehicle-info', {...});

      // Update the lead with the fetched information (simulated for now)
      // You would update with the actual data received from the external API
      lead.moreInfoFetched = true;
      lead.updatedAt = new Date();

      // Save the updated lead to persist the changes to the database
      const updatedLead = await this.leadRepo.save(lead);

      // Log the activity
      await this.activityLogger.log(
        dealerId,
        'FETCH_MORE_INFO',
        'Lead',
        lead.id.toString(),
        `Fetched additional information for lead ${lead.id}`,
      );

      return updatedLead;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to fetch more info for lead ${id}`,
        error instanceof Error ? error.stack : '',
        'LeadsService',
      );
      if (error instanceof CustomError) throw error;
      throw new CustomError('Unable to fetch additional lead information');
    }
  }
}
