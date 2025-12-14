import type { CreateLeadDto, UpdateLeadDto } from '@crm/types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityLogger } from 'src/common/activity-log.subscriber';
import { Repository } from 'typeorm';
import { CustomError } from '../common/custom-error';
import { AppLogger } from '../common/logger.service';
import { Lead } from './entities/lead.entity';
import { User, DealerTier, Dealer } from 'src/user/entities';
import { VehicleDetails } from './entities/vehicle-details.entity';
import {
  HqLeadDistribution,
  HqLeadSettings,
  HqLeadVisibility,
} from './entities';

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

      // If this is an HQ lead, automatically distribute to eligible dealers
      if (result.isHqLead) {
        const distributedCount = await this.autoDistributeHqLead(result.id);
        this.logger.log(
          `Auto-distributed HQ lead ${result.id} to ${distributedCount} dealers`,
          'LeadsService',
        );
      }

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

  // Get dealer's effective HQ quota considering custom override and tier default
  // Priority: customHqQuota > tier.hqLeadQuota
  async getEffectiveHqQuota(dealerEntityId: number): Promise<number> {
    const dealer = await this.userRepository.manager
      .createQueryBuilder(Dealer, 'dealer')
      .leftJoinAndSelect('dealer.tier', 'tier')
      .where('dealer.id = :dealerId', { dealerId: dealerEntityId })
      .getOne();

    if (!dealer) {
      throw new CustomError('Dealer not found', 404);
    }

    // Priority: Custom override > Tier default > 0 (no access)
    if (dealer.customHqQuota !== null && dealer.customHqQuota !== undefined) {
      return dealer.customHqQuota;
    }

    // Get tier quota
    if (dealer.tier?.hqLeadQuota !== undefined) {
      return dealer.tier.hqLeadQuota;
    }

    // Default to 0 (no HQ leads) if no tier or custom quota set
    return 0;
  }

  // Legacy alias for backwards compatibility
  async getDealerDailyHqLimit(dealerEntityId: number): Promise<number> {
    return this.getEffectiveHqQuota(dealerEntityId);
  }

  // Get today's HQ lead visibility count for a dealer
  async getTodayHqLeadCount(dealerEntityId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.userRepository.manager
      .createQueryBuilder(HqLeadVisibility, 'v')
      .where('v.dealerId = :dealerId', { dealerId: dealerEntityId })
      .andWhere('v.assignedDate = :today', { today })
      .getCount();
  }

  // Check if a dealer has reached their daily HQ lead quota (using tier-based limits)
  // Note: This method expects Dealer entity ID, not User ID
  async checkHqLeadQuota(dealerEntityId: number): Promise<{
    canAssign: boolean;
    assignedCount: number;
    dailyLimit: number;
  }> {
    const dailyLimit = await this.getEffectiveHqQuota(dealerEntityId);

    // If limit is 0, dealer gets no HQ leads
    if (dailyLimit === 0) {
      return { canAssign: false, assignedCount: 0, dailyLimit: 0 };
    }

    // If unlimited (-1), allow assignment
    if (dailyLimit === -1) {
      const assignedToday = await this.getTodayHqLeadCount(dealerEntityId);
      return { canAssign: true, assignedCount: assignedToday, dailyLimit: -1 };
    }

    // Count how many HQ leads are visible to this dealer today (using new 1:Many table)
    const assignedToday = await this.getTodayHqLeadCount(dealerEntityId);
    const canAssign = assignedToday < dailyLimit;

    return {
      canAssign,
      assignedCount: assignedToday,
      dailyLimit: dailyLimit,
    };
  }

  // Record an HQ lead visibility for a dealer (legacy wrapper)
  // Deprecated: Use createHqVisibility instead
  async recordHqLeadAssignment(
    dealerId: number,
    leadId: number,
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create visibility record in new table
    try {
      await this.userRepository.manager.insert(HqLeadVisibility, {
        leadId,
        dealerId,
        assignedDate: today,
        isManualOverride: true, // Manual assignments are overrides
      });
    } catch (error) {
      // Ignore duplicate key errors
      if ((error as any).code !== '23505') throw error;
    }
  }

  // Assign an HQ lead to a dealer if they have quota available
  // This uses the new 1:Many visibility system
  async assignHqLeadToDealer(
    leadId: number,
    dealerId: number,
  ): Promise<boolean> {
    const lead = await this.leadRepo.findOneBy({ id: leadId });
    if (!lead) {
      throw new CustomError('Lead not found', 404);
    }

    if (!lead.isHqLead) {
      throw new CustomError('Lead is not an HQ lead', 400);
    }

    const quotaCheck = await this.checkHqLeadQuota(dealerId);
    if (!quotaCheck.canAssign) {
      throw new CustomError(
        `Dealer has reached daily HQ lead quota. Limit: ${quotaCheck.dailyLimit}, Assigned: ${quotaCheck.assignedCount}`,
        400,
      );
    }

    // Create visibility record (manual assignment bypasses quota)
    await this.recordHqLeadAssignment(dealerId, leadId);

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
      .where('hqLeadSettings.packageTier = :packageTier', {
        packageTier: createHqLeadSettingsDto.packageTier,
      })
      .getOne();

    if (existingSetting) {
      throw new CustomError(
        'HQ Lead setting for this package tier already exists',
        400,
      );
    }

    const hqLeadSetting = new HqLeadSettings();
    hqLeadSetting.packageTier = createHqLeadSettingsDto.packageTier;
    hqLeadSetting.dailyLimit = createHqLeadSettingsDto.dailyLimit;
    hqLeadSetting.isActive = createHqLeadSettingsDto.isActive ?? true;

    return await this.userRepository.manager.save(
      HqLeadSettings,
      hqLeadSetting,
    );
  }

  // Update an existing HQ lead setting
  async updateHqLeadSetting(
    packageTier: string,
    updateHqLeadSettingsDto: UpdateHqLeadSettingsDto,
  ) {
    const existingSetting = await this.userRepository.manager
      .createQueryBuilder(HqLeadSettings, 'hqLeadSettings')
      .where('hqLeadSettings.packageTier = :packageTier', { packageTier })
      .getOne();

    if (!existingSetting) {
      throw new CustomError(
        'HQ Lead setting for this package tier not found',
        404,
      );
    }

    existingSetting.packageTier = updateHqLeadSettingsDto.packageTier;
    existingSetting.dailyLimit = updateHqLeadSettingsDto.dailyLimit;
    if (updateHqLeadSettingsDto.isActive !== undefined) {
      existingSetting.isActive = updateHqLeadSettingsDto.isActive;
    }

    return await this.userRepository.manager.save(
      HqLeadSettings,
      existingSetting,
    );
  }

  // Reset daily HQ lead visibility for a specific dealer (admin function)
  // This removes today's visibility entries, allowing the dealer to receive new HQ leads
  async resetDealerHqLeadQuota(dealerId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Remove today's visibility entries (excluding manual overrides)
    await this.userRepository.manager
      .createQueryBuilder()
      .delete()
      .from(HqLeadVisibility)
      .where('dealerId = :dealerId', { dealerId })
      .andWhere('assignedDate = :today', { today })
      .andWhere('isManualOverride = false')
      .execute();

    return {
      message: `HQ lead quota for dealer ${dealerId} has been reset for today`,
    };
  }

  // Update a dealer's custom HQ lead quota override (admin function)
  // NULL = use tier default, -1 = unlimited, 0 = none, positive = specific limit
  async updateDealerHqLeadLimit(dealerId: number, dailyLimit: number | null) {
    const dealer = await this.userRepository.manager
      .createQueryBuilder(Dealer, 'dealer')
      .where('dealer.id = :dealerId', { dealerId })
      .getOne();

    if (!dealer) {
      throw new CustomError('Dealer not found', 404);
    }

    dealer.customHqQuota = dailyLimit;
    await this.userRepository.manager.save(Dealer, dealer);

    return {
      message: `HQ lead quota for dealer ${dealerId} updated to ${dailyLimit === null ? 'Tier Default' : dailyLimit === -1 ? 'Unlimited' : dailyLimit}`,
      dealerId,
      customHqQuota: dailyLimit,
    };
  }

  // Get all dealers with their HQ lead quotas (tier + custom) and today's usage
  async getAllDealersHqLeadStatus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dealers = await this.userRepository.manager
      .createQueryBuilder(Dealer, 'dealer')
      .leftJoinAndSelect('dealer.user', 'user')
      .leftJoinAndSelect('dealer.tier', 'tier')
      .select([
        'dealer.id',
        'dealer.name',
        'dealer.customHqQuota',
        'dealer.tierId',
        'tier.id',
        'tier.name',
        'tier.hqLeadQuota',
        'user.id',
        'user.name',
      ])
      .getMany();

    // Get today's visibility counts for all dealers (using new 1:Many table)
    const assignmentCounts = await this.userRepository.manager
      .createQueryBuilder(HqLeadVisibility, 'v')
      .select('v.dealerId', 'dealerId')
      .addSelect('COUNT(*)', 'count')
      .where('v.assignedDate = :today', { today })
      .groupBy('v.dealerId')
      .getRawMany();

    const countsMap = new Map(
      assignmentCounts.map((a: { dealerId: number; count: string }) => [
        a.dealerId,
        parseInt(a.count),
      ]),
    );

    return dealers.map((dealer) => {
      // Calculate effective quota: customHqQuota > tier.hqLeadQuota > 0
      const effectiveQuota =
        dealer.customHqQuota !== null && dealer.customHqQuota !== undefined
          ? dealer.customHqQuota
          : (dealer.tier?.hqLeadQuota ?? 0);

      const assignedToday = countsMap.get(dealer.id) || 0;

      return {
        dealerId: dealer.id,
        dealerName: dealer.name,
        tierName: dealer.tier?.name || 'No Tier',
        tierQuota: dealer.tier?.hqLeadQuota ?? 0,
        customQuota: dealer.customHqQuota,
        effectiveQuota,
        assignedToday,
        canReceiveMore:
          effectiveQuota === -1 ||
          (effectiveQuota > 0 && assignedToday < effectiveQuota),
      };
    });
  }

  // Get HQ quota for a dealer (converts User ID to Dealer entity ID)
  async getMyHqQuota(userId: number): Promise<{
    canAssign: boolean;
    assignedCount: number;
    dailyLimit: number;
  }> {
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

  // Get HQ leads visible to a specific dealer (for dealer's view)
  // Uses the new 1:Many HqLeadVisibility table
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

    // Query HQ leads visible to this dealer via HqLeadVisibility join table
    const visibleLeads = await this.userRepository.manager
      .createQueryBuilder(Lead, 'lead')
      .innerJoin('lead.hqVisibility', 'v', 'v.dealerId = :dealerId', {
        dealerId: dealerEntityId,
      })
      .where('lead.isHqLead = true')
      .andWhere('lead.is_deleted = false')
      .orderBy('lead.createdAt', 'DESC')
      .getMany();

    return visibleLeads;
  }

  // Create HQ lead visibility record (helper method)
  // Used by auto-distribution and manual assignment
  private async createHqVisibility(
    leadId: number,
    dealerId: number,
    date: Date,
    isManualOverride: boolean,
  ): Promise<void> {
    try {
      await this.userRepository.manager.insert(HqLeadVisibility, {
        leadId,
        dealerId,
        assignedDate: date,
        isManualOverride,
      });
    } catch (error) {
      // Ignore duplicate key errors (already visible)
      if ((error as any).code !== '23505') throw error;
    }
  }

  // Automatically distribute an HQ lead to all eligible dealers based on their tier quotas
  // Called when a new HQ lead is created
  async autoDistributeHqLead(leadId: number): Promise<number> {
    const lead = await this.leadRepo.findOneBy({ id: leadId });
    if (!lead || !lead.isHqLead) {
      return 0;
    }

    // Get all active dealers with their tiers
    const dealers = await this.userRepository.manager
      .createQueryBuilder(Dealer, 'dealer')
      .leftJoinAndSelect('dealer.tier', 'tier')
      .getMany();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let assignedCount = 0;

    for (const dealer of dealers) {
      // Calculate effective quota: customHqQuota > tier.hqLeadQuota > 0
      const quota =
        dealer.customHqQuota !== null && dealer.customHqQuota !== undefined
          ? dealer.customHqQuota
          : (dealer.tier?.hqLeadQuota ?? 0);

      // Skip dealers with no HQ access
      if (quota === 0) continue;

      // Unlimited (-1) or check quota
      if (quota === -1) {
        await this.createHqVisibility(leadId, dealer.id, today, false);
        assignedCount++;
        continue;
      }

      // Check daily quota
      const assignedToday = await this.getTodayHqLeadCount(dealer.id);
      if (assignedToday < quota) {
        await this.createHqVisibility(leadId, dealer.id, today, false);
        assignedCount++;
      }
    }

    return assignedCount;
  }

  // Manually assign an HQ lead to a dealer (admin function)
  // This bypasses quota limits and sets isManualOverride = true
  async manuallyAssignHqLead(
    leadId: number,
    dealerId: number,
  ): Promise<boolean> {
    const lead = await this.leadRepo.findOneBy({ id: leadId });
    if (!lead) throw new CustomError('Lead not found', 404);
    if (!lead.isHqLead) throw new CustomError('Lead is not an HQ lead', 400);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.createHqVisibility(leadId, dealerId, today, true);
    return true;
  }
}
