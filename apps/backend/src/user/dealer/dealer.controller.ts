import {
  ApiResponse,
  type CreateDealerDto,
  type UpdateDealerDto,
  User,
} from '@crm/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import { DealerGuard } from 'src/auth/guards/dealer.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CustomError } from 'src/common/custom-error';
import type { AuthenticatedRequest } from 'src/common/user.interface';
import { Lead } from 'src/leads/entities/lead.entity';
import { DealerService } from './dealer.service';

@Controller('dealers')
export class DealerController {
  private readonly logger = new Logger(DealerController.name);

  constructor(private readonly dealerService: DealerService) {}
  private async buildResponse<T>(data: T): Promise<ApiResponse<T>> {
    try {
      return { success: true, data };
    } catch (error) {
      const message =
        error instanceof CustomError ? error.message : 'Internal server error';
      return { success: false, error: message };
    }
  }
  @Post()
  @UseInterceptors(FileInterceptor('logoFile'))
  async create(
    @Body() dto: Omit<CreateDealerDto, 'logo'> & { logo?: string }, // include logo in body
    @UploadedFile() file: Multer.File, // ✅ Multer file type
  ) {
    return this.dealerService.createDealer(dto, file);
  }

  @Get()
  findAll() {
    return this.dealerService.getAllDealers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile/me')
  getProfile(@Req() req: AuthenticatedRequest) {
    console.log('Request Recieved for Dealer:', req.user.id);
    return this.dealerService.getDealerById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/credits')
  async getCredits(@Req() req: AuthenticatedRequest) {
    return this.dealerService.getDealerCredits(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/profile/me')
  @UseInterceptors(FileInterceptor('logoFile'))
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateDealerDto,
    @UploadedFile() file?: Multer.File,
  ) {
    return this.dealerService.updateDealer(req.user.id, dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/profile/logo-path')
  async updateLogoPath(
    @Req() req: AuthenticatedRequest,
    @Body() body: { logoPath: string },
  ) {
    return this.dealerService.updateDealerLogoPath(req.user.id, body.logoPath);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dealerService.getDealerById(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('logoFile'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDealerDto & { logo?: string },
    @UploadedFile() file?: Multer.File,
  ) {
    try {
      return await this.dealerService.updateDealer(id, dto, file);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Failed to update dealer ${id}: ${errorMessage}`,
        errorStack,
      );

      throw new HttpException(
        errorMessage || 'Failed to update dealer',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.dealerService.deleteDealer(id);
      return result;
    } catch (error) {
      console.error('Error deleting dealer:', error);
      throw error;
    }
  }

  // @UseGuards(JwtAuthGuard, DealerGuard)
  // @Post('quotations')
  // @UsePipes(new ZodValidationPipe(CreateQuotationSchema))
  // async createQuotation(
  //   @Body() dto: CreateQuotationDto,
  //   @Req() req,
  // ): Promise<ApiResponse<Quotation>> {
  //   const delaerId = req.user.id; // cast to 'any' if TS complains
  //   const result = await this.dealerService.createQuotation(dto, delaerId);
  //   return this.buildResponse(result);
  // }

  // @UseGuards(JwtAuthGuard, DealerGuard)
  // @Get('quotations/leads/:id')
  // async fetchQuotations(
  //   @Param('id') id: number,
  //   @Req() req,
  // ): Promise<ApiResponse<Quotation[]>> {
  //   const delaerId = req.user.id; // cast to 'any' if TS complains
  //   const result = await this.dealerService.fetchQuotations(id, delaerId);
  //   return this.buildResponse(result);
  // }
  //
  // @UseGuards(JwtAuthGuard, DealerGuard)
  // @Get('all/quotations')
  // async getAllQuotations(@Req() req): Promise<ApiResponse<Quotation[]>> {
  //   const dealerId = req.user.id;
  //   const result = await this.dealerService.getAllQuotations(dealerId);
  //   return this.buildResponse(result);
  // }

  // @UseGuards(JwtAuthGuard, DealerGuard)
  // @Get('quotations/:id')
  // async getQuotationById(
  //   @Param('id') id: number,
  //   @Req() req,
  // ): Promise<ApiResponse<Quotation>> {
  //   const dealerId = req.user.id;
  //   const result = await this.dealerService.getQuotationById(id, dealerId);
  //   return this.buildResponse(result);
  // }

  @Post('forgot-password')
  async forgotPassword(
    @Body('email') email: string,
  ): Promise<ApiResponse<User>> {
    const result = await this.dealerService.forgotPassword(email);
    return this.buildResponse(result);
  }

  @UseGuards(JwtAuthGuard, DealerGuard)
  @Get('/leads/:id')
  async findLeadById(
    @Param('id') id: number,
    @Req() req,
  ): Promise<ApiResponse<Lead>> {
    const dealerId = req.user.id; // dealer is the logged-in user
    const result = await this.dealerService.getLeadById(id, dealerId);
    return this.buildResponse(result);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ): Promise<ApiResponse<User>> {
    const result = await this.dealerService.resetPassword(token, newPassword);
    return this.buildResponse(result);
  }
}
