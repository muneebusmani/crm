import {
  LeadStatus,
  type CreateDealerDto,
  type UpdateDealerDto,
  type UpdateUserDto,
  type CreateQuotationDto,
  type UpdateQuotationDto,
  UserType,
} from "@crm/types";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { DealerTier } from "../entities/dealer-tier.entity";
import { User } from "../entities/user.entity";
// import { Quotation } from '../../user/entities/quotation.entity';
import { Dealer } from "../../user/entities/dealer.entity"; // 👈 direct import is fine, but relation must be wrapped

import { CustomError } from "src/common/custom-error";
import { MailerService } from "@nestjs-modules/mailer";
import path, { join, extname, basename } from "path";
import * as crypto from "crypto";
import { ConfigService } from "@nestjs/config";
import { Lead } from "src/leads/entities/lead.entity";
import { DealerLead } from "../entities/dealer-lead.entity";
import type { Multer } from "multer";
import * as fs from "fs";
import { LeadMessage } from "src/leads-messages/entities/lead-message.entity";
import { LeadsGateway } from "src/leads/leads.gateway";
import { DealerTierCredit } from "../entities/dealer-tier-credit.entity";
// import { QuotationItem } from '../entities/quotation-item.entity';
import { BusinessSetting } from "src/business-setting/entities/business-setting.entity";
import { CompanyUserService } from "src/company-user/company-user.service";
import { Logger } from "@nestjs/common";
import { SupabaseStorageService } from "src/common/supabase-storage.service";

@Injectable()
export class DealerService {
  private readonly logger = new Logger(DealerService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Dealer)
    private dealerRepository: Repository<Dealer>,

    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,

    @InjectRepository(DealerTier)
    private dealerTierRepository: Repository<DealerTier>,
    //
    // @InjectRepository(Quotation)
    // private readonly quotationRepository: Repository<Quotation>,

    @InjectRepository(DealerLead)
    private readonly dealerLeadRepository: Repository<DealerLead>,

    @InjectRepository(LeadMessage)
    private leadMessageRepository: Repository<LeadMessage>,

    @InjectRepository(DealerTierCredit)
    private dealerTierCreditRepository: Repository<DealerTierCredit>,

    // @InjectRepository(QuotationItem)
    // private readonly quotationItemRepository: Repository<QuotationItem>,

    @InjectRepository(BusinessSetting)
    private readonly businessSettingRepository: Repository<BusinessSetting>,

    private readonly mailService: MailerService,
    private readonly configService: ConfigService, // 👈 inject here

    private readonly leadsGateway: LeadsGateway,

    private readonly companyUserService: CompanyUserService, // 👈 Inject CompanyUserService

