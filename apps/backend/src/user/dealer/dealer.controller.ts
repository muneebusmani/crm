import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { DealerService } from './dealer.service';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { UpdateDealerDto } from './dto/update-dealer.dto';

@Controller('dealers')
export class DealerController {
  constructor(private readonly dealerService: DealerService) {}

  @Post()
  create(@Body() dto: CreateDealerDto) {
    return this.dealerService.createDealer(dto);
  }

  @Get()
  findAll() {
    return this.dealerService.getAllDealers();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dealerService.getDealerById(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDealerDto) {
    return this.dealerService.updateDealer(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dealerService.deleteDealer(id);
  }
}
