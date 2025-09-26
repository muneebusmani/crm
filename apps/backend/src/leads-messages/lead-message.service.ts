import type { CreateLeadMessageDto, UpdateLeadMessageDto } from '@crm/types';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { CustomError } from 'src/common/custom-error';
import { Lead } from 'src/leads/entities/lead.entity';
import { User } from 'src/user/entities';
import { Repository } from 'typeorm';
import { LeadMessage } from './entities/lead-message.entity';
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
      return await this.leadMessageRepo.save(message);
    } catch (error: unknown) {
      throw new CustomError('Unable insert message');
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
      console.error('FindOne error:', error); // 👈 log the real cause
      throw new CustomError('Unable to fetch leads');
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
      throw new CustomError('Unable to update lead message');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.leadMessageRepo.delete(id);
      if (result.affected === 0)
        throw new NotFoundException('Message not found');
    } catch (error: unknown) {
      throw new CustomError('Unable to fetch leads');
    }
  }

  async findByLead(leadId: number): Promise<LeadMessage[]> {
    try {
      return this.leadMessageRepo.find({
        where: { lead: { id: leadId } },
        order: { createdAt: 'DESC' },
      });
    } catch (error: unknown) {
      throw new CustomError('Unable to fetch leads');
    }
  }
}
