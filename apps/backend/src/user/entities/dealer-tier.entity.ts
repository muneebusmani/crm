import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('dealer_tier')
export class DealerTier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'int' })
  creditLimit!: number;

  /**
   * Default daily HQ lead quota for this tier.
   * -1 = unlimited, 0 = no HQ leads, positive = specific limit
   * Can be overridden per-dealer via Dealer.customHqQuota
   */
  @Column({ type: 'int', default: 5 })
  hqLeadQuota!: number;

  // Relation with DealerTierCredit
  @OneToMany('DealerTierCredit', 'tier')
  dealerTierCredits!: any[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}
