// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
// import { QuotationItem } from './quotation-item.entity';
// import { QuotationStatus } from '@crm/types';
//
// @Entity('quotations')
// export class Quotation {
//   @PrimaryGeneratedColumn('uuid')
//   id!: string;
//
//   @Column({ unique: true })
//   quotationNumber!: string;
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
//   status!: QuotationStatus;
//
//   @OneToMany(() => QuotationItem, item => item.quotation, { cascade: true, eager: true })
//   items!: QuotationItem[];
//
//   @CreateDateColumn()
//   createdAt!: Date;
//
//   @UpdateDateColumn()
//   updatedAt!: Date;
// }
// quotation.entity.ts
import { QuotationStatus } from '@crm/types';
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

@Entity('quotations')
export class Quotation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  quotationNumber!: string;

  @Column()
  grandTotal!: number;

  @Column({nullable : true})
  sellerNote! : string;

  @Column('timestamp')
  date!: Date;

  @ManyToOne('User', 'quotations') // belongsTo Dealer (User)
  @JoinColumn({ name: 'userId' })
  dealer!: any;

  @ManyToOne('Lead', 'quotations') // belongsTo Lead
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

  status!: QuotationStatus; // keep your QuotationStatus type elsewhere

  @OneToMany('QuotationItem', 'quotation', { cascade: true, eager: true })
  items!: any[]; // use `any[]` for string-based relation

  @Column({
    name: 'createdAt',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
