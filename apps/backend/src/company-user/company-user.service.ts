import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyUserDto, UpdateCompanyUserDto } from '@crm/types';
import { CompanyUser } from './entities/company-user.entity';
import { Dealer } from 'src/user/entities';

@Injectable()
export class CompanyUserService {
  private readonly logger = new Logger(CompanyUserService.name);

  constructor(
    @InjectRepository(CompanyUser)
    private readonly companyUserRepo: Repository<CompanyUser>,
    @InjectRepository(Dealer)
    private readonly dealerRepo: Repository<Dealer>,
  ) {
    this.logger.log('🚀 CompanyUserService initialized');
  }

  async create(dto: CreateCompanyUserDto, dealerId: number): Promise<CompanyUser> {
        const dealer = await this.dealerRepo.findOne({
        where: { user: { id: dealerId } },
        relations: ['user'],
        });
    if (!dealer) throw new BadRequestException('Dealer not found');

    // Ensure dealer doesn't already have a linked company user
    const existing = await this.companyUserRepo.findOne({ where: { dealer_id: dealerId } });
    if (existing) throw new BadRequestException('Dealer already has a company user');

    const user = this.companyUserRepo.create({ ...dto, dealer });
    return this.companyUserRepo.save(user);
  }

  /**
   * Create default company user profile for a dealer
   * Called automatically during dealer registration
   */
  async createDefaultProfile(dealer: Dealer): Promise<CompanyUser> {
    this.logger.log(`📝 createDefaultProfile called for dealer ID: ${dealer.id}`);
    this.logger.debug(`Dealer details: ${JSON.stringify({
      id: dealer.id,
      name: dealer.name,
      contactEmail: dealer.contactEmail,
      hasUser: !!dealer.user,
      userEmail: dealer.user?.email
    })}`);

    try {
      // Check if default profile already exists
      const existing = await this.companyUserRepo.findOne({
        where: { dealer_id: dealer.id, is_default: true }
      });

      if (existing) {
        this.logger.warn(`⚠️ Default profile already exists for dealer ${dealer.id}`);
        return existing;
      }

      // Prepare profile data
      const email = dealer.contactEmail || dealer.user?.email || `default-${dealer.id}@company.local`;
      
      this.logger.log(`Creating default profile with data:`);
      this.logger.debug(JSON.stringify({
        name: dealer.name,
        email: email,
        phone: null,
        position: 'Owner',
        dealer_id: dealer.id,
        is_default: true,
      }, null, 2));

      const defaultProfile = this.companyUserRepo.create({
        name: dealer.name,
        email: email,
        phone: null,
        position: 'Owner',
        dealer_id: dealer.id,
        is_default: true,
      });

      this.logger.log(`💾 Saving default profile to database...`);
      const savedProfile = await this.companyUserRepo.save(defaultProfile);
      
      this.logger.log(`✅ Default profile created successfully! ID: ${savedProfile.id}`);
      this.logger.debug(`Saved profile: ${JSON.stringify(savedProfile)}`);
      
      return savedProfile;
    } catch (error) {
      this.logger.error(`❌ Error creating default profile for dealer ${dealer.id}:`);
      this.logger.error(error);
      if (error instanceof Error) {
        this.logger.error(`Error stack: ${error.stack}`);
      }
      throw error;
    }
  }

  async findAll(): Promise<CompanyUser[]> {
    return this.companyUserRepo.find({ relations: ['dealer'] });
  }

  async findOne(id: number): Promise<CompanyUser> {
    const user = await this.companyUserRepo.findOne({
      where: { id },
      relations: ['dealer'],
    });
    if (!user) throw new NotFoundException('Company user not found');
    return user;
  }

 async findByDealerId(dealerId: number) {
  this.logger.log(`🔍 findByDealerId called with dealerId: ${dealerId}`);
  
  try {
    // First, find the dealer by user ID
    this.logger.debug(`Looking up dealer with user.id = ${dealerId}`);
    const dealer = await this.dealerRepo.findOne({
      where: { user: { id: dealerId } },
      relations: ['user'],
    });

    if (!dealer) {
      this.logger.warn(`❌ No dealer found for user ID: ${dealerId}`);
      throw new NotFoundException(`No dealer found for user ID: ${dealerId}`);
    }

    this.logger.log(`✅ Found dealer: ID=${dealer.id}, Name=${dealer.name}`);

    // Now find company users by dealer.id (not user.id!)
    this.logger.debug(`Searching for company users with dealer_id = ${dealer.id}`);
    const users = await this.companyUserRepo.find({
      where: { dealer_id: dealer.id },
      relations: ['dealer'],
      order: { is_default: 'DESC', created_at: 'ASC' },
    });

    this.logger.log(`📊 Found ${users.length} company user(s) for dealer ${dealer.id}`);
    
    if (users.length > 0) {
      this.logger.debug(`Company users: ${JSON.stringify(users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        is_default: u.is_default
      })))}`);
    }

    if (!users.length) {
      this.logger.error(`❌ No company users found for dealer ${dealer.id} (user ${dealerId})`);
      
      // Debug: Check if ANY company users exist
      const allUsers = await this.companyUserRepo.count();
      this.logger.debug(`Total company users in database: ${allUsers}`);
      
      throw new NotFoundException('No company users found for this dealer');
    }

    return users;
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    this.logger.error(`❌ Error in findByDealerId:`, error);
    throw error;
  }
}


  async update(id: number, dto: UpdateCompanyUserDto): Promise<CompanyUser> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.companyUserRepo.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.companyUserRepo.remove(user);
  }
}
