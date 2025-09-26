import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from 'src/leads/entities/lead.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto, InvoiceStatus } from '@crm/types';





@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, dealerId: string): Promise<Invoice> {
    // Verify lead exists and belongs to dealer
    const lead = await this.leadRepository.findOne({
      where: { id: createInvoiceDto.leadId, dealerId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found or does not belong to this dealer');
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
      leadId: createInvoiceDto.leadId,
      dealerId,
      subTotal,
      taxAmount: createInvoiceDto.taxAmount,
      totalAmount,
      status: InvoiceStatus.PENDING,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

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
    return this.findOne(savedInvoice.id, dealerId);
  }

  async findAll(dealerId: string, page: number = 1, limit: number = 10): Promise<{
    data: Invoice[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [invoices, total] = await this.invoiceRepository.findAndCount({
      where: { dealerId },
      relations: ['lead', 'items'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, dealerId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, dealerId },
      relations: ['lead', 'items', 'dealer'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateStatus(id: string, status: InvoiceStatus, dealerId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, dealerId },
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

    return this.findOne(id, dealerId);
  }

  async delete(id: string, dealerId: string): Promise<void> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, dealerId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot delete paid invoice');
    }

    await this.invoiceRepository.remove(invoice);
  }

  async getInvoiceStats(dealerId: string): Promise<{
    totalInvoices: number;
    totalAmount: number;
    pendingInvoices: number;
    paidInvoices: number;
    pendingAmount: number;
    paidAmount: number;
  }> {
    const [
      totalInvoices,
      totalAmountResult,
      pendingInvoices,
      paidInvoices,
      pendingAmountResult,
      paidAmountResult,
    ] = await Promise.all([
      this.invoiceRepository.count({ where: { dealerId } }),
      this.invoiceRepository.createQueryBuilder('invoice')
        .select('SUM(invoice.totalAmount)', 'sum')
        .where('invoice.dealerId = :dealerId', { dealerId })
        .getRawOne(),
      this.invoiceRepository.count({ where: { dealerId, status: InvoiceStatus.PENDING } }),
      this.invoiceRepository.count({ where: { dealerId, status: InvoiceStatus.PAID } }),
      this.invoiceRepository.createQueryBuilder('invoice')
        .select('SUM(invoice.totalAmount)', 'sum')
        .where('invoice.dealerId = :dealerId', { dealerId })
        .andWhere('invoice.status = :status', { status: InvoiceStatus.PENDING })
        .getRawOne(),
      this.invoiceRepository.createQueryBuilder('invoice')
        .select('SUM(invoice.totalAmount)', 'sum')
        .where('invoice.dealerId = :dealerId', { dealerId })
        .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
        .getRawOne(),
    ]);

    return {
      totalInvoices,
      totalAmount: Number(totalAmountResult?.sum || 0),
      pendingInvoices,
      paidInvoices,
      pendingAmount: Number(pendingAmountResult?.sum || 0),
      paidAmount: Number(paidAmountResult?.sum || 0),
    };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const count = await this.invoiceRepository.count();
    const nextNumber = count + 1;
    return `#VL${nextNumber.toString().padStart(7, '0')}`;
  }
}