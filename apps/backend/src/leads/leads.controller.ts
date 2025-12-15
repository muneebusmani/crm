import {
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
  Query,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { DealerGuard } from 'src/auth/guards/dealer.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CustomError } from '../common/custom-error';
import { LeadsGateway } from './leads.gateway';
import { LeadsService } from './leads.service';

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
  async find(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<
    ApiResponse<
      | Lead[]
      | {
          data: Lead[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        }
    >
  > {
    const dealerId = req.user.id;

    // If pagination params provided, use paginated method
    if (page || limit) {
      const pageNum = parseInt(page || '1', 10);
      const limitNum = Math.min(parseInt(limit || '10', 10), 100); // Cap at 100
      const result = await this.leadsService.findAllPaginated(
        dealerId,
        pageNum,
        limitNum,
        search,
      );
      return this.buildResponse(result);
    }

    // Otherwise return all leads (backward compatible)
    const result = await this.leadsService.findAll(dealerId);
    return this.buildResponse(result);
  }

  @UseGuards(JwtAuthGuard, DealerGuard)
  @Get('dealer')
  async findAllForDealer(@Req() req): Promise<ApiResponse<Lead[]>> {
    const dealerId = req.user.id;
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

  @Post(':id/fetch-more-info')
  @UseGuards(JwtAuthGuard, DealerGuard)
  async fetchMoreInfo(
    @Param('id') id: number,
    @Req() req,
  ): Promise<ApiResponse<Lead>> {
    const dealerId = req.user.id;
    const result = await this.leadsService.fetchMoreInfo(id, dealerId);
    this.leadsGateway.emitUpdateLead(result); // Emit via gateway if needed
    return this.buildResponse(result);
  }

  @Get(':id/vehicle-details')
  @UseGuards(JwtAuthGuard, DealerGuard)
  async getVehicleDetails(
    @Param('id') id: number,
    @Req() req,
  ): Promise<ApiResponse<any>> {
    const dealerId = req.user.id;
    const result = await this.leadsService.getVehicleDetails(id, dealerId);
    return this.buildResponse(result);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<ApiResponse<any>> {
    const result = await this.leadsService.remove(id);
    this.leadsGateway.emitRemoveLead(id); // Emit via gateway
    return this.buildResponse(result);
  }

  // Get HQ leads assigned to the logged-in dealer
  @UseGuards(JwtAuthGuard, DealerGuard)
  @Get('hq/my-leads')
  async getMyHqLeads(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<
    ApiResponse<
      | Lead[]
      | {
          data: Lead[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        }
    >
  > {
    const dealerId = req.user.id;

    // If pagination params provided, use paginated method
    if (page || limit) {
      const pageNum = parseInt(page || '1', 10);
      const limitNum = Math.min(parseInt(limit || '10', 10), 100); // Cap at 100
      const result = await this.leadsService.getHqLeadsForDealerPaginated(
        dealerId,
        pageNum,
        limitNum,
        search,
      );
      return this.buildResponse(result);
    }

    // Otherwise return all HQ leads (backward compatible)
    const result = await this.leadsService.getHqLeadsForDealer(dealerId);
    return this.buildResponse(result);
  }

  // Get dealer's HQ lead quota status
  @UseGuards(JwtAuthGuard, DealerGuard)
  @Get('hq/my-quota')
  async getMyHqQuota(@Req() req): Promise<ApiResponse<any>> {
    const userId = req.user.id;
    const result = await this.leadsService.getMyHqQuota(userId);
    return this.buildResponse(result);
  }
}
