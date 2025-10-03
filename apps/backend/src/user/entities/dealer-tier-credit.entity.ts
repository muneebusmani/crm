import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('dealer_tier_credit')
export class DealerTierCredit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  credit!: number;

  // Relation to Dealer
  @ManyToOne('Dealer', 'tierCredits')
  @JoinColumn({ name: 'dealerId' })
  dealer!: any;

  @Column()
  dealerId!: number;

  // Relation to DealerTier
  @ManyToOne('DealerTier', 'dealerTierCredits')
  @JoinColumn({ name: 'tierId' })
  tier!: any;

  @Column()
  tierId!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}
