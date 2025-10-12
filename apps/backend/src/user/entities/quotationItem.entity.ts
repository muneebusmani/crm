import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('quotation_items')
export class QuotationItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 500 })
  itemDescription!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  rate!: number;

  @Column('int')
  quantity!: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discountPercent!: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  taxPercent!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number;

  @Column()
  quotationId!: number;

  @ManyToOne('Quotation', 'items')
  @JoinColumn({ name: 'quotationId' })
  quotation: any;

  @Column({
    name: 'createdAt',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
