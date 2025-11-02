import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { LeadsService } from '../src/leads/leads.service';
import { AuthService } from '../src/auth/auth.service';
import { AnalyticsService } from '../src/analytics/analytics.service';
import { DealerService } from '../src/user/dealer/dealer.service';
import { AdminService } from '../src/user/admin/admin.service';
import { QuotationService } from '../src/quotations/quotation.service';
import { InvoiceService } from '../src/invoices/invoice.service';
import { BusinessSettingService } from '../src/business-setting/business-setting.service';
import { DealerTierService } from '../src/dealer-tier/dealer-tier.service';

describe('Backend Services Tests (e2e)', () => {
  let app: INestApplication;
  let leadsService: LeadsService;
  let authService: AuthService;
  let analyticsService: AnalyticsService;
  let dealerService: DealerService;
  let adminService: AdminService;
  let quotationService: QuotationService;
  let invoiceService: InvoiceService;
  let businessSettingService: BusinessSettingService;
  let dealerTierService: DealerTierService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get service instances
    leadsService = moduleFixture.get<LeadsService>(LeadsService);
    authService = moduleFixture.get<AuthService>(AuthService);
    analyticsService = moduleFixture.get<AnalyticsService>(AnalyticsService);
    dealerService = moduleFixture.get<DealerService>(DealerService);
    adminService = moduleFixture.get<AdminService>(AdminService);
    quotationService = moduleFixture.get<QuotationService>(QuotationService);
    invoiceService = moduleFixture.get<InvoiceService>(InvoiceService);
    businessSettingService = moduleFixture.get<BusinessSettingService>(BusinessSettingService);
    dealerTierService = moduleFixture.get<DealerTierService>(DealerTierService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Service Availability', () => {
    it('should have LeadsService available', () => {
      expect(leadsService).toBeDefined();
    });

    it('should have AuthService available', () => {
      expect(authService).toBeDefined();
    });

    it('should have AnalyticsService available', () => {
      expect(analyticsService).toBeDefined();
    });

    it('should have DealerService available', () => {
      expect(dealerService).toBeDefined();
    });

    it('should have AdminService available', () => {
      expect(adminService).toBeDefined();
    });

    it('should have QuotationService available', () => {
      expect(quotationService).toBeDefined();
    });

    it('should have InvoiceService available', () => {
      expect(invoiceService).toBeDefined();
    });

    it('should have BusinessSettingService available', () => {
      expect(businessSettingService).toBeDefined();
    });

    it('should have DealerTierService available', () => {
      expect(dealerTierService).toBeDefined();
    });
  });

  describe('LeadsService', () => {
    it('should have findAll method', () => {
      expect(leadsService.findAll).toBeDefined();
      expect(typeof leadsService.findAll).toBe('function');
    });

    it('should have create method', () => {
      expect(leadsService.create).toBeDefined();
      expect(typeof leadsService.create).toBe('function');
    });

    it('should have update method', () => {
      expect(leadsService.update).toBeDefined();
      expect(typeof leadsService.update).toBe('function');
    });

    it('should have remove method', () => {
      expect(leadsService.remove).toBeDefined();
      expect(typeof leadsService.remove).toBe('function');
    });

    it('should have getLeadById method', () => {
      expect(leadsService.getLeadById).toBeDefined();
      expect(typeof leadsService.getLeadById).toBe('function');
    });

    it('should have findAllForDealer method', () => {
      expect(leadsService.findAllForDealer).toBeDefined();
      expect(typeof leadsService.findAllForDealer).toBe('function');
    });
  });

  describe('AuthService', () => {
    it('should have login method', () => {
      expect(authService.login).toBeDefined();
      expect(typeof authService.login).toBe('function');
    });

    it('should have register method', () => {
      expect(authService.register).toBeDefined();
      expect(typeof authService.register).toBe('function');
    });

    it('should have refresh method', () => {
      expect(authService.refresh).toBeDefined();
      expect(typeof authService.refresh).toBe('function');
    });

    it('should have validateUser method', () => {
      expect(authService.validateUser).toBeDefined();
      expect(typeof authService.validateUser).toBe('function');
    });
  });

  describe('AnalyticsService', () => {
    it('should have getTotalLeadsCount method', () => {
      expect(analyticsService.getTotalLeadsCount).toBeDefined();
      expect(typeof analyticsService.getTotalLeadsCount).toBe('function');
    });

    it('should have getMonthlyLeads method', () => {
      expect(analyticsService.getMonthlyLeads).toBeDefined();
      expect(typeof analyticsService.getMonthlyLeads).toBe('function');
    });

    it('should have getLeadsByDateRange method', () => {
      expect(analyticsService.getLeadsByDateRange).toBeDefined();
      expect(typeof analyticsService.getLeadsByDateRange).toBe('function');
    });

    it('should have getDealerTotalRevenue method', () => {
      expect(analyticsService.getDealerTotalRevenue).toBeDefined();
      expect(typeof analyticsService.getDealerTotalRevenue).toBe('function');
    });

    it('should have getDealerConversionRate method', () => {
      expect(analyticsService.getDealerConversionRate).toBeDefined();
      expect(typeof analyticsService.getDealerConversionRate).toBe('function');
    });

    it('should have getTodayUnassignedLeadsCount method', () => {
      expect(analyticsService.getTodayUnassignedLeadsCount).toBeDefined();
      expect(typeof analyticsService.getTodayUnassignedLeadsCount).toBe('function');
    });

    it('should have getDealerTierCreditsByUser method', () => {
      expect(analyticsService.getDealerTierCreditsByUser).toBeDefined();
      expect(typeof analyticsService.getDealerTierCreditsByUser).toBe('function');
    });
  });

  describe('DealerService', () => {
    it('should have findAll method', () => {
      expect(dealerService.findAll).toBeDefined();
      expect(typeof dealerService.findAll).toBe('function');
    });

    it('should have findOne method', () => {
      expect(dealerService.findOne).toBeDefined();
      expect(typeof dealerService.findOne).toBe('function');
    });

    it('should have update method', () => {
      expect(dealerService.update).toBeDefined();
      expect(typeof dealerService.update).toBe('function');
    });
  });

  describe('QuotationService', () => {
    it('should have create method', () => {
      expect(quotationService.create).toBeDefined();
      expect(typeof quotationService.create).toBe('function');
    });

    it('should have findAll method', () => {
      expect(quotationService.findAll).toBeDefined();
      expect(typeof quotationService.findAll).toBe('function');
    });

    it('should have findOne method', () => {
      expect(quotationService.findOne).toBeDefined();
      expect(typeof quotationService.findOne).toBe('function');
    });

    it('should have update method', () => {
      expect(quotationService.update).toBeDefined();
      expect(typeof quotationService.update).toBe('function');
    });

    it('should have remove method', () => {
      expect(quotationService.remove).toBeDefined();
      expect(typeof quotationService.remove).toBe('function');
    });
  });

  describe('InvoiceService', () => {
    it('should have create method', () => {
      expect(invoiceService.create).toBeDefined();
      expect(typeof invoiceService.create).toBe('function');
    });

    it('should have findAll method', () => {
      expect(invoiceService.findAll).toBeDefined();
      expect(typeof invoiceService.findAll).toBe('function');
    });

    it('should have findOne method', () => {
      expect(invoiceService.findOne).toBeDefined();
      expect(typeof invoiceService.findOne).toBe('function');
    });

    it('should have update method', () => {
      expect(invoiceService.update).toBeDefined();
      expect(typeof invoiceService.update).toBe('function');
    });

    it('should have remove method', () => {
      expect(invoiceService.remove).toBeDefined();
      expect(typeof invoiceService.remove).toBe('function');
    });
  });

  describe('BusinessSettingService', () => {
    it('should have getSettings method', () => {
      expect(businessSettingService.getSettings).toBeDefined();
      expect(typeof businessSettingService.getSettings).toBe('function');
    });

    it('should have upsertSettings method', () => {
      expect(businessSettingService.upsertSettings).toBeDefined();
      expect(typeof businessSettingService.upsertSettings).toBe('function');
    });
  });

  describe('DealerTierService', () => {
    it('should have create method', () => {
      expect(dealerTierService.create).toBeDefined();
      expect(typeof dealerTierService.create).toBe('function');
    });

    it('should have findAll method', () => {
      expect(dealerTierService.findAll).toBeDefined();
      expect(typeof dealerTierService.findAll).toBe('function');
    });

    it('should have findOne method', () => {
      expect(dealerTierService.findOne).toBeDefined();
      expect(typeof dealerTierService.findOne).toBe('function');
    });

    it('should have update method', () => {
      expect(dealerTierService.update).toBeDefined();
      expect(typeof dealerTierService.update).toBe('function');
    });

    it('should have remove method', () => {
      expect(dealerTierService.remove).toBeDefined();
      expect(typeof dealerTierService.remove).toBe('function');
    });
  });

  describe('Service Methods Execution', () => {
    it('should be able to call getTotalLeadsCount', async () => {
      await expect(analyticsService.getTotalLeadsCount()).resolves.toBeDefined();
    });

    it('should be able to call getMonthlyLeads', async () => {
      await expect(analyticsService.getMonthlyLeads()).resolves.toBeDefined();
    });

    it('should be able to call findAll on dealer tiers', async () => {
      await expect(dealerTierService.findAll()).resolves.toBeDefined();
    });

    it('should handle service errors gracefully', async () => {
      // Try to find a non-existent lead
      await expect(
        leadsService.getLeadById(999999, 1)
      ).rejects.toThrow();
    });
  });

  describe('Service Dependencies', () => {
    it('services should have repository dependencies injected', () => {
      // Check if services have necessary dependencies
      expect(leadsService).toHaveProperty('leadsRepository');
    });
  });
});
