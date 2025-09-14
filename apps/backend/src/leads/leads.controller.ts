import { type ApiResponse, type CreateLeadDto, CreateLeadSchema, type UpdateLeadDto, UpdateLeadSchema } from '@crm/types';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ZodError, z } from 'zod';
import { CustomError } from '../common/custom-error';
import type { LeadsGateway } from './leads.gateway';
import type { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly leadsGateway: LeadsGateway,
  ) {}

  private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
    try {
      return { data, success: true };
    } catch (error) {
      const message =
        error instanceof CustomError
          ? error.message
          : error instanceof ZodError
          ? error.issues.map(e => e.message).join(', ')
          : 'Internal server error';
      return { error: message, success: false };
    }
  }

  private validate<TSchema extends { safeParse: (v: unknown) => any }>(
    schema: TSchema,
    payload: unknown,
  ): { ok: true; data: any } | { ok: false; error: string } {
    const result = schema.safeParse(payload);
    if (result.success) return { data: result.data, ok: true };

    const errMsg = result.error.issues
      .map(e => {
        const path = e.path.length ? `${e.path.join('.')}: ` : '';
        return `${path}${e.message}`;
      })
      .join('; ');

    return { error: errMsg, ok: false };
  }

  @Post()
  async create(@Body() payload: unknown): Promise<ApiResponse<any>> {
    const v = this.validate(CreateLeadSchema, payload);
    if (!v.ok) return { success: false, error: v.error };

    const dto: CreateLeadDto = v.data;
    const result = await this.leadsService.create(dto);

    // Emit via gateway
    this.leadsGateway.emitCreateLead(result);

    return this.buildResponse(result);
  }

  @Get()
  async findAll(): Promise<ApiResponse<any>> {
    const result = await this.leadsService.findAll();
    return this.buildResponse(result);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<any>> {
    const result = await this.leadsService.findOne(id);
    return this.buildResponse(result);
  }

  @Put()
  async update(@Body() payload: unknown): Promise<ApiResponse<any>> {
    const UpdateWithId = UpdateLeadSchema.extend({ id: z.number() });
    const v = this.validate(UpdateWithId, payload);
    if (!v.ok) return { error: v.error, success: false };

    const dto: UpdateLeadDto & { id: number } = v.data;
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
