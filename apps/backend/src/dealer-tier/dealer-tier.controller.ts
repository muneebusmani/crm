// src/user/dealer-tier/dealer-tier.controller.ts
import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { DealerTierService } from './dealer-tier.service';
import { CreditResetService } from './credit-reset.service';

@Controller('dealer-tiers')
export class DealerTierController {
  constructor(
    private readonly dealerTierService: DealerTierService,
    private readonly creditResetService: CreditResetService,
  ) {}

  // GET /dealer-tiers → fetch all tiers
  @Get()
  async getAllTiers() {
    return this.dealerTierService.getAllTiers();
  }

  // ============ Credit Reset Admin Endpoints ============
  // NOTE: These static routes MUST come BEFORE the dynamic :id route
  // GET /dealer-tiers/credits/status → Get credit status for all dealers
  @Get('credits/status')
  async getCreditStatus() {
    return this.creditResetService.getCreditStatus();
  }

  // POST /dealer-tiers/credits/reset-all → Reset credits for all dealers
  @Post('credits/reset-all')
  async resetAllCredits() {
    return this.creditResetService.resetAllDealerCredits();
  }

  // POST /dealer-tiers/credits/reset/:dealerId → Reset credits for specific dealer
  @Post('credits/reset/:dealerId')
  async resetDealerCredits(@Param('dealerId', ParseIntPipe) dealerId: number) {
    return this.creditResetService.resetDealerCredits(dealerId);
  }

  // GET /dealer-tiers/:id → fetch single tier by id
  // THIS MUST BE LAST because :id is a wildcard that matches anything
  @Get(':id')
  async getTierById(@Param('id', ParseIntPipe) id: number) {
    return this.dealerTierService.getTierById(id);
  }
}
