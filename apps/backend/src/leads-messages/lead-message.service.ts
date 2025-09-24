import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadMessage } from './entities/lead-message.entity';
import { MailerService } from '@nestjs-modules/mailer';
import type { CreateLeadMessageDto, CreateLeadMessageSchema, UpdateLeadMessageDto, UpdateLeadMessageSchema } from '@crm/types';
import { Dealer, User } from 'src/user/entities';
import { Lead } from 'src/leads/entities/lead.entity';
import { CustomError } from 'src/common/custom-error';
@Injectable()
export class LeadMessageService {
  constructor(
    @InjectRepository(LeadMessage)
    private readonly leadMessageRepo: Repository<LeadMessage>,
    @InjectRepository(User)
    private readonly dealerRepo: Repository<User>,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,

     private readonly mailService: MailerService,
  ) {}

  async create(dto: CreateLeadMessageDto, delertId: number): Promise<LeadMessage> {
    try{
      const dealer = await this.dealerRepo.findOneBy({ id: delertId});
      if (!dealer) throw new NotFoundException('Dealer not found');

      const lead = await this.leadRepo.findOneBy({ id: dto.leadId });
      if (!lead) throw new NotFoundException('Lead not found');

      const message = this.leadMessageRepo.create({
        content: dto.content,
        dealer,
        lead,
      });

       this.mailService.sendMail({
        to: lead.email, // 👈 you must have dealer.email field
        subject: 'New Quotation Created',
        template: 'dealer-message', // file: templates/quotation.hbs
        context: {
          dealershipName: dealer.email,
          message: dto.content
        },
      });
      return await  this.leadMessageRepo.save(message);
    }
    catch (error: unknown) {  
      throw new CustomError("Unable insert message");
    }
  }

  findAll(): Promise<LeadMessage[]> {
    return this.leadMessageRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(leadId: number, dealerId: number): Promise<LeadMessage[]> {
    try{
        const leadMessage = await this.leadMessageRepo.find({
          where: {
            lead: { id: leadId },
            dealer: { id: dealerId },
          },
          relations: ['lead', 'dealer'], // load related entities if needed
        });
      if (!leadMessage) {
        throw new NotFoundException(`LeadMessage with id ${leadId} not found`);
      }
     return leadMessage;
    }
    catch (error: unknown) { 
       console.error('FindOne error:', error);  // 👈 log the real cause 
      throw new CustomError("Unable to fetch leads");
    }

  }


  async update(id: number, dto: UpdateLeadMessageDto): Promise<LeadMessage> {
    try{
    const message = await  this.leadMessageRepo.findOneBy({id});
    if (!message) {
      throw new NotFoundException(`LeadMessage with id ${id} not found`);
    }
    Object.assign(message, dto);
    return await  this.leadMessageRepo.save(message);

    }catch (error: unknown) {  
      throw new CustomError("Unable to update lead message");
    }
  }

  async remove(id: number): Promise<void> {
    try{
      const result = await this.leadMessageRepo.delete(id);
      if (result.affected === 0) throw new NotFoundException('Message not found');
    }catch (error: unknown) {  
      throw new CustomError("Unable to fetch leads");
    }
  }

  async findByLead(leadId: number): Promise<LeadMessage[]> {
    try{
      return this.leadMessageRepo.find({
        where: { lead: { id: leadId } },
        order: { createdAt: 'DESC' },
      });
    } catch (error: unknown) {  
        throw new CustomError("Unable to fetch leads");
      }
  }
}
