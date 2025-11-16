import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateExistingWonLeads1763310500000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update wonByDealerId for leads that already have invoices
        // Set it to the dealer.id (from dealer table) who created the FIRST invoice for that lead
        await queryRunner.query(`
            UPDATE leads l
            SET "wonByDealerId" = subquery."dealerId"
            FROM (
                SELECT 
                    i."leadId",
                    d.id as "dealerId",
                    MIN(i."createdAt") as first_invoice_date
                FROM invoices i
                INNER JOIN "user" u ON u.id = i."userId"
                INNER JOIN dealer d ON d."userId" = u.id
                GROUP BY i."leadId", d.id
                HAVING MIN(i."createdAt") = (
                    SELECT MIN(i2."createdAt")
                    FROM invoices i2
                    WHERE i2."leadId" = i."leadId"
                )
            ) as subquery
            WHERE l.id = subquery."leadId"
            AND l."wonByDealerId" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert all wonByDealerId to NULL
        await queryRunner.query(`
            UPDATE leads
            SET "wonByDealerId" = NULL
            WHERE "wonByDealerId" IS NOT NULL
        `);
    }

}
