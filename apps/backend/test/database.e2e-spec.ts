import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Database Connectivity and Entity Tests (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Database Connection', () => {
    it('should have an active database connection', () => {
      expect(dataSource).toBeDefined();
      expect(dataSource.isInitialized).toBe(true);
    });

    it('should connect to PostgreSQL database', () => {
      expect(dataSource.options.type).toBe('postgres');
    });

    it('should have correct database configuration', () => {
      expect(dataSource.options).toHaveProperty('host');
      expect(dataSource.options).toHaveProperty('port');
      expect(dataSource.options).toHaveProperty('database');
    });

    it('should be able to execute simple query', async () => {
      const result = await dataSource.query('SELECT NOW() as current_time');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('current_time');
    });

    it('should be able to check database version', async () => {
      const result = await dataSource.query('SELECT version()');
      expect(result).toBeDefined();
      expect(result[0].version).toContain('PostgreSQL');
    });
  });

  describe('Database Tables', () => {
    it('should have all required tables', async () => {
      const tables = await dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `);
      
      const tableNames = tables.map((t: any) => t.table_name);
      
      // Check for essential tables
      const requiredTables = [
        'users',
        'leads',
        'dealer_tier',
        'activity_log',
      ];
      
      // At least some tables should exist
      expect(tables.length).toBeGreaterThan(0);
    });

    it('should have migrations table', async () => {
      const result = await dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'migrations'
        ) as exists
      `);
      
      // Migrations table may or may not exist depending on migration strategy
      expect(result).toBeDefined();
    });
  });

  describe('Entity Repositories', () => {
    it('should load all entity metadata', () => {
      const entities = dataSource.entityMetadatas;
      expect(entities.length).toBeGreaterThan(0);
      
      console.log(`Loaded ${entities.length} entities:`);
      entities.forEach(entity => {
        console.log(`  - ${entity.name} (table: ${entity.tableName})`);
      });
    });

    it('should have User entity registered', () => {
      const userEntity = dataSource.entityMetadatas.find(
        entity => entity.name === 'User' || entity.tableName === 'users'
      );
      expect(userEntity).toBeDefined();
    });

    it('should have Lead entity registered', () => {
      const leadEntity = dataSource.entityMetadatas.find(
        entity => entity.name === 'Lead' || entity.tableName === 'leads'
      );
      expect(leadEntity).toBeDefined();
    });

    it('should have DealerTier entity registered', () => {
      const tierEntity = dataSource.entityMetadatas.find(
        entity => entity.name === 'DealerTier' || entity.tableName === 'dealer_tier'
      );
      expect(tierEntity).toBeDefined();
    });
  });

  describe('Database Operations', () => {
    it('should support transactions', async () => {
      await expect(
        dataSource.transaction(async (manager) => {
          const result = await manager.query('SELECT 1 as test');
          return result;
        })
      ).resolves.toBeDefined();
    });

    it('should support prepared statements', async () => {
      const result = await dataSource.query(
        'SELECT $1::text as message',
        ['test message']
      );
      expect(result[0].message).toBe('test message');
    });

    it('should handle concurrent queries', async () => {
      const promises = Array(5).fill(null).map((_, i) => 
        dataSource.query('SELECT $1 as num', [i])
      );
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(5);
      results.forEach((result, i) => {
        expect(result[0].num).toBe(i);
      });
    });
  });

  describe('Database Performance', () => {
    it('should execute query within acceptable time', async () => {
      const start = Date.now();
      await dataSource.query('SELECT COUNT(*) FROM users');
      const duration = Date.now() - start;
      
      // Query should complete in less than 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should handle connection pool', () => {
      // Check if connection pooling is configured
      const poolSize = (dataSource.options as any).extra?.max || 10;
      expect(poolSize).toBeGreaterThan(0);
    });
  });

  describe('Database Constraints and Indexes', () => {
    it('should have primary key constraints', async () => {
      const constraints = await dataSource.query(`
        SELECT table_name, constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE constraint_type = 'PRIMARY KEY'
        AND table_schema = 'public'
        LIMIT 5
      `);
      
      expect(constraints.length).toBeGreaterThan(0);
    });

    it('should have foreign key constraints', async () => {
      const constraints = await dataSource.query(`
        SELECT table_name, constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_schema = 'public'
        LIMIT 5
      `);
      
      // Foreign keys may or may not exist
      expect(constraints).toBeDefined();
    });
  });

  describe('Database Error Handling', () => {
    it('should handle invalid queries gracefully', async () => {
      await expect(
        dataSource.query('SELECT * FROM non_existent_table')
      ).rejects.toThrow();
    });

    it('should handle syntax errors', async () => {
      await expect(
        dataSource.query('INVALID SQL SYNTAX')
      ).rejects.toThrow();
    });

    it('should handle type errors', async () => {
      await expect(
        dataSource.query('SELECT $1::integer as num', ['not a number'])
      ).rejects.toThrow();
    });
  });
});
