import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class AddMoreInfoFetchedToLead1763493268900 implements MigrationInterface {
    name = 'AddMoreInfoFetchedToLead1763493268900';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('leads', new TableColumn({
            name: 'moreInfoFetched',
            type: 'boolean',
            default: false,
            isNullable: false
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('leads', 'moreInfoFetched');
    }
}
