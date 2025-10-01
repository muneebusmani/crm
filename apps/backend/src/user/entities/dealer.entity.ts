import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DealerTier } from './dealer-tier.entity';
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

  @OneToMany('DealerTierCredit', 'dealer')
  dealerTierCredits!: any[];

  @Column({ nullable: true })
  tierId!: number;

  @OneToOne(() => User, (user) => user.dealer, { cascade: true })
  @JoinColumn()
  user!: User;
}
