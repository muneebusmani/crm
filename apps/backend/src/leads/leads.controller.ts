import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ApiResponse } from '@crm/types';
import { CustomError } from '../common/custom-error';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  private buildResponse<T>(promise: Promise<T>): Promise<ApiResponse<T>> {
    return promise
      .then(data => ({ success: true, data }))
      .catch(error => {
        const message = error instanceof CustomError ? error.message : 'Internal server error';
        return { success: false, error: message };
      });
  }

  @Post()
  create(@Body() createLeadDto: CreateLeadDto): Promise<ApiResponse<any>> {
    return this.buildResponse(this.leadsService.create(createLeadDto));
  }

  @Get()
  findAll(): Promise<ApiResponse<any>> {
    return this.buildResponse(this.leadsService.findAll());
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.buildResponse(this.leadsService.findOne(+id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto): Promise<ApiResponse<any>> {
    return this.buildResponse(this.leadsService.update(+id, updateLeadDto));
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.buildResponse(this.leadsService.remove(+id));
  }
}
