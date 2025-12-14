import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
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

  // Dealer's current credits
  @Column({ type: 'int', default: 0 })
  credits!: number;

  @OneToMany('DealerTierCredit', 'dealer', { onDelete: 'CASCADE' })
  dealerTierCredits!: any[];

  @Column({ nullable: true })
  tierId!: number;

  /**
   * Relation to the dealer's tier (Bronze/Silver/Gold)
   * The tier determines the default HQ lead quota via tier.hqLeadQuota
   */
  @ManyToOne('DealerTier')
  @JoinColumn({ name: 'tierId' })
  tier?: any;

  /**
   * Custom HQ lead quota override for this specific dealer.
   * NULL = use tier default (Dealer.tier.hqLeadQuota)
   * -1 = unlimited
   * 0 = no HQ leads
   * positive = specific daily limit
   *
   * Priority: customHqQuota > tier.hqLeadQuota
   */
  @Column({ type: 'int', nullable: true, name: 'customHqQuota' })
  customHqQuota!: number | null;

  /**
   * Relation to HQ lead visibility records.
   * Tracks which HQ leads this dealer can see.
   */
  @OneToMany('HqLeadVisibility', 'dealer')
  hqLeadVisibility!: any[];

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