    private readonly supabaseStorageService: SupabaseStorageService, // 👈 Inject Supabase Storage
  ) {}

  /**
   * Helper method to convert Supabase Storage paths to signed URLs
   * @param logoPath The logo path from database
   * @returns Signed URL if it's a Supabase path, or original URL
   */
  private async convertLogoToSignedUrl(
    logoPath: string | null,
  ): Promise<string | null> {
    if (!logoPath) return null;

    // If it's already a full URL (old format or already signed), return as is
    if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) {
      return logoPath;
    }

    // If it's a Supabase Storage path, generate signed URL
    if (logoPath.includes("dealer-uploads") || logoPath.startsWith("dealer/")) {
      try {
        return await this.supabaseStorageService.getSignedUrl(logoPath, 3600);
      } catch (error) {
        this.logger.warn(`Failed to generate signed URL for path: ${logoPath}`);
        return logoPath; // Return original path if signing fails
      }
    }

    return logoPath;
  } // dealer.service.ts

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
    dto: Omit<CreateDealerDto, "logo"> & { logo?: string },
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

    // 2 Handle logo - support both file upload and logo path
    let logoUrl = "";
    if (logoFile) {
      // Handle traditional file upload
      const ext = extname(logoFile.originalname);
      const baseName = basename(logoFile.originalname, ext)
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]/g, "");
      const filename = `${Date.now()}-${baseName}${ext}`;

      const uploadDir = join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(join(uploadDir, filename), logoFile.buffer);
      logoUrl = `${process.env.BACKEND_URL}/uploads/${filename}`;
    } else if (dto.logo) {
      // Handle logo path (e.g., from Supabase storage)
      logoUrl = dto.logo;
    }

    // 3 Find tier
    const dealerTier = await this.dealerTierRepository.findOne({
      where: { id: dto.tierId },
      relations: ["dealerTierCredits"],
    });
    if (!dealerTier) throw new BadRequestException("Invalid dealer tier");

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
    this.logger.log(`✅ Dealer saved successfully with ID: ${savedDealer.id}`);

    // 6 Create default company user profile
    this.logger.log(
      `🔄 Attempting to create default company user profile for dealer ${savedDealer.id}...`,
    );
    try {
      // IMPORTANT: Need to fetch dealer with user relation for createDefaultProfile
      const dealerWithUser = await this.dealerRepository.findOne({
        where: { id: savedDealer.id },
        relations: ["user"],
      });

      if (!dealerWithUser) {
        throw new Error(
          `Could not find dealer ${savedDealer.id} with user relation`,
        );
      }

      this.logger.debug(
        `Dealer with user relation: ${JSON.stringify({
          dealerId: dealerWithUser.id,
          dealerName: dealerWithUser.name,
          contactEmail: dealerWithUser.contactEmail,
          userId: dealerWithUser.user?.id,
          userEmail: dealerWithUser.user?.email,
        })}`,
      );

      const defaultProfile =
        await this.companyUserService.createDefaultProfile(dealerWithUser);
      this.logger.log(
        `✅ Default profile created successfully! Profile ID: ${defaultProfile.id}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to create default company profile for dealer ${savedDealer.id}`,
      );
      this.logger.error(error);
      if (error instanceof Error) {
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Error stack: ${error.stack}`);
      }
      // Don't fail dealer creation if profile creation fails
      // Profile can be created manually later
      this.logger.warn(
        `⚠️ Continuing dealer creation despite profile creation failure`,
      );
    }

    // 7 Insert dealer_tier_credit record for tracking
    const dealerTierCredit = this.dealerTierCreditRepository.create({
      dealerId: savedDealer.id,
      tierId: dealerTier.id,
      credit: credit,
    });
    await this.dealerTierCreditRepository.save(dealerTierCredit);

    // 8 Return dealer with relations
    const createdUser = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: [
        "dealer",
        "dealer.dealerTierCredits", // ✅ belongs to Dealer, not User
      ],
    });

    // Convert logo path to signed URL before returning
    if (createdUser?.dealer?.logo) {
      createdUser.dealer.logo = await this.convertLogoToSignedUrl(
        createdUser.dealer.logo,
      );
    }

    return createdUser;
  }

  async getAllDealers() {
    const dealers = await this.userRepository.find({
      where: {
        dealer: {
          id: undefined, // Find users who have a dealer relationship
        },
      },
      relations: ["dealer", "dealer.dealerTierCredits.tier"],
    });

    // Convert all logo paths to signed URLs
    for (const dealer of dealers) {
      if (dealer.dealer?.logo) {
        dealer.dealer.logo = await this.convertLogoToSignedUrl(
          dealer.dealer.logo,
        );
      }
    }

    return dealers;
  }

  async getDealerById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["dealer", "dealer.dealerTierCredits.tier"],
    });

    if (!user || !user.dealer) {
      throw new NotFoundException("Dealer not found");
    }

    // Convert logo path to signed URL
    if (user.dealer.logo) {
      user.dealer.logo = await this.convertLogoToSignedUrl(user.dealer.logo);
    }

    return user;
  }

  async getDealerCredits(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["dealer", "dealer.dealerTierCredits"],
    });

    if (!user || !user.dealer) {
      throw new NotFoundException("Dealer not found");
    }

    // Get credits from dealer_tier_credit table
    const dealerTierCredit = user.dealer.dealerTierCredits?.[0];
    const credits = dealerTierCredit?.credit ?? 0;

    return {
      credits,
      dealerId: user.dealer.id,
    };
  }

  async updateDealer(
    id: number,
    dto: UpdateDealerDto & { logo?: string },
    logoFile?: Multer.File,
  ) {
    // Check if user exists and has dealer
    const existingUser = await this.userRepository.findOne({
      where: { id },
      relations: ["dealer"],
    });

    if (!existingUser || !existingUser.dealer) {
      throw new NotFoundException("Dealer not found");
    }

    // Update user fields
    const updateUser: Partial<UpdateUserDto> = {};
    if (dto.name !== undefined) updateUser.name = dto.name;
    if (dto.email !== undefined) updateUser.email = dto.email;
    if (dto.username !== undefined) updateUser.username = dto.username;
    if (dto.password && dto.password.trim() !== "") {
      updateUser.password = await bcrypt.hash(dto.password, 10);
    }

    if (Object.keys(updateUser).length > 0) {
      await this.userRepository.update(id, updateUser);
    }

    // Handle logo - support both file upload and logo path
    let logoUrl = existingUser.dealer.logo; // keep existing if no new file
    if (logoFile) {
      // Handle traditional file upload
      const safeName = logoFile.originalname
        .replace(/\s+/g, "-")
        .replace(/[^\w\-\.]/g, "");
      const filename = `${Date.now()}-${safeName}${extname(logoFile.originalname)}`;

      const uploadDir = join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uploadPath = join(uploadDir, filename);
      fs.writeFileSync(uploadPath, logoFile.buffer);

      logoUrl = `${process.env.BACKEND_URL}/uploads/${filename}`;
    } else if (dto.logo) {
      // Handle logo path (e.g., from Supabase storage)
      logoUrl = dto.logo;
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
    updateDealer["logo"] = logoUrl;

    if (Object.keys(updateDealer).length > 0) {
      await this.dealerRepository.update(existingUser.dealer.id, updateDealer);
    }

    // Return updated user with dealer relation
    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: ["dealer", "dealer.dealerTierCredits.tier"],
    });

    // Convert logo path to signed URL before returning
    if (updatedUser?.dealer?.logo) {
      updatedUser.dealer.logo = await this.convertLogoToSignedUrl(
        updatedUser.dealer.logo,
      );
    }

    return updatedUser;
  }

  /**
   * Update dealer logo path (for Supabase Storage integration)
   * @param userId User ID
   * @param logoPath Path to the logo in Supabase Storage
   */
  async updateDealerLogoPath(userId: number, logoPath: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["dealer"],
    });

    if (!user || !user.dealer) {
      throw new NotFoundException("Dealer not found");
    }

    // Clear old logo cache if exists
    if (user.dealer.logo) {
      this.supabaseStorageService.clearCache(user.dealer.logo);
    }

    await this.dealerRepository.update(user.dealer.id, { logo: logoPath });

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["dealer", "dealer.dealerTierCredits.tier"],
    });

    // Convert logo path to signed URL before returning
    if (updatedUser?.dealer?.logo) {
      updatedUser.dealer.logo = await this.convertLogoToSignedUrl(
        updatedUser.dealer.logo,
      );
    }

    return updatedUser;
  }

  async deleteDealer(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["dealer"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const userId = user.id;
    const dealerId = user.dealer?.id; // May be null if dealer entry is already deleted

    // CASCADE DELETE: Remove all related records in correct order
    // Use QueryRunner for transaction to ensure atomicity
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Delete invoice items (child of invoices)
      await queryRunner.query(
        `DELETE FROM invoice_items WHERE "invoiceId" IN (SELECT id FROM invoices WHERE "userId" = $1)`,
        [userId],
      );

      // 2. Delete invoices
      await queryRunner.query(`DELETE FROM invoices WHERE "userId" = $1`, [
        userId,
      ]);

      // 3. Delete quotation items (child of quotations)
      await queryRunner.query(
        `DELETE FROM quotation_items WHERE "quotationId" IN (SELECT id FROM quotations WHERE "userId" = $1)`,
        [userId],
      );

      // 4. Delete quotations
      await queryRunner.query(`DELETE FROM quotations WHERE "userId" = $1`, [
        userId,
      ]);

      // 5. Delete dealer leads (pivot table) - uses userId
      await queryRunner.query(`DELETE FROM dealer_leads WHERE "userId" = $1`, [
        userId,
      ]);

      // 6. Delete bank details
      await queryRunner.query(`DELETE FROM bank_details WHERE "userId" = $1`, [
        userId,
      ]);

      // Only delete dealer-specific records if dealerId exists
      if (dealerId) {
        // 7. Delete lead messages
        await queryRunner.query(
          `DELETE FROM lead_messages WHERE "dealerId" = $1`,
          [dealerId],
        );

        // 8. Update leads: Remove wonByDealerId references
        await queryRunner.query(
          `UPDATE leads SET "wonByDealerId" = NULL WHERE "wonByDealerId" = $1`,
          [dealerId],
        );

        // 9. Delete business settings
        await queryRunner.query(
          `DELETE FROM business_settings WHERE "dealerId" = $1`,
          [dealerId],
        );

        // 10. Delete dealer tier credits
        await queryRunner.query(
          `DELETE FROM dealer_tier_credit WHERE "dealerId" = $1`,
          [dealerId],
        );

        // 11. Delete company users
        await queryRunner.query(
          `DELETE FROM company_users WHERE "dealer_id" = $1`,
          [dealerId],
        );

        // 12. Delete dealer record
        await queryRunner.query(`DELETE FROM dealer WHERE id = $1`, [dealerId]);
      }

      // 13. Finally delete user
      await queryRunner.query(`DELETE FROM "user" WHERE id = $1`, [userId]);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Successfully deleted user ${userId}${dealerId ? ` (dealer ${dealerId})` : ""} and all related records`,
      );
      return {
        success: true,
        message: "Dealer and all related data deleted successfully",
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to delete user ${userId}:`, error);
      throw new BadRequestException(
        `Failed to delete dealer: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // async createQuotation(dto: CreateQuotationDto, dealerId: number) {
  //   // 1 Find dealer
  //   const dealer = await this.userRepository.findOne({
  //     where: { id: dealerId },
  //   });
  //   if (!dealer) throw new Error('Dealer not found');
  //
  //   // 2 Find lead
  //   const lead = await this.leadRepository.findOne({
  //     where: { id: dto.leadId },
  //   });
  //   if (!lead) throw new Error('Lead not found');
  //
  //   // 3 Create quotation
  //   const quotation = this.quotationRepository.create({
  //     engineCodeName: lead.engine_code,
  //     dealershipName: dealer.name,
  //     quotationPrice: dto.quotationPrice,
  //     subject: dto.subject,
  //     message: dto.message,
  //     dealer,
  //     lead,
  //   });
  //
  //   const savedQuotation = await this.quotationRepository.save(quotation);
  //
  //   // 4 Save items manually (Laravel-style hasMany)
  //   let savedItems: any = [];
  //   if (dto.items && dto.items.length > 0) {
  //     const itemsToSave = dto.items.map((item) => ({
  //       ...item,
  //       totalAmount:
  //         item.rate *
  //         item.quantity *
  //         (1 - (item.discountPercent || 0) / 100) *
  //         (1 + (item.taxPercent || 0) / 100),
  //       quotationId: savedQuotation.id,
  //     }));
  //
  //     savedItems = await this.quotationItemRepository.save(itemsToSave);
  //   }
  //
  //   //terms & constions
  //   const setting = await this.businessSettingRepository.findOne({
  //     where: { dealerId },
  //   });
  //   if (!setting) throw new NotFoundException('Business setting not found');
  //
  //   // 5 Send email
  //   this.mailService.sendMail({
  //     to: lead.email,
  //     subject: 'New Quotation Created',
  //     template: 'quotation',
  //     context: {
  //       inquiryId: savedQuotation.id,
  //       companyName: lead.name || 'Example Garage',
  //       email: lead.email,
  //       contact: 'N/A',
  //       vrm: lead.vehicle_vrm || 'N/A',
  //       engineSize: lead.engine_code || 'N/A',
  //       vehicleModel: lead.vehicle_model || 'N/A',
  //       engineCode: savedQuotation.engineCodeName,
  //       items: savedItems,
  //       grandTotal: savedQuotation.quotationPrice,
  //       sellerNote: dto.message,
  //       quotationTerms: setting.quotation,
  //       salesTerms: setting.salesTerms,
  //     },
  //   });
  //
  //   return savedQuotation;
  // }

  // async fetchQuotations(leadId: number, delaerId: number) {
  //   try {
  //     const dealer = await this.userRepository.findOne({
  //       where: { id: delaerId },
  //     });
  //
  //     if (!dealer) {
  //       throw new Error('Dealer not found');
  //     }
  //     const lead = await this.leadRepository.findOne({
  //       where: { id: leadId },
  //     });
  //
  //     if (!lead) {
  //       throw new Error('Lead not found');
  //     }
  //
  //     const quotations = await this.quotationRepository.find({
  //       where: {
  //         dealer: { id: delaerId },
  //         lead: { id: leadId },
  //       },
  //       relations: ['items'],
  //     });
  //
  //     if (!quotations) {
  //       throw new Error('Quotations not found');
  //     }
  //     return quotations;
  //   } catch (error: unknown) {
  //     throw new CustomError('Unable to create lead' + error);
  //   }
  // }

  // Get all quotations for a dealer
  // async getAllQuotations(dealerId: number): Promise<Quotation[]> {
  //   try {
  //     const quotations = await this.quotationRepository.find({
  //       where: {
  //         dealer: { id: dealerId },
  //       },
  //       relations: ['items', 'lead', 'dealer'],
  //       order: {
  //         createdAt: 'DESC',
  //       },
  //     });
  //
  //     return quotations;
  //   } catch (error: unknown) {
  //     throw new CustomError('Unable to fetch quotations: ' + error);
  //   }
  // }

  // Get a single quotation by ID
  // async getQuotationById(
  //   quotationId: number,
  //   dealerId: number,
  // ): Promise<Quotation> {
  //   try {
  //     const quotation = await this.quotationRepository.findOne({
  //       where: {
  //         id: quotationId,
  //         dealer: { id: dealerId },
  //       },
  //       relations: ['items', 'lead', 'dealer'],
  //     });
  //
  //     if (!quotation) {
  //       throw new NotFoundException('Quotation not found');
  //     }
  //
  //     return quotation;
  //   } catch (error: unknown) {
  //     throw new CustomError('Unable to fetch quotation: ' + error);
  //   }
  // }

  async forgotPassword(email: string) {
    const dealer = await this.userRepository.findOne({
      where: { email: email, type: UserType.DEALER },
    });
    if (!dealer) throw new NotFoundException("Dealer not found"); // don't reveal
    try {
      const token = crypto.randomBytes(32).toString("hex");
      dealer.resetPasswordToken = token;
      dealer.resetPasswordExpires = new Date(Date.now() + 3600 * 1000); // 1h expiry
      await this.userRepository.save(dealer);

      const resetLink = `${this.configService.get("FRONTEND_URL")}/reset-password/${token}`;
      this.mailService.sendMail({
        to: email,
        subject: "Reset your password",
        template: "forgot-password", // templates/forgot-password.hbs
        context: {
          dealershipName: dealer.name,
          resetLink,
        },
      });
      return dealer;
    } catch (error: unknown) {
      throw new CustomError("Unable to forgot password");
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
        throw new Error("Invalid or expired token");
      }

      dealer.password = await bcrypt.hash(newPassword, 10);
      dealer.resetPasswordToken = null;
      dealer.resetPasswordExpires = null;
      return await this.userRepository.save(dealer);
    } catch (error: unknown) {
      throw new CustomError("Unable to reset password");
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
      throw new CustomError("Unable to fetch lead");
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
    // check if any relationship already exists (regardless of status)
    const existing = await this.dealerLeadRepository.findOne({
      where: { dealer: { id: dealerId }, lead: { id: leadId } },
      relations: ["dealer", "lead"],
    });

    // fetch dealer + lead (only ids needed)
    const dealer = await this.userRepository.findOneBy({ id: dealerId });
    if (!dealer)
      throw new CustomError(`Dealer with ID ${dealerId} not found`, 404);

    const lead = await this.leadRepository.findOneBy({ id: leadId });
    if (!lead) throw new CustomError(`Lead with ID ${leadId} not found`, 404);

    if (existing) {
      // Update the existing entry's status instead of creating a new one
      existing.status = status;
      const updated = await this.dealerLeadRepository.save(existing);
      console.log(
        `🔗 DealerLead relationship updated for dealer ${dealerId} and lead ${leadId} with status ${status}`,
      );
      lead.status = status;
      this.leadsGateway.emitUpdateLead(lead);
      return updated; // return updated existing entry
    }

    // create new pivot entry
    const dealerLead = this.dealerLeadRepository.create({
      dealer,
      lead,
      status: status,
    });

    const result = await this.dealerLeadRepository.save(dealerLead);
    lead.status = status;
    this.leadsGateway.emitUpdateLead(lead);
    return result;
  }

  private async leadMessage(leadId: number, dealerId: number, content: string) {
    // check if already exists

    const existing = await this.leadMessageRepository.findOne({
      where: { dealer: { id: dealerId }, lead: { id: leadId } },
      relations: ["dealer", "lead"],
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
