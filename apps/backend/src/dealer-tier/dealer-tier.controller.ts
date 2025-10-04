// src/user/dealer-tier/dealer-tier.controller.ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DealerTierService } from './dealer-tier.service';

@Controller('dealer-tiers')
export class DealerTierController {
  constructor(private readonly dealerTierService: DealerTierService) {}

  // GET /dealer-tiers → fetch all tiers
  @Get()
  async getAllTiers() {
    return this.dealerTierService.getAllTiers();
  }

  // GET /dealer-tiers/:id → fetch single tier by id
  @Get(':id')
  async getTierById(@Param('id', ParseIntPipe) id: number) {
    return this.dealerTierService.getTierById(id);
  }
}
