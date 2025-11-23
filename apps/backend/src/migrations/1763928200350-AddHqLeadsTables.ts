import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHqLeadsTables1732477200000 implements MigrationInterface {
    name = 'AddHqLeadsTables1732477200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create hq_lead_settings table
        await queryRunner.query(`
            CREATE TABLE "hq_lead_settings" (
                "id" SERIAL NOT NULL,
                "packageTier" character varying NOT NULL UNIQUE,
                "dailyLimit" integer NOT NULL DEFAULT 0,
                "isActive" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_hq_lead_settings_id" PRIMARY KEY ("id")
            )
        `);

        // Add isHqLead column to leads table
        await queryRunner.query(`
            ALTER TABLE "leads" 
            ADD COLUMN "isHqLead" boolean NOT NULL DEFAULT false
        `);

        // Create hq_lead_distribution table
        await queryRunner.query(`
            CREATE TABLE "hq_lead_distribution" (
                "id" SERIAL NOT NULL,
                "assignedCount" integer NOT NULL,
                "assignedDate" date NOT NULL,
                "dealerId" integer NOT NULL,
                "leadId" integer,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_hq_lead_distribution_id" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for better performance
        await queryRunner.query(`
            CREATE INDEX "IDX_hq_lead_distribution_dealerId_assignedDate" 
            ON "hq_lead_distribution" ("dealerId", "assignedDate")
        `);

        // Create foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "hq_lead_distribution" 
            ADD CONSTRAINT "FK_hq_lead_distribution_dealerId" 
            FOREIGN KEY ("dealerId") REFERENCES "dealer"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "hq_lead_distribution" 
            ADD CONSTRAINT "FK_hq_lead_distribution_leadId" 
            FOREIGN KEY ("leadId") REFERENCES "leads"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        // Insert default HQ lead settings
        await queryRunner.query(`
            INSERT INTO "hq_lead_settings" ("packageTier", "dailyLimit", "isActive") 
            VALUES 
                ('Bronze', 2, true),
                ('Silver', 4, true),
                ('Gold', -1, true)  -- -1 indicates unlimited
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`
            ALTER TABLE "hq_lead_distribution" 
            DROP CONSTRAINT IF EXISTS "FK_hq_lead_distribution_leadId"
        `);

        await queryRunner.query(`
            ALTER TABLE "hq_lead_distribution" 
            DROP CONSTRAINT IF EXISTS "FK_hq_lead_distribution_dealerId"
        `);

        // Drop indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_hq_lead_distribution_dealerId_assignedDate"
        `);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "hq_lead_distribution"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "hq_lead_settings"`);

        // Remove isHqLead column from leads table
        await queryRunner.query(`
            ALTER TABLE "leads" 
            DROP COLUMN "isHqLead"
        `);
    }
}