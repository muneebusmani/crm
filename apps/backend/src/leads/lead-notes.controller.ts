import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { LeadNotesService } from './lead-notes.service';
import type { CreateLeadNoteDto, UpdateLeadNoteDto } from './lead-notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { DealerGuard } from '../auth/guards/dealer.guard';
import type { ApiResponse } from '@crm/types';
import { CustomError } from '../common/custom-error';

@Controller('leads')
@UseGuards(JwtAuthGuard, DealerGuard)
export class LeadNotesController {
  constructor(private readonly leadNotesService: LeadNotesService) {}

  private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
    try {
      return { data, success: true };
    } catch (error) {
      const message =
        error instanceof CustomError ? error.message : 'Internal server error';
      return { error: message, success: false };
    }
  }

  @Post(':leadId/:profileId/notes')
  async create(
    @Param('leadId', ParseIntPipe) leadId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() dto: CreateLeadNoteDto,
  ) {
    if (!profileId) {
      console.log("No ProfileSelected")
      throw new CustomError('No profile selected');
    }
    const note = await this.leadNotesService.create(
      leadId,
      Number(profileId),
      dto,
    );
    return this.buildResponse(note);
  }

  @Get(':leadId/notes')
  async findByLeadId(@Param('leadId', ParseIntPipe) leadId: number) {
    const notes = await this.leadNotesService.findByLeadId(leadId);
    return this.buildResponse(notes);
  }

  @Patch(':profileId/notes/:noteId')
  async update(
    @Param('noteId', ParseIntPipe) noteId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() dto: UpdateLeadNoteDto,
  ) {
    if (!profileId) {
      console.log("No ProfileSelected")
      throw new CustomError('No profile selected');
    }

    const note = await this.leadNotesService.update(
      noteId,
      Number(profileId),
      dto,
    );
    return this.buildResponse(note);
  }

  @Delete(':profileId/notes/:noteId')
  async delete(
    @Param('noteId', ParseIntPipe) noteId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    if (!profileId) {
      console.log("No ProfileSelected")
      throw new CustomError('No profile selected');
    }

    await this.leadNotesService.delete(noteId, Number(profileId));
    return this.buildResponse({ message: 'Note deleted successfully' });
  }
}
