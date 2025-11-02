import { INestApplication, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Backend Comprehensive E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let dealerToken: string;
  let adminToken: string;
  let testLeadId: number;
  let testDealerId: number;
  let testQuotationId: number;
  let testInvoiceId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Health Check', () => {
    it('should return application info', () => {
      return request(app.getHttpServer())
        .get('/api/v1')
        .expect(HttpStatus.OK);
    });
  });

  describe('Authentication Module', () => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'Test@123456',
      firstName: 'Test',
      lastName: 'User',
      type: 'dealer',
    };

    it('POST /auth/register - should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(testUser.email);
      
      authToken = response.body.accessToken;
      testDealerId = response.body.user.id;
    });

    it('POST /auth/login - should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      
      dealerToken = response.body.accessToken;
    });

    it('POST /auth/login - should fail with invalid credentials', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('POST /auth/refresh - should refresh access token', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const refreshToken = loginResponse.body.refreshToken;

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
    });
  });

  describe('Leads Module', () => {
    const testLead = {
      firstName: 'John',
      lastName: 'Doe',
      email: `lead-${Date.now()}@example.com`,
      phone: '+1234567890',
      status: 'new',
      source: 'website',
    };

    it('POST /leads - should create a new lead', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/leads')
        .send(testLead)
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(testLead.email);
      
      testLeadId = response.body.data.id;
    });

    it('GET /leads - should retrieve all leads for authenticated dealer', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/leads')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /leads/dealer - should retrieve leads for specific dealer', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/leads/dealer')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /leads/:id - should retrieve a specific lead', async () => {
      if (!testLeadId) {
        console.warn('Skipping: testLeadId not set');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testLeadId);
    });

    it('PUT /leads - should update a lead', async () => {
      if (!testLeadId) {
        console.warn('Skipping: testLeadId not set');
        return;
      }

      const updatedData = {
        id: testLeadId,
        status: 'contacted',
      };

      const response = await request(app.getHttpServer())
        .put('/api/v1/leads')
        .send(updatedData)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('contacted');
    });
  });

  describe('Analytics Module', () => {
    it('GET /analytics/leads/total - should get total leads count', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/leads/total')
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(typeof response.body.data).toBe('number');
    });

    it('GET /analytics/today/unassigned-leads/count - should get today unassigned leads', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/today/unassigned-leads/count')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('GET /analytics/dealer/revenue - should get dealer revenue', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/dealer/revenue')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('GET /analytics/dealer/conversation/rate - should get conversion rate', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/dealer/conversation/rate')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('GET /analytics/dealer/credits - should get dealer credits', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/dealer/credits')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('GET /analytics/leads/monthly - should get monthly leads', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/leads/monthly')
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /analytics/leads/date-range - should get leads by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      const response = await request(app.getHttpServer())
        .get(`/api/v1/analytics/leads/date-range?start=${startDate}&end=${endDate}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('GET /analytics/leads/date-range - should fail without date params', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/analytics/leads/date-range')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Business Settings Module', () => {
    it('GET /business-setting - should retrieve business settings', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/business-setting')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('POST /business-setting - should create/update business settings', async () => {
      const settings = {
        companyName: 'Test Company',
        email: 'company@example.com',
        phone: '+1234567890',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/business-setting')
        .set('Authorization', `Bearer ${dealerToken}`)
        .send(settings)
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Dealer Tier Module', () => {
    it('GET /dealer-tier - should retrieve all dealer tiers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/dealer-tier')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('POST /dealer-tier - should create a new dealer tier', async () => {
      const tierData = {
        name: `Test Tier ${Date.now()}`,
        creditLimit: 1000,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/dealer-tier')
        .set('Authorization', `Bearer ${dealerToken}`)
        .send(tierData)
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });
  });

  describe('Quotations Module', () => {
    it('GET /quotations - should retrieve all quotations', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/quotations')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('POST /quotations - should create a new quotation', async () => {
      if (!testLeadId) {
        console.warn('Skipping: testLeadId not set');
        return;
      }

      const quotationData = {
        leadId: testLeadId,
        items: [
          {
            description: 'Test Product',
            quantity: 1,
            unitPrice: 100,
            total: 100,
          },
        ],
        totalAmount: 100,
        status: 'draft',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/quotations')
        .set('Authorization', `Bearer ${dealerToken}`)
        .send(quotationData)
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      
      testQuotationId = response.body.data.id;
    });

    it('GET /quotations/:id - should retrieve a specific quotation', async () => {
      if (!testQuotationId) {
        console.warn('Skipping: testQuotationId not set');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/quotations/${testQuotationId}`)
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testQuotationId);
    });
  });

  describe('Invoices Module', () => {
    it('GET /invoices - should retrieve all invoices', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('POST /invoices - should create a new invoice', async () => {
      if (!testLeadId) {
        console.warn('Skipping: testLeadId not set');
        return;
      }

      const invoiceData = {
        leadId: testLeadId,
        items: [
          {
            description: 'Test Service',
            quantity: 1,
            unitPrice: 200,
            total: 200,
          },
        ],
        totalAmount: 200,
        status: 'pending',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${dealerToken}`)
        .send(invoiceData)
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      
      testInvoiceId = response.body.data.id;
    });
  });

  describe('Bank Details Module', () => {
    it('GET /bank-details - should retrieve bank details', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/bank-details')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('POST /bank-details - should create bank details', async () => {
      const bankData = {
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        accountHolderName: 'Test User',
        ifscCode: 'TEST0001234',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/bank-details')
        .set('Authorization', `Bearer ${dealerToken}`)
        .send(bankData)
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Lead Messages Module', () => {
    it('GET /lead-messages - should retrieve lead messages', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lead-messages')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('POST /lead-messages - should create a lead message', async () => {
      if (!testLeadId) {
        console.warn('Skipping: testLeadId not set');
        return;
      }

      const messageData = {
        leadId: testLeadId,
        message: 'Test message',
        direction: 'outbound',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/lead-messages')
        .set('Authorization', `Bearer ${dealerToken}`)
        .send(messageData)
        .expect(HttpStatus.CREATED);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Dealer Module', () => {
    it('GET /dealer - should retrieve dealer information', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/dealer')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('PUT /dealer - should update dealer information', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const response = await request(app.getHttpServer())
        .put('/api/v1/dealer')
        .set('Authorization', `Bearer ${dealerToken}`)
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Admin Module', () => {
    it('GET /admin - should require admin authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin')
        .set('Authorization', `Bearer ${dealerToken}`)
        .expect((res) => {
          // Should either be forbidden or unauthorized
          expect([HttpStatus.FORBIDDEN, HttpStatus.UNAUTHORIZED]).toContain(res.status);
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/non-existent-route')
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 401 for protected routes without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/dealer')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should validate request body', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/leads')
        .send({}) // Invalid empty body
        .expect((res) => {
          // Should return either 400 (Bad Request) or validation error
          expect([HttpStatus.BAD_REQUEST, HttpStatus.UNPROCESSABLE_ENTITY]).toContain(res.status);
        });
    });
  });

  describe('Database Connectivity', () => {
    it('should have active database connection', () => {
      expect(dataSource).toBeDefined();
      expect(dataSource.isInitialized).toBe(true);
    });

    it('should be able to query database', async () => {
      const result = await dataSource.query('SELECT 1 as test');
      expect(result).toBeDefined();
      expect(result[0].test).toBe(1);
    });
  });

  describe('Cleanup', () => {
    it('DELETE /leads/:id - should delete the test lead', async () => {
      if (!testLeadId) {
        console.warn('Skipping: testLeadId not set');
        return;
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/leads/${testLeadId}`)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
    });
  });
});
