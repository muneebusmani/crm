import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { LeadsService } from '../src/leads/leads.service';
import { Lead } from '../src/leads/entities/lead.entity';
import { HqLeadSettings } from '../src/leads/entities';
import { User } from '../src/user/entities';
import { CreateLeadDto } from '../src/leads/dto/create-lead.dto';

describe('HQ Leads Module Integration Test', () => {
  let app: INestApplication;
  let leadsService: LeadsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider('ActivityLogger')
    .useValue({
      log: jest.fn(),
    })
    .overrideProvider('AppLogger')
    .useValue({
      error: jest.fn(),
      log: jest.fn(),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    leadsService = moduleFixture.get<LeadsService>(LeadsService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete HQ Leads Flow', () => {
    it('should process an HQ lead through the complete flow', async () => {
      // Step 1: Create HQ lead settings for Bronze package
      const bronzeSetting = {
        packageTier: 'Bronze',
        dailyLimit: 2,
        isActive: true,
      };
      
      // Mock the service methods for creating settings
      jest.spyOn(leadsService, 'createHqLeadSetting').mockResolvedValue({
        id: 1,
        ...bronzeSetting,
        created_at: new Date(),
        updated_at: new Date(),
      } as any);

      const createSettingResponse = await request(app.getHttpServer())
        .post('/admin/hq-leads/settings')
        .send(bronzeSetting);

      expect(createSettingResponse.status).toBe(201);

      // Step 2: Create a new lead with an HQ brand (BMW)
      const createLeadDto: CreateLeadDto = {
        vehicle_brand: 'BMW',
        vehicle_model: 'X5',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '+1234567890',
        source: 'Test Source',
      };

      // Mock the lead creation response
      const createdLead: Lead = {
        id: 1,
        ...createLeadDto,
        isHqLead: true, // Should be automatically set to true
        assigned_to: null,
        follow_up_date: undefined,
        notes: undefined,
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
        is_deleted: false,
        wonByDealerId: undefined,
        moreInfoFetched: false,
        number: undefined,
        vehicle_reg: undefined,
        vehicle_title: undefined,
        vehicle_vrm: undefined,
        vehicle_series: undefined,
        vehicle_part: undefined,
        engin_capacity: undefined,
        fuelType: undefined,
        part_supplied: undefined,
        supply_only: undefined,
        consider_both: undefined,
        reconditioned_condition: undefined,
        used_condition: undefined,
        new_condition: undefined,
        consider_all_condition: undefined,
        postcode: undefined,
        vehicle_drive: undefined,
        collection_required: undefined,
        email: undefined,
        name: undefined,
        description: undefined,
        engine_code: undefined,
        messages: [],
        dealerLeads: [],
        quotations: [],
        invoices: [],
      };

      jest.spyOn(leadsService, 'create').mockResolvedValue(createdLead);

      const createLeadResponse = await request(app.getHttpServer())
        .post('/api/leads') // This would be the actual lead creation endpoint
        .send(createLeadDto);

      // Verify that the lead was created as an HQ lead
      expect(createLeadResponse.status).toBe(201); // Assuming successful creation status
      // Note: The actual status code depends on your existing leads controller implementation

      // Step 3: Check if the lead was correctly identified as HQ lead
      const isHq = leadsService.isHqLead('BMW');
      expect(isHq).toBe(true);

      // Step 4: Check dealer quota (this would require mocking more complex dealer/tier logic)
      jest.spyOn(leadsService, 'getDealerPackageTier').mockResolvedValue('Bronze');
      jest.spyOn(leadsService, 'getDailyLimitForTier').mockResolvedValue(2);
      jest.spyOn(leadsService, 'checkHqLeadQuota').mockResolvedValue({
        canAssign: true,
        assignedCount: 0,
        dailyLimit: 2,
      });

      // Step 5: Assign the HQ lead to a dealer
      jest.spyOn(leadsService, 'assignHqLeadToDealer').mockResolvedValue(true);
      
      const assignResponse = await request(app.getHttpServer())
        .post('/admin/hq-leads/assign/1/to/1') // Assign lead 1 to dealer 1
        .set('Authorization', 'Bearer mock-admin-token'); // Assuming admin auth is required

      expect(assignResponse.status).toBe(201); // Assuming successful assignment status
    });

    it('should prevent assignment when quota is reached', async () => {
      // Mock that the dealer has reached their quota
      jest.spyOn(leadsService, 'checkHqLeadQuota').mockResolvedValue({
        canAssign: false,
        assignedCount: 2,
        dailyLimit: 2,
      });

      const assignResponse = await request(app.getHttpServer())
        .post('/admin/hq-leads/assign/1/to/1')
        .set('Authorization', 'Bearer mock-admin-token');

      // Should return an error status when quota is exceeded
      expect(assignResponse.status).toBe(400);
    });

    it('should allow assignment with unlimited quota', async () => {
      // Mock an unlimited package tier (like Gold)
      jest.spyOn(leadsService, 'getDailyLimitForTier').mockResolvedValue(-1); // Unlimited
      jest.spyOn(leadsService, 'checkHqLeadQuota').mockResolvedValue({
        canAssign: true,
        assignedCount: 10, // Even with 10 assigned
        dailyLimit: -1,   // Should still allow more
      });

      const assignResponse = await request(app.getHttpServer())
        .post('/admin/hq-leads/assign/2/to/1')
        .set('Authorization', 'Bearer mock-admin-token');

      expect(assignResponse.status).toBe(201); // Should allow assignment
    });
  });

  describe('HQ Lead Identification', () => {
    it('should correctly identify HQ brands', () => {
      expect(leadsService.isHqLead('BMW')).toBe(true);
      expect(leadsService.isHqLead('Land Rover')).toBe(true);
      expect(leadsService.isHqLead('Range Rover')).toBe(true);
      expect(leadsService.isHqLead('Jaguar')).toBe(true);
      expect(leadsService.isHqLead('Mercedes Benz')).toBe(true);
      
      // Test case insensitive matching
      expect(leadsService.isHqLead('bmw')).toBe(true);
      expect(leadsService.isHqLead('BMW X5')).toBe(true);
      expect(leadsService.isHqLead('Mercedes-Benz')).toBe(true);
      
      // Non-HQ brands
      expect(leadsService.isHqLead('Toyota')).toBe(false);
      expect(leadsService.isHqLead('')).toBe(false);
      expect(leadsService.isHqLead(null as any)).toBe(false);
    });
  });
});