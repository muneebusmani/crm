import {
  type CreateDealerDto,
  type UpdateDealerDto,
  type UpdateUserDto,
  type CreateQuotationDto,
  type UpdateQuotationDto,
  UserType
} from '@crm/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { DealerTier } from '../entities/dealer-tier.entity';
import { User } from '../entities/user.entity';
import { Quotation } from '../../user/entities/quotation.entity';
import { Dealer } from '../../user/entities/dealer.entity';  // 👈 direct import is fine, but relation must be wrapped

import { CustomError } from 'src/common/custom-error';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Lead } from 'src/leads/entities/lead.entity';
import { DealerLead } from '../entities/dealer-lead.entity';

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
    
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,   // 👈 inject here


  ) { }

  async createDealer(dto: CreateDealerDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user first
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Create dealer record
    let dealerTier: DealerTier | null = null;
    if (dto.tierId) {
      dealerTier = await this.dealerTierRepository.findOne({
        where: { id: dto.tierId },
      });
    }

    const dealer = this.dealerRepository.create({
      name: dto.name,
      owner: dto.owner,
      location: dto.location,
      logo: dto.logo,
      website: dto.website,
      contactEmail: dto.contactEmail,
      tierId: dto.tierId,
      user: savedUser,
      tier: dealerTier || undefined,
    });

    await this.dealerRepository.save(dealer);

    // Return user with dealer relationship
    return await this.userRepository.findOne({
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

  async updateDealer(id: number, dto: UpdateDealerDto) {
    // Check if user exists and is dealer
    const existingUser = await this.userRepository.findOne({
      where: { id },
      relations: ['dealer'],
    });

    if (!existingUser || !existingUser.dealer) {
      throw new NotFoundException('Dealer not found');
    }

    // Update user fields
    const updateUser = {} as UpdateUserDto;
    if (dto.name !== undefined) updateUser.name = dto.name;
    if (dto.email !== undefined) updateUser.email = dto.email;
    if (dto.username !== undefined) updateUser.username = dto.username;

    if (dto.password && dto.password.trim() !== '') {
      updateUser.password = await bcrypt.hash(dto.password, 10);
    }

    if (Object.keys(updateUser).length > 0) {
      await this.userRepository.update(id, updateUser);
    }

    // Update dealer fields
    const updateDealer = {} as UpdateDealerDto;
    if (dto.name !== undefined) updateDealer.name = dto.name;
    if (dto.owner !== undefined) updateDealer.owner = dto.owner;
    if (dto.location !== undefined) updateDealer.location = dto.location;
    if (dto.logo !== undefined) updateDealer.logo = dto.logo;
    if (dto.website !== undefined) updateDealer.website = dto.website;
    if (dto.contactEmail !== undefined)
      updateDealer.contactEmail = dto.contactEmail;
    if (dto.tierId !== undefined) updateDealer.tierId = dto.tierId;

    if (Object.keys(updateDealer).length > 0) {
      await this.dealerRepository.update(existingUser.dealer.id, updateDealer);
    }

    // Return updated user with dealer relationship
    return await this.userRepository.findOne({
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

  async createQuotation(dto: CreateQuotationDto) {
    try {
      const dealer = await this.dealerRepository.findOne({ where: { id: dto.dealerId } });
      if (!dealer) {
        throw new Error('Dealer not found');
      }
      const quotation = this.quotationRepository.create({
        ...dto,
        dealer,
      });
      const result = await this.quotationRepository.save(quotation);
      this.mailService.sendMail({
        to: "alamhamza873@gmail.com", // 👈 you must have dealer.email field
        subject: 'New Quotation Created',
        template: 'quotation', // file: templates/quotation.hbs
        context: {
          dealershipName: dealer.name,
          engineCodeName: result.engineCodeName,
          quotationId: result.id,
          quotationPrice: result.quotationPrice,
          message: result.message
        },
      });
      return result;
    }
    catch (error: unknown) {
      throw new CustomError('Unable to create lead');
    }
  }

  async forgotPassword(email: string) {
    const dealer = await this.userRepository.findOne({ where: { email : email,  type: UserType.DEALER } });
    if (!dealer) throw new  NotFoundException("Dealer not found"); // don't reveal
    try {
      const token = crypto.randomBytes(32).toString('hex');
      dealer.resetPasswordToken = token;
      dealer.resetPasswordExpires = new Date(Date.now() + 3600 * 1000); // 1h expiry
      await this.userRepository.save(dealer);

      const resetLink = `${this.configService.get('FRONTEND_URL')}/reset-password/${token}`;
       this.mailService.sendMail({
        to: "alamhamza873@gmail.com",
        subject: 'Reset your password',
        template: 'forgot-password', // templates/forgot-password.hbs
        context: {
          dealershipName: dealer.name,
          resetLink,
        },
      });
      return dealer;
    }
    catch (error: unknown) {
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


      if (!dealer || !dealer.resetPasswordExpires || dealer.resetPasswordExpires < new Date()) {
        throw new Error('Invalid or expired token');
      }

      dealer.password = await bcrypt.hash(newPassword, 10);
      dealer.resetPasswordToken = null;
      dealer.resetPasswordExpires = null;
      return await this.userRepository.save(dealer);
    }
    catch (error: unknown) {
      throw new CustomError('Unable to reset password');
    }
  }

 async getLeadById(leadId: number, dealerId: number) {
  try {
    const lead = await this.leadRepository.findOneBy({ id: leadId });
    if (!lead) throw new CustomError(`Lead with ID ${leadId} not found`, 404);

    // Call pivot helper function
    await this.ensureDealerLead(leadId, dealerId);

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
private async ensureDealerLead(leadId: number, dealerId: number) {
  // check if already exists
  const existing = await this.dealerLeadRepository.findOne({
    where: { dealer: { id: dealerId }, lead: { id: leadId } },
    relations: ['dealer', 'lead'],
  });

  if (existing) return existing; // already linked

  // fetch dealer + lead (only ids needed)
  const dealer = await this.userRepository.findOneBy({ id: dealerId });
  if (!dealer) throw new CustomError(`Dealer with ID ${dealerId} not found`, 404);

  const lead = await this.leadRepository.findOneBy({ id: leadId });
  if (!lead) throw new CustomError(`Lead with ID ${leadId} not found`, 404);

  // create new pivot entry
  const dealerLead = this.dealerLeadRepository.create({
    dealer,
    lead,
    status: 'open',
  });

  return await this.dealerLeadRepository.save(dealerLead); // 👈 FIXED
}



}
