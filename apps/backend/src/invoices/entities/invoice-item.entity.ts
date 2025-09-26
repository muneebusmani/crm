// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
// import { Invoice } from './invoice.entity';
//
// @Entity('invoice_items')
// export class InvoiceItem {
//   @PrimaryGeneratedColumn('uuid')
//   id!: string;
//
//   @Column()
//   invoiceId!: string;
//
//   @Column()
//   productName!: string;
//
//   @Column('text', { default: '' })
//   productDetails!: string;
//
//   @Column('decimal', { precision: 12, scale: 2 })
//   unitPrice!: number;
//
//   @Column('int')
//   quantity!: number;
//
//   @Column('decimal', { precision: 12, scale: 2 })
//   totalPrice!: number;
//
//   @ManyToOne(() => Invoice, invoice => invoice.items, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'invoiceId' })
//   invoice!: Invoice;
//
//   @CreateDateColumn()
//   createdAt!: Date;
// }
// invoice-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

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

  @Column('decimal', { precision: 12, scale: 2 })
  unitPrice!: number;

  @Column('int')
  quantity!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalPrice!: number;

  @ManyToOne('Invoice', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice!: any; // string-based relation avoids circular dependency

  @CreateDateColumn()
  createdAt!: Date;
}

