import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWonByDealerIdToLeads1763310439249 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "leads" 
            ADD COLUMN "wonByDealerId" integer NULL
        `);
        
        await queryRunner.query(`
            ALTER TABLE "leads" 
            ADD CONSTRAINT "FK_leads_wonByDealerId" 
            FOREIGN KEY ("wonByDealerId") 
            REFERENCES "dealer"("id") 
            ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "leads" 
            DROP CONSTRAINT "FK_leads_wonByDealerId"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "leads" 
            DROP COLUMN "wonByDealerId"
        `);
    }

}
