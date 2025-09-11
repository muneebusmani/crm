import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Dealer } from './dealer.entity';

@Entity('dealer_tier')
export class DealerTier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    () => Dealer,
    (dealer) => dealer.tier,
  )
  dealers: Dealer[];
}
