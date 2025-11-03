import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CompnayUser1762196549072 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create company_users table
    await queryRunner.createTable(
      new Table({
        name: 'company_users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'position',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'dealer_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key constraint to dealer table
    await queryRunner.createForeignKey(
      'company_users',
      new TableForeignKey({
        columnNames: ['dealer_id'],
        referencedTableName: 'dealer',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    const table = await queryRunner.getTable('company_users');
    const foreignKey = table!.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('dealer_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('company_users', foreignKey);
    }

    // Then drop the table
    await queryRunner.dropTable('company_users');
  }
}
