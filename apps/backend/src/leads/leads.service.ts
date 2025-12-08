import type { ApiResponse, CreateLeadDto, UpdateLeadDto } from '@crm/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityLogger } from 'src/common/activity-log.subscriber';
import { Repository } from 'typeorm';
import { CustomError } from '../common/custom-error';
import { AppLogger } from '../common/logger.service';
import { Lead } from './entities/lead.entity';
import { User, DealerTier, Dealer } from 'src/user/entities';
import { VehicleDetails } from './entities/vehicle-details.entity';
import { HqLeadDistribution, HqLeadSettings } from './entities';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(VehicleDetails)
    private readonly vehicleDetailsRepo: Repository<VehicleDetails>,
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

  // Get all leads for admin (no filtering)
  async getAllLeadsForAdmin(): Promise<Lead[]> {
    try {
      return await this.leadRepo.find({
        where: { is_deleted: false },
        relations: ['dealerLeads', 'dealerLeads.dealer'],
        order: { createdAt: 'DESC' },
      });
    } catch (error: unknown) {
      this.logger.error(
        'Failed to fetch all leads for admin',
        error instanceof Error ? error.stack : '',
        'LeadsService',
      );
      throw new CustomError('Unable to fetch leads');
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

  async getVehicleDetails(id: number, dealerId: number) {
    try {
      // First, verify the lead exists and the dealer has access to it
      const lead = await this.leadRepo.findOne({
        where: { id },
        relations: ['dealerLeads', 'dealerLeads.dealer'],
      });

      if (!lead) {
        throw new CustomError(`Lead with ID ${id} not found`, 404);
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

      // Check if lead has vehicle details
      // if (!lead.moreInfoFetched) {
      //   throw new CustomError(
      //     'No additional vehicle details available for this lead',
      //     404,
      //   );
      // }

      // Get the vehicle details for this lead
      const vehicleDetails = await this.vehicleDetailsRepo.findOne({
        where: { lead: { id } },
      });

      if (!vehicleDetails) {
        throw new CustomError('No vehicle details found for this lead', 404);
      }

      return vehicleDetails;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to fetch vehicle details for lead ${id}`,
        error instanceof Error ? error.stack : '',
        'LeadsService',
      );
      if (error instanceof CustomError) throw error;
      throw new CustomError('Unable to fetch vehicle details');
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

      // Call the external API to get vehicle details
      let externalData = null;

      try {
        // Get the VRM from the lead to call the external API
        // const vrm = lead.vehicle_reg; // or lead.vehicle_vrm, depending on which field contains the registration
        const vrm = 'EA65AMX'; // or lead.vehicle_vrm, depending on which field contains the registration
        if (!vrm) {
          throw new CustomError(
            'Vehicle registration not available for this lead',
            400,
          );
        }

        // Call the external API to get detailed vehicle information
        const response = await fetch(
          `${process.env.VEHICLE_DATA_API_URL}/vehicledata/ukvehicledata?apikey=${process.env.VEHICLE_DATA_API_KEY}&vrm=${encodeURIComponent(vrm)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        // if (!response.ok) {
        //   throw new CustomError(
        //     `External API call failed: ${response.status}`,
        //     response.status,
        //   );
        // }

        externalData = await response.json();
        console.log('External Data:', externalData);

        // Save the vehicle details to the separate table
        const vehicleDetails = new VehicleDetails();
        vehicleDetails.vehicleRegistration =
          externalData.VehicleRegistration || {};
        vehicleDetails.dimensions = externalData.Dimensions || null;
        vehicleDetails.engine = externalData.Engine || null;
        vehicleDetails.performance = externalData.Performance || null;
        vehicleDetails.consumption = externalData.Consumption || null;
        vehicleDetails.vehicleHistory = externalData.VehicleHistory || null;
        vehicleDetails.smmtDetails = externalData.SmmtDetails || null;
        vehicleDetails.vedRate = externalData.vedRate || null;
        vehicleDetails.general = externalData.General || null;
        vehicleDetails.lead = lead; // Set the relationship

        await this.vehicleDetailsRepo.save(vehicleDetails);
      } catch (apiError) {
        this.logger.error(
          `External API call failed for lead ${id}`,
          apiError instanceof Error ? apiError.stack : '',
          'LeadsService',
        );
        // Still mark the info as fetched even if the external call fails
        // This prevents repeated failed calls to the external API
      }

      // Update the lead with the fetched information
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

  // Get the package tier for a dealer
  async getDealerPackageTier(dealerId: number): Promise<string> {
    const dealer = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.dealer', 'dealer')
      .leftJoinAndSelect('dealer.dealerTierCredits', 'tierCredits')
      .leftJoinAndSelect('tierCredits.tier', 'tier')
      .where('dealer.id = :dealerId', { dealerId })
      .getOne();

    if (!dealer || !dealer.dealer) {
      throw new CustomError('Dealer not found', 404);
    }

    const tier = dealer.dealer.tierId; // Get tier ID from dealer
    const dealerTier = await this.userRepository.manager
      .createQueryBuilder(DealerTier, 'dealerTier')
      .where('dealerTier.id = :tierId', { tierId: tier })
      .getOne();

    return dealerTier ? dealerTier.name : 'Bronze'; // Default to Bronze if no tier
  }

  // Get daily limit for a package tier (legacy - kept for compatibility)
  async getDailyLimitForTier(packageTier: string): Promise<number> {
    const setting = await this.userRepository.manager
      .createQueryBuilder(HqLeadSettings, 'hqLeadSettings')
      .where('hqLeadSettings.packageTier = :packageTier', { packageTier })
      .getOne();

    return setting ? setting.dailyLimit : 2; // Default to 2 for Bronze if not found
  }

  // Get dealer's individual daily HQ lead limit
  // Get dealer's daily HQ limit by Dealer entity ID
  async getDealerDailyHqLimit(dealerEntityId: number): Promise<number> {
    const dealer = await this.userRepository.manager
      .createQueryBuilder(Dealer, 'dealer')
      .where('dealer.id = :dealerId', { dealerId: dealerEntityId })
      .getOne();

    if (!dealer) {
      throw new CustomError('Dealer not found', 404);
    }

    // Return the dealer's individual limit (default 0 = no HQ leads)
    return dealer.dailyHqLeadLimit ?? 0;
  }

  // Check if a dealer has reached their daily HQ lead limit (using per-dealer limits)
  // Note: This method expects Dealer entity ID, not User ID
  async checkHqLeadQuota(dealerEntityId: number): Promise<{ canAssign: boolean, assignedCount: number, dailyLimit: number }> {
    const dailyLimit = await this.getDealerDailyHqLimit(dealerEntityId);

    // If limit is 0, dealer gets no HQ leads
    if (dailyLimit === 0) {
      return { canAssign: false, assignedCount: 0, dailyLimit: 0 };
    }

    // If unlimited (-1), allow assignment
    if (dailyLimit === -1) {
      return { canAssign: true, assignedCount: 0, dailyLimit: -1 };
    }

    // Get today's date to check daily quota
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison

    // Count how many HQ leads have been assigned to this dealer today
    const assignedToday = await this.userRepository.manager
      .createQueryBuilder(HqLeadDistribution, 'hqLeadDistribution')
      .where('hqLeadDistribution.dealerId = :dealerId', { dealerId: dealerEntityId })
      .andWhere('hqLeadDistribution.assignedDate = :today', { today })
      .getCount();

    const canAssign = assignedToday < dailyLimit;

    return {
      canAssign,
      assignedCount: assignedToday,
      dailyLimit: dailyLimit
    };
  }

  // Record an HQ lead assignment for a dealer
  async recordHqLeadAssignment(dealerId: number, leadId: number): Promise<void> {
    const hqLeadDistribution = new HqLeadDistribution();
    hqLeadDistribution.dealerId = dealerId;
    hqLeadDistribution.leadId = leadId;
    hqLeadDistribution.assignedCount = 1;

    // Set to today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    hqLeadDistribution.assignedDate = today;

    await this.userRepository.manager.save(HqLeadDistribution, hqLeadDistribution);
  }

  // Assign an HQ lead to a dealer if they have quota available
  async assignHqLeadToDealer(leadId: number, dealerId: number): Promise<boolean> {
    const lead = await this.leadRepo.findOneBy({ id: leadId });
    if (!lead) {
      throw new CustomError('Lead not found', 404);
    }

    if (!lead.isHqLead) {
      throw new CustomError('Lead is not an HQ lead', 400);
    }

    const quotaCheck = await this.checkHqLeadQuota(dealerId);
    if (!quotaCheck.canAssign) {
      throw new CustomError(`Dealer has reached daily HQ lead limit. Limit: ${quotaCheck.dailyLimit}, Assigned: ${quotaCheck.assignedCount}`, 400);
    }

    // Record the assignment
    await this.recordHqLeadAssignment(dealerId, leadId);

    // Update the lead assignment
    lead.assigned_to = dealerId.toString();
    await this.leadRepo.save(lead);

    return true;
  }

  // Get all HQ lead settings
  async getAllHqLeadSettings() {
    return await this.userRepository.manager.find(HqLeadSettings);
  }

  // Create a new HQ lead setting
  async createHqLeadSetting(createHqLeadSettingsDto: UpdateHqLeadSettingsDto) {
    const existingSetting = await this.userRepository.manager
      .createQueryBuilder(HqLeadSettings, 'hqLeadSettings')
      .where('hqLeadSettings.packageTier = :packageTier', { packageTier: createHqLeadSettingsDto.packageTier })
      .getOne();

    if (existingSetting) {
      throw new CustomError('HQ Lead setting for this package tier already exists', 400);
    }

    const hqLeadSetting = new HqLeadSettings();
    hqLeadSetting.packageTier = createHqLeadSettingsDto.packageTier;
    hqLeadSetting.dailyLimit = createHqLeadSettingsDto.dailyLimit;
    hqLeadSetting.isActive = createHqLeadSettingsDto.isActive ?? true;

    return await this.userRepository.manager.save(HqLeadSettings, hqLeadSetting);
  }

  // Update an existing HQ lead setting
  async updateHqLeadSetting(packageTier: string, updateHqLeadSettingsDto: UpdateHqLeadSettingsDto) {
    const existingSetting = await this.userRepository.manager
      .createQueryBuilder(HqLeadSettings, 'hqLeadSettings')
      .where('hqLeadSettings.packageTier = :packageTier', { packageTier })
      .getOne();

    if (!existingSetting) {
      throw new CustomError('HQ Lead setting for this package tier not found', 404);
    }

    existingSetting.packageTier = updateHqLeadSettingsDto.packageTier;
    existingSetting.dailyLimit = updateHqLeadSettingsDto.dailyLimit;
    if (updateHqLeadSettingsDto.isActive !== undefined) {
      existingSetting.isActive = updateHqLeadSettingsDto.isActive;
    }

    return await this.userRepository.manager.save(HqLeadSettings, existingSetting);
  }

  // Reset daily HQ lead quotas for a specific dealer (admin function)
  async resetDealerHqLeadQuota(dealerId: number) {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Remove today's entries for the dealer (this will allow them to get new HQ leads)
    await this.userRepository.manager
      .createQueryBuilder()
      .delete()
      .from(HqLeadDistribution)
      .where('dealerId = :dealerId', { dealerId })
      .andWhere('assignedDate = :today', { today })
      .execute();

    return { message: `HQ lead quota for dealer ${dealerId} has been reset for today` };
  }

  // Update a dealer's daily HQ lead limit (admin function)
  async updateDealerHqLeadLimit(dealerId: number, dailyLimit: number) {
    const dealer = await this.userRepository.manager
      .createQueryBuilder(Dealer, 'dealer')
      .where('dealer.id = :dealerId', { dealerId })
      .getOne();

    if (!dealer) {
      throw new CustomError('Dealer not found', 404);
    }

    dealer.dailyHqLeadLimit = dailyLimit;
    await this.userRepository.manager.save(Dealer, dealer);

    return { 
      message: `HQ lead limit for dealer ${dealerId} updated to ${dailyLimit === -1 ? 'Unlimited' : dailyLimit}`,
      dealerId,
      dailyHqLeadLimit: dailyLimit
    };
  }

  // Get all dealers with their HQ lead limits and today's usage
  async getAllDealersHqLeadStatus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dealers = await this.userRepository.manager
      .createQueryBuilder(Dealer, 'dealer')
      .leftJoinAndSelect('dealer.user', 'user')
      .select([
        'dealer.id',
        'dealer.name',
        'dealer.dailyHqLeadLimit',
        'user.id',
        'user.name',
      ])
      .getMany();

    // Get today's assignment counts for all dealers
    const assignmentCounts = await this.userRepository.manager
      .createQueryBuilder(HqLeadDistribution, 'dist')
      .select('dist.dealerId', 'dealerId')
      .addSelect('COUNT(*)', 'count')
      .where('dist.assignedDate = :today', { today })
      .groupBy('dist.dealerId')
      .getRawMany();

    const countsMap = new Map(assignmentCounts.map((a: { dealerId: number; count: string }) => [a.dealerId, parseInt(a.count)]));

    return dealers.map(dealer => ({
      dealerId: dealer.id,
      dealerName: dealer.name,
      dailyHqLeadLimit: dealer.dailyHqLeadLimit,
      assignedToday: countsMap.get(dealer.id) || 0,
      canReceiveMore: dealer.dailyHqLeadLimit === -1 || 
        (dealer.dailyHqLeadLimit > 0 && (countsMap.get(dealer.id) || 0) < dealer.dailyHqLeadLimit)
    }));
  }

  // Get HQ quota for a dealer (converts User ID to Dealer entity ID)
  async getMyHqQuota(userId: number): Promise<{ canAssign: boolean, assignedCount: number, dailyLimit: number }> {
    // First, get the Dealer entity ID from the User ID
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['dealer'],
    });

    if (!user || !user.dealer) {
      throw new CustomError('Dealer profile not found', 404);
    }

    const dealerEntityId = user.dealer.id;

    // Now check the quota using Dealer entity ID
    return await this.checkHqLeadQuota(dealerEntityId);
  }

  // Get HQ leads assigned to a specific dealer (for dealer's view)
  // Note: userId here is the User ID (from JWT), not Dealer entity ID
  async getHqLeadsForDealer(userId: number) {
    // First, get the Dealer entity ID from the User ID
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['dealer'],
    });

    if (!user || !user.dealer) {
      throw new CustomError('Dealer profile not found', 404);
    }

    const dealerEntityId = user.dealer.id;

    // Now query for HQ leads assigned to this dealer (by Dealer entity ID)
    return await this.leadRepo.find({
      where: {
        isHqLead: true,
        assigned_to: dealerEntityId.toString(),
        is_deleted: false,
      },
      order: { createdAt: 'DESC' },
    });
  }
}
