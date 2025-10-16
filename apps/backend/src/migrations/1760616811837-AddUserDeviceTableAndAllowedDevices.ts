import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from 'typeorm';

export class AddUserDeviceTableAndAllowedDevices1729151111111 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'allowedDevices',
        type: 'int',
        isNullable: false,
        default: 1,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_device',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'userId', type: 'int' },
          { name: 'deviceId', type: 'varchar', length: '255' },
          { name: 'platform', type: 'varchar', length: '50', default: "'web'" },
          { name: 'deviceName', type: 'varchar', length: '255', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'lastLoginAt', type: 'timestamptz', isNullable: true },
          { name: 'ipAddress', type: 'varchar', length: '255', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'user_device',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user_device');
    const fk = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('userId') !== -1);
    if (fk) await queryRunner.dropForeignKey('user_device', fk);

    await queryRunner.dropTable('user_device');
    await queryRunner.dropColumn('user', 'allowedDevices');
  }
}
