import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationToUserDevice1734868800000
  implements MigrationInterface
{
  name = 'AddLocationToUserDevice1734868800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_device" 
      ADD COLUMN IF NOT EXISTS "location" varchar(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_device" 
      DROP COLUMN IF EXISTS "location"
    `);
  }
}
