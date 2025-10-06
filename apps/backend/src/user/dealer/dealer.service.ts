import {
  LeadStatus,
  type CreateDealerDto,
  type UpdateDealerDto,
  type UpdateUserDto,
  type CreateQuotationDto,
  type UpdateQuotationDto,
  UserType,
} from '@crm/types';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { DealerTier } from '../entities/dealer-tier.entity';
import { User } from '../entities/user.entity';
import { Quotation } from '../../user/entities/quotation.entity';
import { Dealer } from '../../user/entities/dealer.entity'; // 👈 direct import is fine, but relation must be wrapped

import { CustomError } from 'src/common/custom-error';
import { MailerService } from '@nestjs-modules/mailer';
import path, { join, extname, basename } from 'path';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Lead } from 'src/leads/entities/lead.entity';
import { DealerLead } from '../entities/dealer-lead.entity';
import type { Multer } from 'multer';
import * as fs from 'fs';
import { LeadMessage } from 'src/leads-messages/entities/lead-message.entity';
import { LeadsGateway } from 'src/leads/leads.gateway';
import { DealerTierCredit } from '../entities/dealer-tier-credit.entity';

@Injectable()
export class DealerService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Dealer)
    private dealerRepository: Repository<Dealer>,

    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,

    @InjectRepository(DealerTier)
    private dealerTierRepository: Repository<DealerTier>,

    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,

    @InjectRepository(DealerLead)
    private readonly dealerLeadRepository: Repository<DealerLead>,

    @InjectRepository(LeadMessage)
    private leadMessageRepository: Repository<LeadMessage>,

    @InjectRepository(DealerTierCredit)
    private dealerTierCreditRepository: Repository<DealerTierCredit>,

    private readonly mailService: MailerService,
    private readonly configService: ConfigService, // 👈 inject here

    private readonly leadsGateway: LeadsGateway,
  ) {}

  // dealer.service.ts

  // async createDealer(dto: Omit<CreateDealerDto, 'logo'>, logoFile?: Multer.File) {
  //   const hashedPassword = await bcrypt.hash(dto.password, 10);

  //   // Create user
  //   const user = this.userRepository.create({
  //     name: dto.name,
  //     email: dto.email,
  //     username: dto.username,
  //     password: hashedPassword,
  //   });
  //   const savedUser = await this.userRepository.save(user);

  //   // Handle logo upload
  //   let logoUrl = '';
  //   if (logoFile) {
  //     const ext = extname(logoFile.originalname);
  //     const baseName = basename(logoFile.originalname, ext)
  //       .replace(/\s+/g, '-')
  //       .replace(/[^\w\-]/g, '');
  //     const filename = `${Date.now()}-${baseName}${ext}`;

  //     const uploadDir = join(process.cwd(), 'uploads');
  //     if (!fs.existsSync(uploadDir)) {
  //       fs.mkdirSync(uploadDir, { recursive: true });
  //     }
  //     fs.writeFileSync(join(uploadDir, filename), logoFile.buffer);
  //     logoUrl = `${process.env.BACKEND_URL}/uploads/${filename}`;
  //   }

  //   // Find tier with credits
  //   const dealerTier = await this.dealerTierRepository.findOne({
  //     where: { id: dto.tierId },
  //     relations: ['dealerTierCredits'],
  //   });
  //   if (!dealerTier) throw new BadRequestException('Invalid dealer tier');

  //   // Get default credit config
  //   const tierCredit =
  //     dealerTier.dealerTierCredits.length > 0
  //       ? dealerTier.dealerTierCredits[0]
  //       : null;
  //   if (!tierCredit)
  //     throw new BadRequestException('Tier has no credit configuration');

  //   // Create dealer with credits from dealer_tier_credit table
  //   const dealer = this.dealerRepository.create({
  //     name: dto.name,
  //     owner: dto.owner,
  //     location: dto.location,
  //     logo: logoUrl,
  //     website: dto.website,
  //     contactEmail: dto.contactEmail,
  //     tierId: dto.tierId,
  //     credits: tierCredit.credit, // ✅ matches Dealer entity
  //     user: savedUser, // ✅ one-to-one with User
  //   });

  //   await this.dealerRepository.save(dealer);

  //   return this.userRepository.findOne({
  //     where: { id: savedUser.id },
  //     relations: ['dealer'],
  //   });
  // }

  async createDealer(
    dto: Omit<CreateDealerDto, 'logo'>,
    logoFile?: Multer.File,
  ) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 1 Create user
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);

    // 2 Handle logo upload
    let logoUrl = '';
    if (logoFile) {
      const ext = extname(logoFile.originalname);
      const baseName = basename(logoFile.originalname, ext)
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '');
      const filename = `${Date.now()}-${baseName}${ext}`;

      const uploadDir = join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(join(uploadDir, filename), logoFile.buffer);
      logoUrl = `${process.env.BACKEND_URL}/uploads/${filename}`;
    }

    // 3 Find tier
    const dealerTier = await this.dealerTierRepository.findOne({
      where: { id: dto.tierId },
      relations: ['dealerTierCredits'],
    });
    if (!dealerTier) throw new BadRequestException('Invalid dealer tier');

    // 4 Determine starting credit
    let credit = dealerTier.creditLimit; // fallback
    if (dealerTier.dealerTierCredits.length > 0) {
      credit = dealerTier.dealerTierCredits[0].credit;
    }

    // 5 Create dealer
    const dealer = this.dealerRepository.create({
      name: dto.name,
      owner: dto.owner,
      location: dto.location,
      logo: logoUrl,
      website: dto.website,
      contactEmail: dto.contactEmail,
      tierId: dto.tierId,
      credits: credit,
      user: savedUser,
    });

    const savedDealer = await this.dealerRepository.save(dealer);

    // 6 Insert dealer_tier_credit record for tracking
    const dealerTierCredit = this.dealerTierCreditRepository.create({
      dealerId: savedDealer.id,
      tierId: dealerTier.id,
      credit: credit,
    });
    await this.dealerTierCreditRepository.save(dealerTierCredit);

    // 7 Return dealer with relations
    return this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: [
        'dealer',
        'dealer.dealerTierCredits', // ✅ belongs to Dealer, not User
      ],
    });
  }

  async getAllDealers() {
    return await this.userRepository.find({
      where: {
        dealer: {
          id: undefined, // Find users who have a dealer relationship
        },
      },
      relations: ['dealer', 'dealer.dealerTierCredits.tier'],
    });
  }

  async getDealerById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['dealer', 'dealer.dealerTierCredits.tier'],
    });

    if (!user || !user.dealer) {
      throw new NotFoundException('Dealer not found');
    }

    return user;
  }

  async updateDealer(id: number, dto: UpdateDealerDto, logoFile?: Multer.File) {
    // Check if user exists and has dealer
    const existingUser = await this.userRepository.findOne({
      where: { id },
      relations: ['dealer'],
    });

    if (!existingUser || !existingUser.dealer) {
      throw new NotFoundException('Dealer not found');
    }

    // Update user fields
    const updateUser: Partial<UpdateUserDto> = {};
    if (dto.name !== undefined) updateUser.name = dto.name;
    if (dto.email !== undefined) updateUser.email = dto.email;
    if (dto.username !== undefined) updateUser.username = dto.username;
    if (dto.password && dto.password.trim() !== '') {
      updateUser.password = await bcrypt.hash(dto.password, 10);
    }

    if (Object.keys(updateUser).length > 0) {
      await this.userRepository.update(id, updateUser);
    }

    // Handle logo file upload
    let logoUrl = existingUser.dealer.logo; // keep existing if no new file
    if (logoFile) {
      const safeName = logoFile.originalname
        .replace(/\s+/g, '-')
        .replace(/[^\w\-\.]/g, '');
      const filename = `${Date.now()}-${safeName}${extname(logoFile.originalname)}`;

      const uploadDir = join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uploadPath = join(uploadDir, filename);
      fs.writeFileSync(uploadPath, logoFile.buffer);

      logoUrl = `${process.env.BACKEND_URL}/uploads/${filename}`;
    }

    // Update dealer fields
    const updateDealer: Partial<UpdateDealerDto> = {};
    if (dto.name !== undefined) updateDealer.name = dto.name;
    if (dto.owner !== undefined) updateDealer.owner = dto.owner;
    if (dto.location !== undefined) updateDealer.location = dto.location;
    if (dto.website !== undefined) updateDealer.website = dto.website;
    if (dto.contactEmail !== undefined)
      updateDealer.contactEmail = dto.contactEmail;
    if (dto.tierId !== undefined) updateDealer.tierId = dto.tierId;
    updateDealer['logo'] = logoUrl;

    if (Object.keys(updateDealer).length > 0) {
      await this.dealerRepository.update(existingUser.dealer.id, updateDealer);
    }

    // Return updated user with dealer relation
    return this.userRepository.findOne({
      where: { id },
      relations: ['dealer', 'dealer.dealerTierCredits.tier'],
    });
  }

  async deleteDealer(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['dealer'],
    });

    if (!user || !user.dealer) {
      throw new NotFoundException('Dealer not found');
    }

    // Delete dealer record first (due to foreign key constraint)
    await this.dealerRepository.delete(user.dealer.id);

    // Then delete user
    return await this.userRepository.delete(id);
  }

  async createQuotation(dto: CreateQuotationDto, delaerId: number) {
    try {
      const dealer = await this.userRepository.findOne({
        where: { id: delaerId },
      });
      console.log('Step 1');
      if (!dealer) {
        throw new Error('Dealer not found');
      }
      console.log('Step 2');
      const lead = await this.leadRepository.findOne({
        where: { id: dto.leadId },
      });
      console.log('Step 3');
      if (!lead) {
        throw new Error('Lead not found');
      }
      console.log('Step 4');

      const quotation = this.quotationRepository.create({
        engineCodeName: lead.engine_code,
        dealershipName: dealer.name,
        quotationPrice: dto.quotationPrice,
        message: dto.message,
        subject: dto.subject,
        dealer,
        lead,
      });
      console.log('Step 5');

      const result = await this.quotationRepository.save(quotation);

      console.log('Step 6');

      this.mailService.sendMail({
        to: lead.email, // 👈 you must have dealer.email field
        subject: 'New Quotation Created',
        template: 'quotation', // file: templates/quotation.hbs
        context: {
          dealershipName: dealer.name,
          engineCodeName: result.engineCodeName,
          quotationId: result.id,
          quotationPrice: result.quotationPrice,
          message: result.message,
        },
      });
      console.log('Step 7');

      await this.ensureDealerLead(
        dto.leadId,
        delaerId!,
        LeadStatus.QUOTATION_SENT,
      );
      console.log('Step 8');

      return result;
    } catch (error: unknown) {
      throw new CustomError('Unable to create lead' + error);
    }
  }

  async fetchQuotations(leadId: number, delaerId: number) {
    try {
      const dealer = await this.userRepository.findOne({
        where: { id: delaerId },
      });

      if (!dealer) {
        throw new Error('Dealer not found');
      }
      const lead = await this.leadRepository.findOne({
        where: { id: leadId },
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      const quotations = await this.quotationRepository.find({
        where: {
          dealer: { id: delaerId },
          lead: { id: leadId },
        },
      });

      if (!quotations) {
        throw new Error('Quotations not found');
      }
      return quotations;
    } catch (error: unknown) {
      throw new CustomError('Unable to create lead' + error);
    }
  }

  async forgotPassword(email: string) {
    const dealer = await this.userRepository.findOne({
      where: { email: email, type: UserType.DEALER },
    });
    if (!dealer) throw new NotFoundException('Dealer not found'); // don't reveal
    try {
      const token = crypto.randomBytes(32).toString('hex');
      dealer.resetPasswordToken = token;
      dealer.resetPasswordExpires = new Date(Date.now() + 3600 * 1000); // 1h expiry
      await this.userRepository.save(dealer);

      const resetLink = `${this.configService.get('FRONTEND_URL')}/reset-password/${token}`;
      this.mailService.sendMail({
        to: email,
        subject: 'Reset your password',
        template: 'forgot-password', // templates/forgot-password.hbs
        context: {
          dealershipName: dealer.name,
          resetLink,
        },
      });
      return dealer;
    } catch (error: unknown) {
      throw new CustomError('Unable to forgot password');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const dealer = await this.userRepository.findOne({
        where: {
          resetPasswordToken: token,
          type: UserType.DEALER, // ✅ ensure it's a dealer
        },
      });

      if (
        !dealer ||
        !dealer.resetPasswordExpires ||
        dealer.resetPasswordExpires < new Date()
      ) {
        throw new Error('Invalid or expired token');
      }

      dealer.password = await bcrypt.hash(newPassword, 10);
      dealer.resetPasswordToken = null;
      dealer.resetPasswordExpires = null;
      return await this.userRepository.save(dealer);
    } catch (error: unknown) {
      throw new CustomError('Unable to reset password');
    }
  }

  async getLeadById(leadId: number, dealerId: number) {
    try {
      const lead = await this.leadRepository.findOneBy({ id: leadId });
      if (!lead) throw new CustomError(`Lead with ID ${leadId} not found`, 404);

      // Call pivot helper function
      await this.ensureDealerLead(leadId, dealerId, LeadStatus.OPEN);

      return lead;
    } catch (error: unknown) {
      if (error instanceof CustomError) throw error;
      console.log(error);
      throw new CustomError('Unable to fetch lead');
    }
  }

  /**
   * Ensure dealer_leads pivot entry exists for dealer+lead.
   * If not, create it with status=open.
   */
  private async ensureDealerLead(
    leadId: number,
    dealerId: number,
    status: string,
  ) {
    // check if already exists

    const existing = await this.dealerLeadRepository.findOne({
      where: { dealer: { id: dealerId }, lead: { id: leadId }, status: status },
      relations: ['dealer', 'lead'],
    });

    if (existing) return existing; // already linked

    // fetch dealer + lead (only ids needed)
    const dealer = await this.userRepository.findOneBy({ id: dealerId });
    if (!dealer)
      throw new CustomError(`Dealer with ID ${dealerId} not found`, 404);

    const lead = await this.leadRepository.findOneBy({ id: leadId });
    if (!lead) throw new CustomError(`Lead with ID ${leadId} not found`, 404);

    // create new pivot entry
    const dealerLead = this.dealerLeadRepository.create({
      dealer,
      lead,
      status: status,
    });

    const result = await this.dealerLeadRepository.save(dealerLead); // 👈 FIXED
    lead.status = status;
    this.leadsGateway.emitUpdateLead(lead);
    return result;
  }

  private async leadMessage(leadId: number, dealerId: number, content: string) {
    // check if already exists

    const existing = await this.leadMessageRepository.findOne({
      where: { dealer: { id: dealerId }, lead: { id: leadId } },
      relations: ['dealer', 'lead'],
    });

    if (existing) return existing; // already linked

    // fetch dealer + lead (only ids needed)
    const dealer = await this.userRepository.findOneBy({ id: dealerId });
    if (!dealer)
      throw new CustomError(`Dealer with ID ${dealerId} not found`, 404);

    const lead = await this.leadRepository.findOneBy({ id: leadId });
    if (!lead) throw new CustomError(`Lead with ID ${leadId} not found`, 404);

    const message = this.leadMessageRepository.create({
      content: content,
      dealer,
      lead,
    });
    return await this.leadMessageRepository.save(message);
  }
}
