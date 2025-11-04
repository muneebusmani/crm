import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { Dealer } from '../../user/entities';

@Entity('company_users')
@Unique('UQ_company_users_email_dealer', ['email', 'dealer_id']) // Composite unique
@Index('IDX_company_users_dealer_id', ['dealer_id']) // Index for faster queries
export class CompanyUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position!: string | null;

  @Column({ type: 'boolean', default: false })
  is_default!: boolean;

  // Many company users belong to one dealer
  @ManyToOne(() => Dealer, (dealer) => dealer.companyUsers, { 
    onDelete: 'CASCADE',
    eager: false 
  })
  @JoinColumn({ name: 'dealer_id' })
  dealer!: Dealer;

  @Column({ type: 'int' })
  dealer_id!: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
