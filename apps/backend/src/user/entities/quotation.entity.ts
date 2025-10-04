import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('quotations')
export class Quotation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  engineCodeName!: string;

  @Column()
  dealershipName!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quotationPrice!: number;

  @Column()
  subject!: string;

  @Column('text')
  message!: string;

  @ManyToOne('User', 'quotations') // 'User' entity as string, 'quotations' is property in User
  @JoinColumn({ name: 'dealerId' })
  dealer: any;

  @ManyToOne('Lead', 'quotations')
  @JoinColumn({ name: 'leadId' })
  lead: any;

   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}
