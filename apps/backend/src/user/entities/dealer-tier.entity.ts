import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('dealer_tier')
export class DealerTier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'int' })
  creditLimit!: number;

  // Relation with DealerTierCredit
  @OneToMany('DealerTierCredit', 'tier')
  dealerTierCredits!: any[];
}
