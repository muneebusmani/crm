import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LeadMessageService } from './lead-message.service';
import type {
  ApiResponse,
  CreateLeadMessageDto,
  UpdateLeadMessageDto,
} from '@crm/types';
import { CustomError } from 'src/common/custom-error';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { DealerGuard } from 'src/auth/guards/dealer.guard';

@Controller('lead-messages')
export class LeadMessageController {
  constructor(private readonly leadMessageService: LeadMessageService) {}

  private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
    try {
      return { data, success: true };
    } catch (error) {
      const message =
        error instanceof CustomError ? error.message : 'Internal server error';
      return { error: message, success: false };
    }
  }

  @UseGuards(JwtAuthGuard, DealerGuard)
  @Post()
  async create(@Body() dto: CreateLeadMessageDto, @Req() req) {
    const dealerId = req.user.id;
    console.log('user ===>', req.user);
    const result = await this.leadMessageService.create(dto, dealerId);
    return this.buildResponse(result);
  }

  @Get()
  findAll() {
    return this.leadMessageService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, DealerGuard)
  @Post()
  async findOne(@Param('id') id: number, @Req() req) {
    const dealerId = req.user.id;
    return await this.leadMessageService.findOne(id, dealerId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadMessageDto) {
    const result = this.leadMessageService.update(+id, dto);
    return this.buildResponse(result);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const result = this.leadMessageService.remove(+id);
    return this.buildResponse(result);
  }

  @Get('/lead/:leadId')
  findByLead(@Param('leadId') leadId: number) {
    const result = this.leadMessageService.findByLead(leadId);
    return this.buildResponse(result);
  }
}
