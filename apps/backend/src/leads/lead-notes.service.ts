import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadNote } from './entities/lead-note.entity';
import { CompanyUser } from '../company-user/entities/company-user.entity';

export interface CreateLeadNoteDto {
  content: string;
}

export interface UpdateLeadNoteDto {
  content: string;
}

@Injectable()
export class LeadNotesService {
  constructor(
    @InjectRepository(LeadNote)
    private readonly leadNoteRepository: Repository<LeadNote>,
    @InjectRepository(CompanyUser)
    private readonly companyUserRepository: Repository<CompanyUser>,
  ) {}

  async create(
    leadId: number,
    companyUserId: number,
    dto: CreateLeadNoteDto,
  ): Promise<LeadNote> {
    // Get company user to store name
    const companyUser = await this.companyUserRepository.findOne({
      where: { id: companyUserId },
    });

    if (!companyUser) {
      throw new NotFoundException('Company user not found');
    }

    const note = this.leadNoteRepository.create({
      lead_id: leadId,
      company_user_id: companyUserId,
      content: dto.content.substring(0, 500), // Enforce 500 char limit
      created_by_name: companyUser.name,
    });

    return await this.leadNoteRepository.save(note);
  }

  async findByLeadId(leadId: number, companyUserId: number): Promise<LeadNote[]> {
    // First get the company user to find their dealer_id
    const companyUser = await this.companyUserRepository.findOne({
      where: { id: companyUserId },
    });

    if (!companyUser) {
      throw new NotFoundException('Company user not found');
    }

    // Get all notes for this lead that belong to company users from the same dealer
    const notes = await this.leadNoteRepository
      .createQueryBuilder('note')
      .innerJoin('note.companyUser', 'companyUser')
      .where('note.lead_id = :leadId', { leadId })
      .andWhere('companyUser.dealer_id = :dealerId', { dealerId: companyUser.dealer_id })
      .orderBy('note.created_at', 'DESC')
      .getMany();

    return notes;
  }

  async update(
    noteId: number,
    companyUserId: number,
    dto: UpdateLeadNoteDto,
  ): Promise<LeadNote> {
    const note = await this.leadNoteRepository.findOne({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Check ownership
    if (note.company_user_id !== companyUserId) {
      throw new ForbiddenException('You can only edit your own notes');
    }

    note.content = dto.content.substring(0, 500); // Enforce 500 char limit
    return await this.leadNoteRepository.save(note);
  }

  async delete(noteId: number, companyUserId: number): Promise<void> {
    const note = await this.leadNoteRepository.findOne({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Check ownership
    if (note.company_user_id !== companyUserId) {
      throw new ForbiddenException('You can only delete your own notes');
    }

    await this.leadNoteRepository.delete(noteId);
  }
}
