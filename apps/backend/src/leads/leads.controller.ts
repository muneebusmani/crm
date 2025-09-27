import  {
  type ApiResponse,
  type CreateLeadDto,
  CreateLeadSchema,
  type Lead,
  type UpdateLeadDto,
  UpdateLeadSchema,
} from '@crm/types';
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
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { CustomError } from '../common/custom-error';
import { LeadsGateway } from './leads.gateway';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { DealerGuard } from 'src/auth/guards/dealer.guard';

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
        error instanceof CustomError ? error.message : 'Internal server error';
      return { error: message, success: false };
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateLeadSchema))
  async create(@Body() dto: CreateLeadDto): Promise<ApiResponse<Lead>> {
    const result = await this.leadsService.create(dto);
    this.leadsGateway.emitCreateLead(result); // Emit via gateway
    return this.buildResponse(result);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async find(@Req() req): Promise<ApiResponse<Lead[]>> {
    const dealerId = req.user.id; // dealer is the logged-in user
    const result = await this.leadsService.findAll(dealerId);
    return this.buildResponse(result);
  }

  @UseGuards(JwtAuthGuard, DealerGuard)
  @Get('dealer')
  async findAllForDealer(@Req() req): Promise<ApiResponse<Lead[]>> {
    const dealerId = req.user.id; // dealer is the logged-in user
    const result = await this.leadsService.findAllForDealer(dealerId);
    return this.buildResponse(result);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, DealerGuard)
  async getLeadById(
    @Param('id') id: number,
    @Req() req,
  ): Promise<ApiResponse<Lead>> {
    const dealerId = req.user.id;
    const result = await this.leadsService.getLeadById(id, dealerId);
    return this.buildResponse(result);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(UpdateLeadSchema))
  async update(
    @Body() dto: UpdateLeadDto & { id: number },
  ): Promise<ApiResponse<Lead>> {
    const { id, ...updateFields } = dto;
    const result = await this.leadsService.update(id, updateFields);
    this.leadsGateway.emitUpdateLead(result); // Emit via gateway
    return this.buildResponse(result);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<ApiResponse<any>> {
    const result = await this.leadsService.remove(id);
    this.leadsGateway.emitRemoveLead(id); // Emit via gateway
    return this.buildResponse(result);
  }
}
