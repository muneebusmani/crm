import { LeadStatus, type CreateLeadMessageDto, type UpdateLeadMessageDto } from '@crm/types';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { CustomError } from 'src/common/custom-error';
import { Lead } from 'src/leads/entities/lead.entity';
import { User } from 'src/user/entities';
import { Repository } from 'typeorm';
import { LeadMessage } from './entities/lead-message.entity';
import { DealerLead } from 'src/user/entities/dealer-lead.entity';
@Injectable()
export class LeadMessageService {
  private readonly logger = new Logger(LeadMessageService.name);
  constructor(
    @InjectRepository(LeadMessage)
    private readonly leadMessageRepo: Repository<LeadMessage>,
    @InjectRepository(User)
    private readonly dealerRepo: Repository<User>,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,

    @InjectRepository(DealerLead)
    private readonly dealerLeadRepository: Repository<DealerLead>,
    

    private readonly mailService: MailerService,
  ) {}

  async create(
    dto: CreateLeadMessageDto,
    delertId: number,
  ): Promise<LeadMessage> {
    try {
      const dealer = await this.dealerRepo.findOneBy({ id: delertId });
      if (!dealer) throw new NotFoundException('Dealer not found');

      const lead = await this.leadRepo.findOneBy({ id: dto.leadId });
      if (!lead) throw new NotFoundException('Lead not found');

      const message = this.leadMessageRepo.create({
        content: dto.content,
        dealer,
        lead,
      });
      console.log('message ===>', message);

      const emailtoSend = {
        to: lead.email, // 👈 you must have dealer.email field
        subject: 'New Message',
        template: 'dealer-message', // file: templates/quotation.hbs
        context: {
          dealershipName: dealer.email, // Changed from dealerName to match template
          message: dto.content,
        },
      };
      this.mailService.sendMail(emailtoSend);
       await this.ensureDealerLead(lead.id, dealer.id!, LeadStatus.CONTACT);
      return await this.leadMessageRepo.save(message);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Error creating lead message:', error);
      throw new CustomError(`Unable to insert message: ${errorMessage}`);
    }
  }

  // <<<<<<< muneeb
  findAll(): Promise<LeadMessage[]> {
    this.logger.log(`This is from Lead Message Service Find All`);
    return this.leadMessageRepo.find({
      order: { createdAt: 'DESC' },
    });
    // =======
    //  async findAll(dealerId: number): Promise<LeadMessage[]> {
    //      try{
    //      const leadMessage = await this.leadMessageRepo.find({
    //           where: {
    //             dealer: { id: dealerId },
    //           },
    //           relations: ['lead', 'dealer'], // load related entities if needed
    //         });
    //       if (!leadMessage) {
    //         throw new NotFoundException(`LeadMessage with id ${dealerId} not found`);
    //       }
    //       return leadMessage;
    //     }
    //     catch (error: unknown) {
    //        console.error('FindOne error:', error);  // 👈 log the real cause
    //       throw new CustomError("Unable to fetch leads");
    //     }
    // >>>>>>> master
  }

  async findOne(leadId: number, dealerId: number): Promise<LeadMessage[]> {
    try {
      const leadMessage = await this.leadMessageRepo.find({
        where: {
          lead: { id: leadId },
          dealer: { id: dealerId },
        },
        relations: ['lead', 'dealer'], // load related entities if needed
      });
      this.logger.log('Lead Message ===>', leadMessage);
      if (!leadMessage) {
        throw new NotFoundException(`LeadMessage with id ${leadId} not found`);
      }
      return leadMessage;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(
        `Error finding lead message (leadId: ${leadId}, dealerId: ${dealerId}):`,
        errorMessage,
      );
      throw new CustomError(`Unable to fetch lead messages: ${errorMessage}`);
    }
  }

  async update(id: number, dto: UpdateLeadMessageDto): Promise<LeadMessage> {
    try {
      const message = await this.leadMessageRepo.findOneBy({ id });
      if (!message) {
        throw new NotFoundException(`LeadMessage with id ${id} not found`);
      }
      Object.assign(message, dto);
      return await this.leadMessageRepo.save(message);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(
        `Error updating lead message (id: ${id}):`,
        errorMessage,
      );
      throw new CustomError(`Unable to update lead message: ${errorMessage}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.leadMessageRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Message with id ${id} not found`);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(
        `Error removing lead message (id: ${id}):`,
        errorMessage,
      );
      throw new CustomError(`Unable to remove lead message: ${errorMessage}`);
    }
  }

  async findByLead(leadId: number): Promise<LeadMessage[]> {
    try {
      return this.leadMessageRepo.find({
        where: { lead: { id: leadId } },
        order: { createdAt: 'DESC' },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(
        `Error finding messages for lead (leadId: ${leadId}):`,
        errorMessage,
      );
      throw new CustomError(`Unable to fetch lead messages: ${errorMessage}`);
    }
  }

  private async ensureDealerLead(leadId: number, dealerId: number, status: string) {
    // check if already exists

    const existing = await this.dealerLeadRepository.findOne({
      where: { dealer: { id: dealerId }, lead: { id: leadId }, status: status },
      relations: ['dealer', 'lead'],
    });


    if (existing) return existing; // already linked

    // fetch dealer + lead (only ids needed)
    const dealer = await this.dealerRepo.findOneBy({ id: dealerId });
    if (!dealer) throw new CustomError(`Dealer with ID ${dealerId} not found`, 404);

    const lead = await this.leadRepo.findOneBy({ id: leadId });
    if (!lead) throw new CustomError(`Lead with ID ${leadId} not found`, 404);

    // create new pivot entry
    const dealerLead = this.dealerLeadRepository.create({
      dealer,
      lead,
      status: status,
    });

    return await this.dealerLeadRepository.save(dealerLead); // 👈 FIXED
  }
}
