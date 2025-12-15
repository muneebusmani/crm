import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorHqLeadsToOneToMany1734128000000
  implements MigrationInterface
{
  name = 'RefactorHqLeadsToOneToMany1734128000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========================================
    // STEP 1: Add hqLeadQuota to dealer_tier
    // ========================================
    await queryRunner.query(`
      ALTER TABLE "dealer_tier"
      ADD COLUMN IF NOT EXISTS "hqLeadQuota" integer NOT NULL DEFAULT 5
    `);

    // Set tier-specific defaults
    await queryRunner.query(`
      UPDATE "dealer_tier" SET "hqLeadQuota" = -1 WHERE name = 'Gold'
    `);
    await queryRunner.query(`
      UPDATE "dealer_tier" SET "hqLeadQuota" = 10 WHERE name = 'Silver'
    `);
    await queryRunner.query(`
      UPDATE "dealer_tier" SET "hqLeadQuota" = 5 WHERE name = 'Bronze'
    `);

    // ========================================
    // STEP 2: Rename dailyHqLeadLimit to customHqQuota on dealer
    // ========================================
    // First check if column exists and rename it
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'dealer' AND column_name = 'dailyHqLeadLimit'
        ) THEN
          ALTER TABLE "dealer" RENAME COLUMN "dailyHqLeadLimit" TO "customHqQuota";
        END IF;
      END $$;
    `);

    // Make the column nullable (NULL = use tier default)
    await queryRunner.query(`
      ALTER TABLE "dealer" 
      ALTER COLUMN "customHqQuota" DROP NOT NULL
    `);

    // Convert 0 values to NULL (meaning "use tier default")
    await queryRunner.query(`
      UPDATE "dealer" SET "customHqQuota" = NULL WHERE "customHqQuota" = 0
    `);

    // ========================================
    // STEP 3: Create hq_lead_visibility table (1:Many join table)
    // ========================================
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "hq_lead_visibility" (
        "id" SERIAL PRIMARY KEY,
        "leadId" integer NOT NULL,
        "dealerId" integer NOT NULL,
        "assignedDate" date NOT NULL DEFAULT CURRENT_DATE,
        "isManualOverride" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "FK_hq_lead_visibility_lead" 
          FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_hq_lead_visibility_dealer" 
          FOREIGN KEY ("dealerId") REFERENCES "dealer"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_hq_lead_visibility_lead_dealer" 
          UNIQUE ("leadId", "dealerId")
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_hq_lead_visibility_dealer_date" 
      ON "hq_lead_visibility"("dealerId", "assignedDate")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_hq_lead_visibility_lead" 
      ON "hq_lead_visibility"("leadId")
    `);

    // ========================================
    // STEP 4: Migrate existing data from hq_lead_distribution
    // ========================================
    // Only run if hq_lead_distribution table exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'hq_lead_distribution'
        ) THEN
          INSERT INTO "hq_lead_visibility" ("leadId", "dealerId", "assignedDate", "isManualOverride", "created_at")
          SELECT DISTINCT "leadId", "dealerId", "assignedDate", true, "created_at"
          FROM "hq_lead_distribution"
          WHERE "leadId" IS NOT NULL
          ON CONFLICT ("leadId", "dealerId") DO NOTHING;
        END IF;
      END $$;
    `);

    // ========================================
    // STEP 5: Migrate leads with assigned_to field (HQ leads only)
    // ========================================
    await queryRunner.query(`
      INSERT INTO "hq_lead_visibility" ("leadId", "dealerId", "assignedDate", "isManualOverride")
      SELECT 
        l.id, 
        CAST(l.assigned_to AS integer), 
        CURRENT_DATE, 
        true
      FROM leads l
      WHERE l."isHqLead" = true 
        AND l.assigned_to IS NOT NULL 
        AND l.assigned_to != ''
        AND l.assigned_to ~ '^[0-9]+$'  -- Only valid numeric IDs
      ON CONFLICT ("leadId", "dealerId") DO NOTHING
    `);

    console.log('✅ HQ Leads refactored to 1:Many distribution model');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_hq_lead_visibility_dealer_date"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_hq_lead_visibility_lead"
    `);

    // Drop the new table
    await queryRunner.query(`
      DROP TABLE IF EXISTS "hq_lead_visibility"
    `);

    // Rename column back
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'dealer' AND column_name = 'customHqQuota'
        ) THEN
          ALTER TABLE "dealer" RENAME COLUMN "customHqQuota" TO "dailyHqLeadLimit";
        END IF;
      END $$;
    `);

    // Set NOT NULL and default back
    await queryRunner.query(`
      ALTER TABLE "dealer" 
      ALTER COLUMN "dailyHqLeadLimit" SET NOT NULL,
      ALTER COLUMN "dailyHqLeadLimit" SET DEFAULT 0
    `);

    // Convert NULL back to 0
    await queryRunner.query(`
      UPDATE "dealer" SET "dailyHqLeadLimit" = 0 WHERE "dailyHqLeadLimit" IS NULL
    `);

    // Remove hqLeadQuota from dealer_tier
    await queryRunner.query(`
      ALTER TABLE "dealer_tier" DROP COLUMN IF EXISTS "hqLeadQuota"
    `);

    console.log('⏪ HQ Leads migration reverted');
  }
}
