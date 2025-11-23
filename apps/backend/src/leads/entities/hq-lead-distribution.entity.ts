import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Dealer } from '../../user/entities/dealer.entity';
import { Lead } from './lead.entity';

@Entity('hq_lead_distribution')
export class HqLeadDistribution {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' }) // Number of HQ leads assigned today
  assignedCount!: number;

  @Column({ type: 'date' }) // Date when the leads were assigned
  assignedDate!: Date;

  // Relation to Dealer/Company account
  @ManyToOne('Dealer', 'hqLeadDistributions')
  @JoinColumn({ name: 'dealerId' })
  dealer!: any;

  @Column()
  dealerId!: number;

  // Relation to Lead (for tracking specific HQ leads assigned)
  @ManyToOne('Lead', 'hqLeadDistribution')
  @JoinColumn({ name: 'leadId' })
  lead?: any;

  @Column({ nullable: true })
  leadId?: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}