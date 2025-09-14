import { Controller, Post, Body, Get, Param, Put, Delete, UsePipes, HttpCode, HttpStatus } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { type ApiResponse, type CreateLeadDto, CreateLeadSchema, Lead, type UpdateLeadDto, UpdateLeadSchema } from '@crm/types';
import { LeadsGateway } from './leads.gateway';
import { CustomError } from '../common/custom-error';
import { ZodValidationPipe } from 'nestjs-zod';


@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly leadsGateway: LeadsGateway,
  ) {}

  private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
    try {
      return { success: true, data };
    } catch (error) {
      const message =
        error instanceof CustomError
          ? error.message
          : 'Internal server error';
      return { success: false, error: message };
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateLeadSchema))
  async create(@Body() dto: CreateLeadDto): Promise<ApiResponse<Lead>> {
    const result = await this.leadsService.create(dto);
    // Emit via gateway
    this.leadsGateway.emitCreateLead(result);
    return this.buildResponse(result);
  }

  @Get()
  async findAll(): Promise<ApiResponse<Lead[]>> {
    const result = await this.leadsService.findAll();
    return this.buildResponse(result);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<Lead>> {
    const result = await this.leadsService.findOne(id);
    return this.buildResponse(result);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(UpdateLeadSchema))
  async update(@Body() dto: UpdateLeadDto & { id: number }): Promise<ApiResponse<Lead>> {
    const { id, ...updateFields } = dto;
    const result = await this.leadsService.update(id, updateFields);
    // Emit via gateway
    this.leadsGateway.emitUpdateLead(result);
    return this.buildResponse(result);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<ApiResponse<any>> {
    const result = await this.leadsService.remove(id);

    // Emit via gateway
    this.leadsGateway.emitRemoveLead(id);

    return this.buildResponse(result);
  }
}
