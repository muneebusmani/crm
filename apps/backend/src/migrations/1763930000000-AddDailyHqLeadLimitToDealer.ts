import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDailyHqLeadLimitToDealer1763930000000
  implements MigrationInterface
{
  name = 'AddDailyHqLeadLimitToDealer1763930000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add dailyHqLeadLimit column to dealer table
    await queryRunner.addColumn(
      'dealer',
      new TableColumn({
        name: 'dailyHqLeadLimit',
        type: 'int',
        default: 0, // Default: no HQ leads
        isNullable: false,
      }),
    );

    // Add assigned_to column to leads table if not exists (for tracking which dealer a lead is assigned to)
    const leadsTable = await queryRunner.getTable('leads');
    const hasAssignedTo = leadsTable?.columns.find(
      (c) => c.name === 'assigned_to',
    );
    if (!hasAssignedTo) {
      await queryRunner.addColumn(
        'leads',
        new TableColumn({
          name: 'assigned_to',
          type: 'int',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('dealer', 'dailyHqLeadLimit');
  }
}
