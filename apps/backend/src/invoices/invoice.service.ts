import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Lead } from "src/leads/entities/lead.entity";
import { InvoiceItem } from "./entities/invoice-item.entity";
import { Invoice } from "./entities/invoice.entity";
import { BusinessSetting } from "src/business-setting/entities/business-setting.entity";

import {
  CreateInvoiceDto,
  InvoiceResponse,
  InvoiceStatus,
  LeadMessageType,
  LeadStatus,
} from "@crm/types";
import { Dealer, User } from "src/user/entities";
import { CustomError } from "src/common/custom-error";
import { DealerLead } from "src/user/entities/dealer-lead.entity";
import { MailerService } from "@nestjs-modules/mailer";
import * as fs from "fs";
import * as path from "path";
import * as Handlebars from "handlebars";
import { PdfService } from "src/Pdf/pdf-service";
import { BankDetails } from "src/bank-details/entities/bank-details.entity";
import { LeadMessage } from "src/leads-messages/entities/lead-message.entity";
import { LeadsGateway } from "src/leads/leads.gateway";
import { DealerTierService } from "src/dealer-tier/dealer-tier.service";

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Dealer)
    private readonly dealerRespository: Repository<Dealer>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(DealerLead)
    private readonly dealerLeadRepository: Repository<DealerLead>,

    @InjectRepository(BankDetails)
    private readonly bankDetailsRepository: Repository<BankDetails>,

    @InjectRepository(LeadMessage)
    private readonly leadMessageRepository: Repository<LeadMessage>,

    @InjectRepository(BusinessSetting)
    private readonly businessSettingRepository: Repository<BusinessSetting>,

    private readonly mailService: MailerService,

    private readonly leadsGateway: LeadsGateway,

    private readonly dealerTierService: DealerTierService, // inject service

    private readonly pdfService: PdfService,
  ) {}

  async create(
    createInvoiceDto: CreateInvoiceDto,
    dealerId: number,
    companyUserId?: number,
  ): Promise<Invoice> {
    // 🔍 1. Verify lead ownership and availability
    const lead = await this.leadRepository.findOne({
      where: {
        id: createInvoiceDto.leadId,
        is_deleted: false,
      },
    });

    if (!lead) {
      throw new NotFoundException("Lead not found");
    }

    // 🚫 Check if lead is won by another dealer (but allow same dealer to send more invoices)
    if (lead.wonByDealerId && lead.wonByDealerId !== dealerId) {
      throw new ForbiddenException(
        "This lead has already been won by another dealer",
      );
    }

    // 🔍 2. Find dealer with profile
    const dealer = await this.userRepository.findOne({
      where: { id: dealerId },
      relations: ["dealer"],
    });

    if (!dealer) {
      throw new NotFoundException("Dealer not found");
    }

    const setting = await this.businessSettingRepository.findOne({
      where: { dealerId },
    });
    if (!setting) throw new NotFoundException("Business setting not found");

    // 🧾 3. Generate unique invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // 💰 4. Calculate totals
    let subTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    for (const item of createInvoiceDto.items) {
      const itemSubTotal = item.unitPrice * item.quantity;
      const itemDiscount = item.discount || 0;
      const itemTax = item.taxAmount || 0;

      subTotal += itemSubTotal;
      totalDiscount += itemDiscount;
      totalTax += itemTax;
    }

    // 🧮 Round to integers to match production schema (integer columns)
    subTotal = Math.round(subTotal);
    totalTax = Math.round(totalTax);
    totalDiscount = Math.round(totalDiscount);
    const grandTotal = Math.round(subTotal - totalDiscount + totalTax);

    // 🧾 5. Create invoice
    const invoice = this.invoiceRepository.create({
      invoiceNumber,
      date: createInvoiceDto.date,
      lead,
      dealer,
      company_user_id: companyUserId || null,
      sellerNote: createInvoiceDto.sellerNote,
      subTotal,
      taxAmount: totalTax,
      grandTotal,
      status: InvoiceStatus.PENDING,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // 📦 6. Create invoice items
    const invoiceItems = createInvoiceDto.items.map((item) =>
      this.invoiceItemRepository.create({
        invoiceId: savedInvoice.id,
        productName: item.productName,
        productDetails: item.productDetails || "",
        unitPrice: Math.round(item.unitPrice),
        quantity: item.quantity,
        discount: Math.round(item.discount || 0),
        taxAmount: Math.round(item.taxAmount || 0),
        subTotal: Math.round(item.unitPrice * item.quantity),
        totalPrice: Math.round(
          item.unitPrice * item.quantity -
            (item.discount || 0) +
            (item.taxAmount || 0),
        ),
      }),
    );

    await this.invoiceItemRepository.save(invoiceItems);

    // 🏦 7. Get bank details
    const bankDetails = await this.bankDetailsRepository.findOne({
      where: { user: { id: dealerId } },
      relations: ["user"],
    });

    const invoiceDate = new Date(savedInvoice.date).toLocaleDateString();
    const orderDate = new Date(lead.createdAt).toLocaleDateString();

    // Calculate percentages for display
    const taxPercentage =
      subTotal > 0 ? ((totalTax / subTotal) * 100).toFixed(2) : 0;
    const discountPercentage =
      subTotal > 0 ? ((totalDiscount / subTotal) * 100).toFixed(2) : 0;

    // 📄 8. Build data for PDF/email
    const invoiceData = {
      invoiceNumber: savedInvoice.invoiceNumber,
      invoiceDate,
      orderDate,
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        number: lead.number,
        postcode: lead.postcode,
        vehicle_vrm: lead.vehicle_vrm,
        vehicle_reg: lead.vehicle_reg,
        vehicle_brand: lead.vehicle_brand,
        vehicle_model: lead.vehicle_model,
        fuelType: lead.fuelType,
        engine_code: lead.engine_code,
        engin_capacity: lead.engin_capacity,
        description: lead.description,
        notes: lead.notes,
        createdAt: lead.createdAt,
      },
      dealer: {
        name: dealer.name,
        email: dealer.email,
        profile: dealer.dealer
          ? {
              name: dealer.dealer.name,
              owner: dealer.dealer.owner,
              location: dealer.dealer.location,
              logo: dealer.dealer.logo,
              website: dealer.dealer.website,
              contactEmail: dealer.dealer.contactEmail,
            }
          : null,
      },
      items: invoiceItems,
      sellerNote: createInvoiceDto.sellerNote,
      subTotal,
      totalDiscount,
      totalTax,
      taxPercentage,
      discountPercentage,
      quotationTerms: setting.quotation,
      salesTerms: setting.salesTerms,
      grandTotal,
      bank: bankDetails || null,
      recoveryLocation: createInvoiceDto.recoveryLocation || "",
      deliveryLocation: createInvoiceDto.deliveryLocation || "",
    };

    // 📧 9. Send invoice mail
    await this.mailService.sendMail({
      to: lead.email,
      subject: `Invoice ${invoice.invoiceNumber}`,
      template: "invoice-pdf",
      context: { invoiceData },
    });

    // 🔒 10. Close lead and lock to dealer (first invoice wins)
    await this.ensureDealerLead(lead.id, dealerId!, LeadStatus.CLOSE);

    // 🏆 Set wonByDealerId if this is the first invoice for this lead
    if (!lead.wonByDealerId) {
      // Get the dealer entity to use its ID for the foreign key relationship
      const dealerEntity = await this.userRepository.findOne({
        where: { id: dealerId },
        relations: ["dealer"],
      });

      if (dealerEntity && dealerEntity.dealer) {
        lead.wonByDealerId = dealerEntity.dealer.id;
        await this.leadRepository.save(lead);
        console.log(
          `🏆 Lead ${lead.id} won by dealer ${dealerEntity.dealer.id} (user ${dealerId})`,
        );
      } else {
        console.error(
          `❌ Dealer not found for user ID ${dealerId}, skipping wonByDealerId update`,
        );
      }
    }

    return savedInvoice;
  }

  async findAll(dealerId: number): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { dealer: { id: dealerId } },
      relations: ["dealer", "lead", "items", "companyUser"], // ✅ added companyUser
      order: { createdAt: "DESC" },
    });
  }

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

    // fetch dealer + lead (needed for credit deduction even if exists)
    const dealer = await this.userRepository.findOne({
      where: { id: dealerId },
      relations: ["dealer"],
    });
    if (!dealer)
      throw new CustomError(`Dealer with ID ${dealerId} not found`, 404);

    const lead = await this.leadRepository.findOneBy({ id: leadId });
    if (!lead) throw new CustomError(`Lead with ID ${leadId} not found`, 404);

    // ✅ CREDIT DEDUCTION: Deduct 1 credit for every invoice sent (even if lead already linked)
    await this.dealerTierService.subtractCredits(dealer?.dealer.id, 1);
    console.log(
      `💰 Credit deducted for dealer ${dealerId} sending invoice to lead ${leadId}`,
    );

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
    const dealerLead = await this.dealerLeadRepository.create({
      dealer,
      lead,
      status: status,
    });
    lead.status = status;
    const result = await this.dealerLeadRepository.save(dealerLead);
    this.leadsGateway.emitUpdateLead(lead);

    return result;
  }

  async findOne(id: string, dealerId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { dealer: { id: dealerId } },
      relations: ["lead", "items", "dealer"],
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    return invoice;
  }

  async updateStatus(
    id: string,
    status: InvoiceStatus,
    dealerId: number,
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { dealer: { id, dealerId } },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    // Business logic for status transitions
    if (
      invoice.status === InvoiceStatus.CANCELLED &&
      status !== InvoiceStatus.PENDING
    ) {
      throw new BadRequestException(
        "Cannot change status of cancelled invoice",
      );
    }

    if (
      invoice.status === InvoiceStatus.PAID &&
      status === InvoiceStatus.CANCELLED
    ) {
      throw new BadRequestException("Cannot cancel paid invoice");
    }

    invoice.status = status;
    await this.invoiceRepository.save(invoice);

    return invoice;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const count = await this.invoiceRepository.count();
    const nextNumber = count + 1;
    return `#VL${nextNumber.toString().padStart(7, "0")}`;
  }

  async generatePdf(
    previewData: CreateInvoiceDto,
    dealerId: number,
  ): Promise<Buffer> {
    console.log(
      "🔍 generatePdf - Starting with previewData:",
      JSON.stringify(previewData, null, 2),
    );
    console.log("🔍 generatePdf - DealerId:", dealerId);

    // 🔍 1. Verify lead ownership
    const lead = await this.leadRepository.findOne({
      where: {
        id: previewData.leadId,
        is_deleted: false,
        dealerLeads: { dealer: { id: dealerId } },
      },
      relations: ["dealerLeads", "dealerLeads.dealer"],
    });

    console.log(
      "🔍 generatePdf - Lead found:",
      lead ? `ID: ${lead.id}, Name: ${lead.name}` : "NULL",
    );

    if (!lead) {
      throw new NotFoundException(
        "Lead not found or does not belong to this dealer",
      );
    }

    // 🔍 2. Find dealer with profile
    const dealer = await this.userRepository.findOne({
      where: { id: dealerId },
      relations: ["dealer"],
    });

    console.log(
      "🔍 generatePdf - Dealer found:",
      dealer
        ? `ID: ${dealer.id}, Name: ${dealer.name}, Has Profile: ${!!dealer.dealer}`
        : "NULL",
    );

    if (!dealer) {
      throw new NotFoundException("Dealer not found");
    }

    const setting = await this.businessSettingRepository.findOne({
      where: { dealerId },
    });
    console.log(
      "🔍 generatePdf - Business setting found:",
      setting ? "YES" : "NO",
    );
    if (!setting) throw new NotFoundException("Business setting not found");

    // 🧾 3. Generate temporary invoice number for preview
    const invoiceNumber = `INV-PREVIEW-${Date.now()}`;

    // 💰 4. Calculate totals
    let subTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    for (const item of previewData.items) {
      const itemSubTotal = item.unitPrice * item.quantity;
      const itemDiscount = item.discount || 0;
      const itemTax = item.taxAmount || 0;

      subTotal += itemSubTotal;
      totalDiscount += itemDiscount;
      totalTax += itemTax;
    }

    // 🧮 Round to integers
    subTotal = Math.round(subTotal);
    totalTax = Math.round(totalTax);
    totalDiscount = Math.round(totalDiscount);
    const grandTotal = Math.round(subTotal - totalDiscount + totalTax);

    // 🏦 5. Get bank details
    const bankDetails = await this.bankDetailsRepository.findOne({
      where: { user: { id: dealerId } },
      relations: ["user"],
    });

    console.log(
      "🔍 generatePdf - Bank details found:",
      bankDetails ? `Account: ${bankDetails.accountNumber}` : "NULL",
    );
    console.log(
      "🔍 generatePdf - Calculated totals - subTotal:",
      subTotal,
      "totalTax:",
      totalTax,
      "totalDiscount:",
      totalDiscount,
      "grandTotal:",
      grandTotal,
    );

    const invoiceDate = new Date(previewData.date).toLocaleDateString();
    const orderDate = new Date(lead.createdAt).toLocaleDateString();

    console.log(
      "🔍 generatePdf - Dates - invoiceDate:",
      invoiceDate,
      "orderDate:",
      orderDate,
    );

    // Calculate percentages for display
    const taxPercentage =
      subTotal > 0 ? ((totalTax / subTotal) * 100).toFixed(2) : 0;
    const discountPercentage =
      subTotal > 0 ? ((totalDiscount / subTotal) * 100).toFixed(2) : 0;

    // 📄 6. Build data for PDF
    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      orderDate,
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        number: lead.number,
        postcode: lead.postcode,
        vehicle_vrm: lead.vehicle_vrm,
        vehicle_reg: lead.vehicle_reg,
        vehicle_brand: lead.vehicle_brand,
        vehicle_model: lead.vehicle_model,
        fuelType: lead.fuelType,
        engine_code: lead.engine_code,
        engin_capacity: lead.engin_capacity,
        description: lead.description,
        notes: lead.notes,
        createdAt: lead.createdAt,
      },
      dealer: {
        name: dealer.name,
        email: dealer.email,
        profile: dealer.dealer
          ? {
              name: dealer.dealer.name,
              owner: dealer.dealer.owner,
              location: dealer.dealer.location,
              logo: dealer.dealer.logo,
              website: dealer.dealer.website,
              contactEmail: dealer.dealer.contactEmail,
            }
          : null,
      },
      items: previewData.items.map((item) => ({
        productName: item.productName,
        productDetails: item.productDetails || "",
        unitPrice: Math.round(item.unitPrice),
        quantity: item.quantity,
        discount: Math.round(item.discount || 0),
        taxAmount: Math.round(item.taxAmount || 0),
        subTotal: Math.round(item.unitPrice * item.quantity),
        totalPrice: Math.round(
          item.unitPrice * item.quantity -
            (item.discount || 0) +
            (item.taxAmount || 0),
        ),
      })),
      sellerNote: previewData.sellerNote,
      subTotal,
      totalDiscount,
      totalTax,
      taxPercentage,
      discountPercentage,
      quotationTerms: setting.quotation,
      salesTerms: setting.salesTerms,
      grandTotal,
      bank: bankDetails || null,
      recoveryLocation: previewData.recoveryLocation || "",
      deliveryLocation: previewData.deliveryLocation || "",
    };

    // 📄 7. Generate PDF using PdfService
    console.log(
      "🔍 generatePdf - Sending data to PdfService:",
      JSON.stringify(invoiceData, null, 2),
    );
    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoiceData);

    return pdfBuffer;
  }

  async generatePreview(
    previewData: CreateInvoiceDto,
    dealerId: number,
  ): Promise<string> {
    // 🔍 1. Verify lead ownership
    const lead = await this.leadRepository.findOne({
      where: {
        id: previewData.leadId,
        is_deleted: false,
        dealerLeads: { dealer: { id: dealerId } },
      },
      relations: ["dealerLeads", "dealerLeads.dealer"],
    });

    if (!lead) {
      throw new NotFoundException(
        "Lead not found or does not belong to this dealer",
      );
    }

    // 🔍 2. Find dealer with profile
    const dealer = await this.userRepository.findOne({
      where: { id: dealerId },
      relations: ["dealer"],
    });

    if (!dealer) {
      throw new NotFoundException("Dealer not found");
    }

    const setting = await this.businessSettingRepository.findOne({
      where: { dealerId },
    });
    if (!setting) throw new NotFoundException("Business setting not found");

    // 🧾 3. Generate temporary invoice number for preview
    const invoiceNumber = `INV-PREVIEW-${Date.now()}`;

    // 💰 4. Calculate totals
    let subTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    for (const item of previewData.items) {
      const itemSubTotal = item.unitPrice * item.quantity;
      const itemDiscount = item.discount || 0;
      const itemTax = item.taxAmount || 0;

      subTotal += itemSubTotal;
      totalDiscount += itemDiscount;
      totalTax += itemTax;
    }

    // 🧮 Round to integers
    subTotal = Math.round(subTotal);
    totalTax = Math.round(totalTax);
    totalDiscount = Math.round(totalDiscount);
    const grandTotal = Math.round(subTotal - totalDiscount + totalTax);

    // 🏦 5. Get bank details
    const bankDetails = await this.bankDetailsRepository.findOne({
      where: { user: { id: dealerId } },
      relations: ["user"],
    });

    const invoiceDate = new Date(previewData.date).toLocaleDateString();
    const orderDate = new Date(lead.createdAt).toLocaleDateString();

    // Calculate percentages for display
    const taxPercentage =
      subTotal > 0 ? ((totalTax / subTotal) * 100).toFixed(2) : 0;
    const discountPercentage =
      subTotal > 0 ? ((totalDiscount / subTotal) * 100).toFixed(2) : 0;

    // 📄 6. Build data for preview
    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      orderDate,
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        number: lead.number,
        postcode: lead.postcode,
        vehicle_vrm: lead.vehicle_vrm,
        vehicle_reg: lead.vehicle_reg,
        vehicle_brand: lead.vehicle_brand,
        vehicle_model: lead.vehicle_model,
        fuelType: lead.fuelType,
        engine_code: lead.engine_code,
        engin_capacity: lead.engin_capacity,
        description: lead.description,
        notes: lead.notes,
        createdAt: lead.createdAt,
      },
      dealer: {
        name: dealer.name,
        email: dealer.email,
        profile: dealer.dealer
          ? {
              name: dealer.dealer.name,
              owner: dealer.dealer.owner,
              location: dealer.dealer.location,
              logo: dealer.dealer.logo,
              website: dealer.dealer.website,
              contactEmail: dealer.dealer.contactEmail,
            }
          : null,
      },
      items: previewData.items.map((item) => ({
        productName: item.productName,
        productDetails: item.productDetails || "",
        unitPrice: Math.round(item.unitPrice),
        quantity: item.quantity,
        subTotal: Math.round(item.unitPrice * item.quantity),
      })),
      sellerNote: previewData.sellerNote,
      subTotal,
      totalDiscount,
      totalTax,
      taxPercentage,
      discountPercentage,
      quotationTerms: setting.quotation,
      salesTerms: setting.salesTerms,
      grandTotal,
      bank: bankDetails || null,
      recoveryLocation: previewData.recoveryLocation || "",
      deliveryLocation: previewData.deliveryLocation || "",
    };

    // 📧 7. Render HTML using the template
    const templatePath = path.join(
      process.cwd(),
      process.env.NODE_ENV !== "production"
        ? "src/templates/invoice-pdf.hbs"
        : "dist/templates/templates/invoice-pdf.hbs",
    );
    const templateSource = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateSource);
    const html = template({ invoiceData });

    return html;
  }

  private async leadMessage(
    leadId: number,
    dealerId: number,
    content: string,
    type: string,
  ) {
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
      type: type,
    });
    return await this.leadMessageRepository.save(message);
  }
}
