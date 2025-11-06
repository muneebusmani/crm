// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
// import { InvoiceItem } from './invoice-item.entity';
// import { InvoiceStatus } from '@crm/types';
//
// @Entity('invoices')
// export class Invoice {
//   @PrimaryGeneratedColumn('uuid')
//   id!: string;
//
//   @Column({ unique: true })
//   invoiceNumber!: string;
//
//   @Column('timestamp')
//   date!: Date;
//
//   @Column()
//   leadId!: string;
//
//   @Column()
//   dealerId!: string;
//
//   @Column('decimal', { precision: 12, scale: 2, default: 0 })
//   subTotal!: number;
//
//   @Column('decimal', { precision: 12, scale: 2, default: 0 })
//   taxAmount!: number;
//
//   @Column('decimal', { precision: 12, scale: 2, default: 0 })
//   totalAmount!: number;
//
//   status!: InvoiceStatus;
//
//   @OneToMany(() => InvoiceItem, item => item.invoice, { cascade: true, eager: true })
//   items!: InvoiceItem[];
//
//   @CreateDateColumn()
//   createdAt!: Date;
//
//   @UpdateDateColumn()
//   updatedAt!: Date;
// }
// invoice.entity.ts
import { InvoiceStatus } from '@crm/types';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  invoiceNumber!: string;

  @Column()
  grandTotal!: number;

  @Column({nullable : true})
  sellerNote! : string;

  @Column('timestamp')
  date!: Date;

  @ManyToOne('User', 'invoices') // belongsTo Dealer (User)
  @JoinColumn({ name: 'userId' })
  dealer!: any;

  @ManyToOne('Lead', 'invoices') // belongsTo Lead
  @JoinColumn({ name: 'leadId' })
  lead!: any;

  @ManyToOne('CompanyUser', { nullable: true })
  @JoinColumn({ name: 'company_user_id' })
  companyUser!: any;

  @Column({ type: 'int', nullable: true })
  company_user_id!: number | null;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  subTotal!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  taxAmount!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalAmount!: number;

  status!: InvoiceStatus; // keep your InvoiceStatus type elsewhere

  @OneToMany('InvoiceItem', 'invoice', { cascade: true, eager: true })
  items!: any[]; // use `any[]` for string-based relation

  @Column({
    name: 'createdAt',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
