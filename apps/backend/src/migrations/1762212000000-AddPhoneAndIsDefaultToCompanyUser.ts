import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPhoneAndIsDefaultToCompanyUser1762212000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add phone column
    await queryRunner.addColumn(
      'company_users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        isNullable: true,
      })
    );

    // Add is_default column
    await queryRunner.addColumn(
      'company_users',
      new TableColumn({
        name: 'is_default',
        type: 'boolean',
        default: false,
        isNullable: false,
      })
    );

    // Drop the unique constraint on email (we need composite unique instead)
    await queryRunner.query(
      `ALTER TABLE company_users DROP CONSTRAINT IF EXISTS "UQ_company_users_email"`
    );

    // Add composite unique constraint on email and dealer_id
    // This allows same email across different dealers but not within same dealer
    await queryRunner.query(
      `ALTER TABLE company_users ADD CONSTRAINT "UQ_company_users_email_dealer" UNIQUE (email, dealer_id)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop composite unique constraint
    await queryRunner.query(
      `ALTER TABLE company_users DROP CONSTRAINT IF EXISTS "UQ_company_users_email_dealer"`
    );

    // Restore single email unique constraint
    await queryRunner.query(
      `ALTER TABLE company_users ADD CONSTRAINT "UQ_company_users_email" UNIQUE (email)`
    );

    // Drop is_default column
    await queryRunner.dropColumn('company_users', 'is_default');

    // Drop phone column
    await queryRunner.dropColumn('company_users', 'phone');
  }
}
