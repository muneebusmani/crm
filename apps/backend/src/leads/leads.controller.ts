import {
  type ApiResponse,
  type CreateLeadDto,
  CreateLeadSchema,
  type Lead,
  type UpdateLeadDto,
  UpdateLeadSchema,
} from '@crm/types'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from 'nestjs-zod'
import { CustomError } from '../common/custom-error'
import { LeadsGateway } from './leads.gateway'
import { LeadsService } from './leads.service'

@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly leadsGateway: LeadsGateway,
  ) {}

  private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
    try {
      return { data, success: true }
    } catch (error) {
      const message =
        error instanceof CustomError ? error.message : 'Internal server error'
      return { error: message, success: false }
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateLeadSchema))
  async create(@Body() dto: CreateLeadDto): Promise<ApiResponse<Lead>> {
    const result = await this.leadsService.create(dto)
    this.leadsGateway.emitCreateLead(result) // Emit via gateway
    return this.buildResponse(result)
  }

  @Get()
  async findAll(): Promise<ApiResponse<Lead[]>> {
    const result = await this.leadsService.findAll()
    return this.buildResponse(result)
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<Lead>> {
    const result = await this.leadsService.findOne(id)
    return this.buildResponse(result)
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(UpdateLeadSchema))
  async update(
    @Body() dto: UpdateLeadDto & { id: number },
  ): Promise<ApiResponse<Lead>> {
    const { id, ...updateFields } = dto
    const result = await this.leadsService.update(id, updateFields)
    this.leadsGateway.emitUpdateLead(result) // Emit via gateway
    return this.buildResponse(result)
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<ApiResponse<any>> {
    const result = await this.leadsService.remove(id)
    this.leadsGateway.emitRemoveLead(id) // Emit via gateway
    return this.buildResponse(result)
  }
}
