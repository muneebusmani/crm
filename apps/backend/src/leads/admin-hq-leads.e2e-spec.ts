import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { LeadsModule } from '../src/leads/leads.module';
import { HqLeadSettings } from '../src/leads/entities';
import { LeadsService } from '../src/leads/leads.service';

describe('AdminHqLeadsController (e2e)', () => {
  let app: INestApplication;
  let leadsService: LeadsService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [LeadsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    leadsService = moduleFixture.get<LeadsService>(LeadsService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/admin/hq-leads/settings (GET)', () => {
    it('should return HQ lead settings', async () => {
      // Mock the repository response
      const mockSettings: HqLeadSettings[] = [
        {
          id: 1,
          packageTier: 'Bronze',
          dailyLimit: 2,
          isActive: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          packageTier: 'Silver',
          dailyLimit: 4,
          isActive: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(leadsService, 'getAllHqLeadSettings').mockResolvedValue(mockSettings);

      return request(app.getHttpServer())
        .get('/admin/hq-leads/settings')
        .expect(200)
        .expect(mockSettings);
    });
  });

  describe('/admin/hq-leads/settings (POST)', () => {
    it('should create a new HQ lead setting', async () => {
      const newSetting = {
        packageTier: 'Gold',
        dailyLimit: -1, // unlimited
        isActive: true,
      };

      const createdSetting = {
        id: 3,
        ...newSetting,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(leadsService, 'createHqLeadSetting').mockResolvedValue(createdSetting as any);

      return request(app.getHttpServer())
        .post('/admin/hq-leads/settings')
        .send(newSetting)
        .expect(201)
        .expect(createdSetting);
    });
  });

  describe('/admin/hq-leads/settings/:packageTier (PUT)', () => {
    it('should update an existing HQ lead setting', async () => {
      const updateData = {
        packageTier: 'Bronze',
        dailyLimit: 3, // updated from default 2
        isActive: true,
      };

      const updatedSetting = {
        id: 1,
        ...updateData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(leadsService, 'updateHqLeadSetting').mockResolvedValue(updatedSetting as any);

      return request(app.getHttpServer())
        .put('/admin/hq-leads/settings/Bronze')
        .send(updateData)
        .expect(200)
        .expect(updatedSetting);
    });
  });
});