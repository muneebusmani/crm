import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from 'src/leads/entities/lead.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Invoice } from './entities/invoice.entity';
import { BusinessSetting } from 'src/business-setting/entities/business-setting.entity';

import {
  CreateInvoiceDto,
  InvoiceResponse,
  InvoiceStatus,
  LeadMessageType,
  LeadStatus,
} from '@crm/types';
import { Dealer, User } from 'src/user/entities';
import { CustomError } from 'src/common/custom-error';
import { DealerLead } from 'src/user/entities/dealer-lead.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { PdfService } from 'src/Pdf/pdf-service';
import { BankDetails } from 'src/bank-details/entities/bank-details.entity';
import { LeadMessage } from 'src/leads-messages/entities/lead-message.entity';
import { LeadsGateway } from 'src/leads/leads.gateway';
import { DealerTierService } from 'src/dealer-tier/dealer-tier.service';

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
  ) {}

  async create(
    createInvoiceDto: CreateInvoiceDto,
    dealerId: number,
  ): Promise<Invoice> {
    // 🔍 1. Verify lead ownership
    const lead = await this.leadRepository.findOne({
      where: {
        id: createInvoiceDto.leadId,
        is_deleted: false,
        dealerLeads: { dealer: { id: dealerId } },
      },
      relations: ['dealerLeads', 'dealerLeads.dealer'],
    });

    if (!lead) {
      throw new NotFoundException(
        'Lead not found or does not belong to this dealer',
      );
    }

    // 🔍 2. Find dealer with profile
    const dealer = await this.userRepository.findOne({
      where: { id: dealerId },
      relations: ['dealer'],
    });

    if (!dealer) {
      throw new NotFoundException('Dealer not found');
    }

    const setting = await this.businessSettingRepository.findOne({
      where: { dealerId },
    });
    if (!setting) throw new NotFoundException('Business setting not found');

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
        productDetails: item.productDetails || '',
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
      relations: ['user'],
    });

    const invoiceDate = new Date(savedInvoice.date).toLocaleDateString();
    const orderDate = new Date(lead.createdAt).toLocaleDateString();

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
      quotationTerms: setting.quotation,
      salesTerms: setting.salesTerms,
      grandTotal,
      bank: bankDetails || null,
    };

    // 📧 9. Send invoice mail
    await this.mailService.sendMail({
      to: lead.email,
      subject: `Invoice #${invoice.invoiceNumber}`,
      template: 'invoice-pdf',
      context: { invoiceData },
    });

    // 🔒 10. Close lead
    await this.ensureDealerLead(lead.id, dealerId!, LeadStatus.CLOSE);

    return savedInvoice;
  }

  async findAll(dealerId: number): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { dealer: { id: dealerId } },
      relations: ['dealer', 'lead', 'items'], // ✅ fixed
      order: { createdAt: 'DESC' },
    });
  }

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
    const dealer = await this.userRepository.findOne({
      where: { id: dealerId },
      relations: ['dealer'],
    });
    if (!dealer)
      throw new CustomError(`Dealer with ID ${dealerId} not found`, 404);

    const lead = await this.leadRepository.findOneBy({ id: leadId });
    if (!lead) throw new CustomError(`Lead with ID ${leadId} not found`, 404);

    // create new pivot entry
    const dealerLead = await this.dealerLeadRepository.create({
      dealer,
      lead,
      status: status,
    });
    lead.status = status;
    const result = await this.dealerLeadRepository.save(dealerLead); // 👈 FIXED
    this.leadsGateway.emitUpdateLead(lead);
    await this.dealerTierService.subtractCredits(dealer?.dealer.id, 1);
    return result;
  }

  async findOne(id: string, dealerId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { dealer: { id: dealerId } },
      relations: ['lead', 'items', 'dealer'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
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
      throw new NotFoundException('Invoice not found');
    }

    // Business logic for status transitions
    if (
      invoice.status === InvoiceStatus.CANCELLED &&
      status !== InvoiceStatus.PENDING
    ) {
      throw new BadRequestException(
        'Cannot change status of cancelled invoice',
      );
    }

    if (
      invoice.status === InvoiceStatus.PAID &&
      status === InvoiceStatus.CANCELLED
    ) {
      throw new BadRequestException('Cannot cancel paid invoice');
    }

    invoice.status = status;
    await this.invoiceRepository.save(invoice);

    return invoice;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const count = await this.invoiceRepository.count();
    const nextNumber = count + 1;
    return `#VL${nextNumber.toString().padStart(7, '0')}`;
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
      type: type,
    });
    return await this.leadMessageRepository.save(message);
  }
}
