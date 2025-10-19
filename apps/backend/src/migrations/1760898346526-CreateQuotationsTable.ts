import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateQuotationsTable1760898346526 implements MigrationInterface {
    name = 'CreateQuotationsTable1760898346526'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotations" DROP CONSTRAINT "FK_851f6afeab607c8a401432f9d05"`);
        await queryRunner.query(`ALTER TABLE "quotation_items" DROP CONSTRAINT "FK_daed37b90fdb61300eabb8e2743"`);
        await queryRunner.query(`ALTER TABLE "quotations" DROP COLUMN "engineCodeName"`);
        await queryRunner.query(`ALTER TABLE "quotations" DROP COLUMN "dealershipName"`);
        await queryRunner.query(`ALTER TABLE "quotations" DROP COLUMN "quotationPrice"`);
        await queryRunner.query(`ALTER TABLE "quotations" DROP COLUMN "subject"`);
        await queryRunner.query(`ALTER TABLE "quotations" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "quotations" DROP COLUMN "dealerId"`);
        await queryRunner.query(`ALTER TABLE "quotation_items" DROP COLUMN "itemDescription"`);
        await queryRunner.query(`ALTER TABLE "quotation_items" DROP COLUMN "rate"`);
        await queryRunner.query(`ALTER TABLE "quotation_items" DROP COLUMN "discountPercent"`);
        await queryRunner.query(`ALTER TABLE "quotation_items" DROP COLUMN "taxPercent"`);
        await queryRunner.query(`ALTER TABLE "quotation_items" DROP COLUMN "totalAmount"`);
        await queryRunner.query(`ALTER TABLE "quotation_items" ADD CONSTRAINT "FK_daed37b90fdb61300eabb8e2743" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quotation_items" DROP CONSTRAINT "FK_daed37b90fdb61300eabb8e2743"`);
        await queryRunner.query(`ALTER TABLE "quotation_items" ADD "totalAmount" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quotation_items" ADD "taxPercent" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "quotation_items" ADD "discountPercent" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "quotation_items" ADD "rate" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quotation_items" ADD "itemDescription" character varying(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quotations" ADD "dealerId" integer`);
        await queryRunner.query(`ALTER TABLE "quotations" ADD "message" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quotations" ADD "subject" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quotations" ADD "quotationPrice" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quotations" ADD "dealershipName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quotations" ADD "engineCodeName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quotation_items" ADD CONSTRAINT "FK_daed37b90fdb61300eabb8e2743" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quotations" ADD CONSTRAINT "FK_851f6afeab607c8a401432f9d05" FOREIGN KEY ("dealerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
