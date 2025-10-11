import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDeviceLimitToUser1728655300123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'device_limit',
        type: 'int',
        isNullable: false,
        default: 1,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'device_limit');
  }
}
