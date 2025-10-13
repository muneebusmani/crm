import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableColumn,
} from 'typeorm';

export class AddQuotationItemsAndInvoiceSellerNote1760365000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * 1️⃣ Create quotation_items table
     */
    await queryRunner.createTable(
      new Table({
        name: 'quotation_items',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'itemDescription',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'rate',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'discountPercent',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'taxPercent',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'quotationId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    /**
     * 2️⃣ Add foreign key: quotation_items.quotationId → quotations.id
     */
    await queryRunner.createForeignKey(
      'quotation_items',
      new TableForeignKey({
        columnNames: ['quotationId'],
        referencedTableName: 'quotations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    /**
     * 3️⃣ Add sellerNote column to invoices table
     */
    await queryRunner.addColumn(
      'invoices',
      new TableColumn({
        name: 'sellerNote',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * 🔄 Rollback sellerNote from invoices
     */
    await queryRunner.dropColumn('invoices', 'sellerNote');

    /**
     * 🔄 Remove foreign key and drop quotation_items
     */
    const table = await queryRunner.getTable('quotation_items');
    const foreignKey = table?.foreignKeys.find((fk) =>
      fk.columnNames.includes('quotationId'),
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('quotation_items', foreignKey);
    }

    await queryRunner.dropTable('quotation_items');
  }
}
