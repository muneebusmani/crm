import {
  LeadStatus,
  type CreateDealerDto,
  type UpdateDealerDto,
  type UpdateUserDto,
  type CreateQuotationDto,
  type UpdateQuotationDto,
  UserType,
} from '@crm/types';
import { Injectable, NotFoundException } from '@nestjs/common';
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

    private readonly mailService: MailerService,
    private readonly configService: ConfigService, // 👈 inject here
  ) {}

  async createDealer(
    dto: Omit<CreateDealerDto, 'logo'>,
    logoFile?: Multer.File,
  ) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Save user
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);

    // Handle logo file
    let logoUrl = '';
    if (logoFile) {
      // Make filename URL-safe
      const ext = extname(logoFile.originalname); // e.g., .jpeg
      const baseName = basename(logoFile.originalname, ext) // removes extension
        .replace(/\s+/g, '-') // replace spaces
        .replace(/[^\w\-]/g, ''); // remove special chars

      const filename = `${Date.now()}-${baseName}${ext}`; // Add extension once

      // Save to public uploads folder (outside src)
      const uploadDir = join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uploadPath = join(uploadDir, filename);
      fs.writeFileSync(uploadPath, logoFile.buffer);

      logoUrl = `${process.env.BACKEND_URL}/uploads/${filename}`;
    }

    // Handle dealer tier
    let dealerTier: DealerTier | null = null;
    if (dto.tierId) {
      dealerTier = await this.dealerTierRepository.findOne({
        where: { id: dto.tierId },
      });
    }

    // Save dealer
    const dealer = this.dealerRepository.create({
      name: dto.name,
      owner: dto.owner,
      location: dto.location,
      logo: logoUrl, // store full URL
      website: dto.website,
      contactEmail: dto.contactEmail,
      tierId: dto.tierId,
      user: savedUser,
      tier: dealerTier || undefined,
    });

    await this.dealerRepository.save(dealer);

    // Return user with dealer relation
    return this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['dealer', 'dealer.tier'],
    });
  }

  async getAllDealers() {
    return await this.userRepository.find({
      where: {
        dealer: {
          id: undefined, // Find users who have a dealer relationship
        },
      },
      relations: ['dealer', 'dealer.tier'],
    });
  }

  async getDealerById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['dealer', 'dealer.tier'],
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
      relations: ['dealer', 'dealer.tier'],
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
      if (!dealer) {
        throw new Error('Dealer not found');
      }
      const lead = await this.leadRepository.findOne({
        where: { id: dto.leadId },
      });
      if (!lead) {
        throw new Error('Lead not found');
      }

      const quotation = this.quotationRepository.create({
        engineCodeName: lead.engine_code,
        dealershipName: dealer.name,
        quotationPrice: dto.quotationPrice,
        message: dto.message,
        subject: dto.subject,
        dealer,
        lead,
      });

      const result = await this.quotationRepository.save(quotation);
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
      await this.ensureDealerLead(
        dto.leadId,
        delaerId!,
        LeadStatus.QUOTATION_SENT,
      );
      await this.leadMessage(lead.id, dealer.id, dto.message);
      return result;
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

    return await this.dealerLeadRepository.save(dealerLead); // 👈 FIXED
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
