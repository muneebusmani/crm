import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCompanyUserUniqueConstraint1762282248335 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the existing unique constraint on email only
        await queryRunner.query(`ALTER TABLE "company_users" DROP CONSTRAINT IF EXISTS "UQ_c6f15bbc68300ad13c9536da486"`);
        
        // Add composite unique constraint on email + dealer_id
        await queryRunner.query(`ALTER TABLE "company_users" ADD CONSTRAINT "UQ_company_users_email_dealer" UNIQUE ("email", "dealer_id")`);
        
        // Add index on dealer_id for faster queries
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_company_users_dealer_id" ON "company_users" ("dealer_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the index
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_company_users_dealer_id"`);
        
        // Drop the composite unique constraint
        await queryRunner.query(`ALTER TABLE "company_users" DROP CONSTRAINT IF EXISTS "UQ_company_users_email_dealer"`);
        
        // Restore the old unique constraint on email only
        await queryRunner.query(`ALTER TABLE "company_users" ADD CONSTRAINT "UQ_c6f15bbc68300ad13c9536da486" UNIQUE ("email")`);
    }

}
