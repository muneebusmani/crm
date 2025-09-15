import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { DealerTier } from './dealer-tier.entity';
import { User } from './user.entity';



@Entity('dealer')
@Unique(['userId'])
export class Dealer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column({ nullable: true })
  tierId!: number;

  @Column()
  name!: string;

  @Column()
  owner!: string;

  @Column()
  location!: string;

  @Column()
  logo!: string;

  @Column()
  website!: string;

  @Column()
  contactEmail!: string;

  @OneToOne(
    () => User,
    (user) => user.dealer,
  )
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(
    () => DealerTier,
    (dealerTier) => dealerTier.dealers,
    { nullable: true },
  )
  @JoinColumn({ name: 'tierName' })
  tier!: DealerTier;

  @OneToMany('Quotation', 'dealer')
  quotations!: any[];
}
