import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  invoiceId!: string;

  @Column()
  productName!: string;

  @Column('text', { default: '' })
  productDetails!: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  unitPrice!: number;

  @Column('int', { default: 1 })
  quantity!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  discount!: number; // discount amount per item

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  taxAmount!: number; // tax per item (optional)

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalPrice!: number; // (unitPrice * quantity) - discount + taxAmount

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  subTotal!: number; // before tax and discount, if you need to show line subtotal

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
