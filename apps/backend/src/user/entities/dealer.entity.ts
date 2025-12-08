import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('dealer')
export class Dealer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  owner!: string;

  @Column()
  location!: string;

  @Column({ nullable: true })
  logo!: string;

  @Column({ nullable: true })
  website!: string;

  @Column({ nullable: true })
  contactEmail!: string;

  // Dealer’s current credits
  @Column({ type: 'int', default: 0 })
  credits!: number;

  @OneToMany('DealerTierCredit', 'dealer', { onDelete: 'CASCADE' })
  dealerTierCredits!: any[];

  @Column({ nullable: true })
  tierId!: number;

  // Daily HQ lead limit: -1 = unlimited, 0 = no HQ leads, positive = specific limit
  @Column({ type: 'int', default: 0 })
  dailyHqLeadLimit!: number;

  @OneToMany('CompanyUser', 'dealer', { onDelete: 'CASCADE' })
  companyUsers!: any[];

  @OneToOne(
    () => User,
    (user) => user.dealer,
    { cascade: true },
  )
  @JoinColumn()
  user!: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}
