import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';

@Entity('dealer_leads')
export class DealerLead {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne('User', 'dealerLeads') // belongsTo Dealer (User)
  @JoinColumn({ name: 'userId' })
  dealer!: any;

  @ManyToOne('Lead', 'dealerLeads') // belongsTo Lead
  @JoinColumn({ name: 'leadId' })
  lead!: any;

  @Column({ default: 'open' })
  status!: string;
}
