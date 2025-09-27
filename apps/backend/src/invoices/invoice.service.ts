import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from 'src/leads/entities/lead.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto, InvoiceResponse, InvoiceStatus, LeadStatus } from '@crm/types';
import { Dealer, User } from 'src/user/entities';
import { CustomError } from 'src/common/custom-error';
import { DealerLead } from 'src/user/entities/dealer-lead.entity';


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
  
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, dealerId: number): Promise<Invoice> {
    // Verify lead exists and belongs to dealer
     const lead = await this.leadRepository.findOne({
      where: {
        id: createInvoiceDto.leadId,
        is_deleted: false,
        dealerLeads: {
          dealer: { id: dealerId }, // 👈 filter by nested relation
        },
      },
      relations: ["dealerLeads", "dealerLeads.dealer"],
    });

    if (!lead) {
      throw new NotFoundException('Lead not found or does not belong to this dealer');
    }

     const dealer = await this.userRepository.findOne({ where: { id: dealerId } });
      if (!dealer) {
        throw new Error('Dealer not found');
      }

    // Generate unique invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate totals
    const subTotal = createInvoiceDto.items.reduce(
      (sum, item) => sum + (item.unitPrice * item.quantity), 
      0
    );
    const totalAmount = subTotal + createInvoiceDto.taxAmount;

    // Create invoice
    const invoice = this.invoiceRepository.create({
      invoiceNumber,
      date: createInvoiceDto.date,
      lead: lead,
      dealer: dealer,
      subTotal,
      taxAmount: createInvoiceDto.taxAmount,
      grandTotal: totalAmount,
      status: InvoiceStatus.PENDING,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    await this.ensureDealerLead(lead.id, dealerId!, LeadStatus.CLOSE);
    // Create invoice items
    const invoiceItems = createInvoiceDto.items.map(item => 
      this.invoiceItemRepository.create({
        invoiceId: savedInvoice.id,
        productName: item.productName,
        productDetails: item.productDetails || '',
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.unitPrice * item.quantity,
      })
    );

    await this.invoiceItemRepository.save(invoiceItems);

    // Return complete invoice
    return invoice;
  }

 async findAll(dealerId: string): Promise<Invoice[]> {
  return this.invoiceRepository.find({
    where: { dealer: { id: dealerId } },
    relations: ['dealer', 'leads', 'items'],
    order: { createdAt: 'DESC' },
  });
}


private async ensureDealerLead(leadId: number, dealerId: number, status: string) {
    // check if already exists

    const existing = await this.dealerLeadRepository.findOne({
      where: { dealer: { id: dealerId }, lead: { id: leadId }, status: status },
      relations: ['dealer', 'lead'],
    });


    if (existing) return existing; // already linked
   
    // fetch dealer + lead (only ids needed)
    const dealer = await this.userRepository.findOneBy({ id: dealerId });
    if (!dealer) throw new CustomError(`Dealer with ID ${dealerId} not found`, 404);

    const lead = await this.leadRepository.findOneBy({ id: leadId });
    if (!lead) throw new CustomError(`Lead with ID ${leadId} not found`, 404);

    // create new pivot entry
    const dealerLead = await this.dealerLeadRepository.create({
      dealer,
      lead,
      status: status,
    });

    return await this.dealerLeadRepository.save(dealerLead); // 👈 FIXED
  }


  async findOne(id: string, dealerId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: {dealer : {id : dealerId}},
      relations: ['lead', 'items', 'dealer'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateStatus(id: string, status: InvoiceStatus, dealerId: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { dealer : { id, dealerId }},
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Business logic for status transitions
    if (invoice.status === InvoiceStatus.CANCELLED && status !== InvoiceStatus.PENDING) {
      throw new BadRequestException('Cannot change status of cancelled invoice');
    }

    if (invoice.status === InvoiceStatus.PAID && status === InvoiceStatus.CANCELLED) {
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
}