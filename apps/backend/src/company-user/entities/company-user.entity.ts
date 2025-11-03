import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('company_users')
export class CompanyUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  position!: string;

  // Many company users belong to one dealer
  @ManyToOne('Dealer', 'companyUsers', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dealer_id' })
  dealer!: any;

  @Column()
  dealer_id!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
