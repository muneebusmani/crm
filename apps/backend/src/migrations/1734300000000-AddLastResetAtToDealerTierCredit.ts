import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastResetAtToDealerTierCredit1734300000000
  implements MigrationInterface
{
  name = 'AddLastResetAtToDealerTierCredit1734300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add lastResetAt column to dealer_tier_credit table
    await queryRunner.query(`
      ALTER TABLE "dealer_tier_credit"
      ADD COLUMN IF NOT EXISTS "lastResetAt" TIMESTAMP NULL
    `);

    console.log('✅ Added lastResetAt column to dealer_tier_credit table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "dealer_tier_credit"
      DROP COLUMN IF EXISTS "lastResetAt"
    `);

    console.log('✅ Removed lastResetAt column from dealer_tier_credit table');
  }
}
