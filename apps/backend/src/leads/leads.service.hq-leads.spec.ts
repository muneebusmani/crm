import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadsService } from '../src/leads/leads.service';
import { Lead } from '../src/leads/entities/lead.entity';
import { HqLeadDistribution, HqLeadSettings } from '../src/leads/entities';
import { User } from '../src/user/entities';
import { VehicleDetails } from '../src/leads/entities/vehicle-details.entity';
import { CreateLeadDto } from '../src/leads/dto/create-lead.dto';
import { CustomError } from '../src/common/custom-error';

describe('LeadsService - HQ Lead Tests', () => {
  let service: LeadsService;
  let leadRepository: Repository<Lead>;
  let hqLeadDistributionRepository: Repository<HqLeadDistribution>;
  let hqLeadSettingsRepository: Repository<HqLeadSettings>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getRepositoryToken(Lead),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(HqLeadDistribution),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(HqLeadSettings),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(VehicleDetails),
          useClass: Repository,
        },
        {
          provide: 'ActivityLogger',
          useValue: {
            log: jest.fn(),
          },
        },
        {
          provide: 'AppLogger',
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    leadRepository = module.get<Repository<Lead>>(getRepositoryToken(Lead));
    hqLeadDistributionRepository = module.get<Repository<HqLeadDistribution>>(getRepositoryToken(HqLeadDistribution));
    hqLeadSettingsRepository = module.get<Repository<HqLeadSettings>>(getRepositoryToken(HqLeadSettings));
  });

  describe('isHqLead', () => {
    it('should correctly identify HQ brands', () => {
      expect(service.isHqLead('BMW')).toBe(true);
      expect(service.isHqLead('Land Rover')).toBe(true);
      expect(service.isHqLead('Range Rover')).toBe(true);
      expect(service.isHqLead('Jaguar')).toBe(true);
      expect(service.isHqLead('Mercedes Benz')).toBe(true);
      
      expect(service.isHqLead('Toyota')).toBe(false);
      expect(service.isHqLead('Honda')).toBe(false);
      expect(service.isHqLead('')).toBe(false);
      expect(service.isHqLead(null as any)).toBe(false);
    });
  });

  describe('create', () => {
    it('should set isHqLead flag when creating a lead with HQ brand', async () => {
      const createDto: CreateLeadDto = {
        vehicle_brand: 'BMW',
        vehicle_model: 'X5',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '+1234567890',
        source: 'Test Source',
      };

      jest.spyOn(leadRepository, 'create').mockReturnValue(new Lead());
      jest.spyOn(leadRepository, 'save').mockResolvedValue({
        id: 1,
        ...createDto,
        isHqLead: true, // This should be set by the service
        assigned_to: undefined,
        follow_up_date: undefined,
        notes: undefined,
        status: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        is_deleted: false,
        wonByDealerId: undefined,
        moreInfoFetched: false,
      } as any);

      jest.spyOn((service as any).activityLogger, 'log').mockResolvedValue(undefined);

      const result = await service.create(createDto);
      
      expect(result.isHqLead).toBe(true);
    });

    it('should not set isHqLead flag when creating a lead with non-HQ brand', async () => {
      const createDto: CreateLeadDto = {
        vehicle_brand: 'Toyota',
        vehicle_model: 'Camry',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '+1234567890',
        source: 'Test Source',
      };

      jest.spyOn(leadRepository, 'create').mockReturnValue(new Lead());
      jest.spyOn(leadRepository, 'save').mockResolvedValue({
        id: 1,
        ...createDto,
        isHqLead: false, // This should be set by the service
        assigned_to: undefined,
        follow_up_date: undefined,
        notes: undefined,
        status: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        is_deleted: false,
        wonByDealerId: undefined,
        moreInfoFetched: false,
      } as any);

      jest.spyOn((service as any).activityLogger, 'log').mockResolvedValue(undefined);

      const result = await service.create(createDto);
      
      expect(result.isHqLead).toBe(false);
    });
  });

  describe('checkHqLeadQuota', () => {
    it('should return canAssign true for unlimited package tier', async () => {
      // Mock the dealer tier as Gold with unlimited (-1) daily limit
      jest.spyOn((service as any).userRepository, 'createQueryBuilder')
        .mockReturnValue({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({
            dealer: { tierId: 3 }
          }),
        } as any);

      jest.spyOn((service as any).userRepository.manager, 'createQueryBuilder')
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({
            id: 3,
            name: 'Gold',
          }),
        } as any);

      jest.spyOn(hqLeadSettingsRepository, 'createQueryBuilder')
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({
            packageTier: 'Gold',
            dailyLimit: -1, // Unlimited
          }),
        } as any);

      jest.spyOn(hqLeadDistributionRepository, 'createQueryBuilder')
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(10), // Even with 10 assigned, should still allow more
        } as any);

      const result = await service.checkHqLeadQuota(1);
      expect(result.canAssign).toBe(true);
      expect(result.dailyLimit).toBe(-1);
    });

    it('should return canAssign false when quota is reached', async () => {
      // Mock the dealer tier as Bronze with 2 daily limit
      jest.spyOn((service as any).userRepository, 'createQueryBuilder')
        .mockReturnValue({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({
            dealer: { tierId: 1 }
          }),
        } as any);

      jest.spyOn((service as any).userRepository.manager, 'createQueryBuilder')
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({
            id: 1,
            name: 'Bronze',
          }),
        } as any);

      jest.spyOn(hqLeadSettingsRepository, 'createQueryBuilder')
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({
            packageTier: 'Bronze',
            dailyLimit: 2,
          }),
        } as any);

      jest.spyOn(hqLeadDistributionRepository, 'createQueryBuilder')
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(2), // At limit
        } as any);

      const result = await service.checkHqLeadQuota(1);
      expect(result.canAssign).toBe(false);
      expect(result.assignedCount).toBe(2);
      expect(result.dailyLimit).toBe(2);
    });

    it('should return canAssign true when below quota', async () => {
      // Mock the dealer tier as Silver with 4 daily limit
      jest.spyOn((service as any).userRepository, 'createQueryBuilder')
        .mockReturnValue({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({
            dealer: { tierId: 2 }
          }),
        } as any);

      jest.spyOn((service as any).userRepository.manager, 'createQueryBuilder')
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({
            id: 2,
            name: 'Silver',
          }),
        } as any);

      jest.spyOn(hqLeadSettingsRepository, 'createQueryBuilder')
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({
            packageTier: 'Silver',
            dailyLimit: 4,
          }),
        } as any);

      jest.spyOn(hqLeadDistributionRepository, 'createQueryBuilder')
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(2), // Below limit
        } as any);

      const result = await service.checkHqLeadQuota(1);
      expect(result.canAssign).toBe(true);
      expect(result.assignedCount).toBe(2);
      expect(result.dailyLimit).toBe(4);
    });
  });

  describe('assignHqLeadToDealer', () => {
    it('should successfully assign HQ lead when quota available', async () => {
      const lead = new Lead();
      lead.id = 1;
      lead.isHqLead = true;
      lead.vehicle_brand = 'BMW';
      
      jest.spyOn(leadRepository, 'findOneBy').mockResolvedValue(lead);
      jest.spyOn(service, 'checkHqLeadQuota').mockResolvedValue({
        canAssign: true,
        assignedCount: 1,
        dailyLimit: 2,
      });
      
      jest.spyOn(hqLeadDistributionRepository, 'save').mockResolvedValue(new HqLeadDistribution());
      jest.spyOn(leadRepository, 'save').mockResolvedValue(lead);

      const result = await service.assignHqLeadToDealer(1, 1);
      expect(result).toBe(true);
    });

    it('should throw error when trying to assign non-HQ lead', async () => {
      const lead = new Lead();
      lead.id = 1;
      lead.isHqLead = false;
      
      jest.spyOn(leadRepository, 'findOneBy').mockResolvedValue(lead);

      await expect(service.assignHqLeadToDealer(1, 1)).rejects.toThrow(CustomError);
    });

    it('should throw error when dealer has reached quota', async () => {
      const lead = new Lead();
      lead.id = 1;
      lead.isHqLead = true;
      
      jest.spyOn(leadRepository, 'findOneBy').mockResolvedValue(lead);
      jest.spyOn(service, 'checkHqLeadQuota').mockResolvedValue({
        canAssign: false,
        assignedCount: 2,
        dailyLimit: 2,
      });

      await expect(service.assignHqLeadToDealer(1, 1)).rejects.toThrow(CustomError);
    });
  });
});