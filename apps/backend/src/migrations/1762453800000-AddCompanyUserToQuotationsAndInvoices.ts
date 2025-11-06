import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddCompanyUserToQuotationsAndInvoices1762453800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add company_user_id column to quotations table
    await queryRunner.addColumn(
      'quotations',
      new TableColumn({
        name: 'company_user_id',
        type: 'int',
        isNullable: true,
      }),
    );

    // Add foreign key for quotations.company_user_id
    await queryRunner.createForeignKey(
      'quotations',
      new TableForeignKey({
        columnNames: ['company_user_id'],
        referencedTableName: 'company_users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_quotations_company_user',
      }),
    );

    // Add company_user_id column to invoices table
    await queryRunner.addColumn(
      'invoices',
      new TableColumn({
        name: 'company_user_id',
        type: 'int',
        isNullable: true,
      }),
    );

    // Add foreign key for invoices.company_user_id
    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({
        columnNames: ['company_user_id'],
        referencedTableName: 'company_users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_invoices_company_user',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('quotations', 'FK_quotations_company_user');
    await queryRunner.dropForeignKey('invoices', 'FK_invoices_company_user');

    // Drop columns
    await queryRunner.dropColumn('quotations', 'company_user_id');
    await queryRunner.dropColumn('invoices', 'company_user_id');
  }
}
