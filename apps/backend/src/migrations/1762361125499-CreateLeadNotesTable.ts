import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLeadNotesTable1762361125499 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "lead_notes" (
                "id" SERIAL PRIMARY KEY,
                "lead_id" INTEGER NOT NULL,
                "company_user_id" INTEGER NOT NULL,
                "content" VARCHAR(500) NOT NULL,
                "created_by_name" VARCHAR(255) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "FK_lead_notes_lead" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_lead_notes_company_user" FOREIGN KEY ("company_user_id") REFERENCES "company_users"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_lead_notes_lead_id" ON "lead_notes" ("lead_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_lead_notes_company_user_id" ON "lead_notes" ("company_user_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_lead_notes_company_user_id"`);
        await queryRunner.query(`DROP INDEX "IDX_lead_notes_lead_id"`);
        await queryRunner.query(`DROP TABLE "lead_notes"`);
    }

}
