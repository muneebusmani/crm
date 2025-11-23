import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateVehicleDetailsTable1732457158021 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'vehicle_details',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'vehicleRegistration',
                    type: 'jsonb',
                    isNullable: false,
                },
                {
                    name: 'dimensions',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'engine',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'performance',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'consumption',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'vehicleHistory',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'smmtDetails',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'vedRate',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'general',
                    type: 'jsonb',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamptz',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamptz',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'leadId',
                    type: 'integer',
                    isNullable: false,
                },
            ],
            foreignKeys: [
                {
                    columnNames: ['leadId'],
                    referencedColumnNames: ['id'],
                    referencedTableName: 'leads',
                    onDelete: 'CASCADE',
                },
            ],
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('vehicle_details');
    }

}