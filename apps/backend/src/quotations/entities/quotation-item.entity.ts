import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Quotation } from './quotation.entity';

@Entity('quotation_items')
export class QuotationItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  quotationId!: string;

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

  @ManyToOne(() => Quotation, (quotation) => quotation.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotationId' })
  quotation!: Quotation;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
