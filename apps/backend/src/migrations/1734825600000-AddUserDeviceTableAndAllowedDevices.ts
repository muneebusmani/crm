import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserDeviceTableAndAllowedDevices1734825600000
  implements MigrationInterface
{
  name = 'AddUserDeviceTableAndAllowedDevices1734825600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add allowed_devices column to user table
    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS "allowed_devices" INTEGER DEFAULT NULL;
    `);

    // Create user_device table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_device" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "device_fingerprint" VARCHAR(255) NOT NULL,
        "platform" VARCHAR(20) DEFAULT 'web',
        "device_name" VARCHAR(255),
        "ip_address" VARCHAR(45),
        "is_active" BOOLEAN DEFAULT true,
        "last_login_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT "fk_user_device_user" FOREIGN KEY ("user_id") 
          REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_user_device_fingerprint" UNIQUE ("user_id", "device_fingerprint")
      );
    `);

    // Create index for faster queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_device_user_active" 
      ON "user_device" ("user_id", "is_active");
    `);

    // Add comment for documentation
    await queryRunner.query(`
      COMMENT ON COLUMN "user"."allowed_devices" IS 
      'Maximum allowed active devices. NULL = unlimited, 0 = none, positive integer = specific limit';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_user_device_user_active";
    `);

    // Drop the user_device table
    await queryRunner.query(`
      DROP TABLE IF EXISTS "user_device";
    `);

    // Remove allowed_devices column from user table
    await queryRunner.query(`
      ALTER TABLE "user" 
      DROP COLUMN IF EXISTS "allowed_devices";
    `);
  }
}
