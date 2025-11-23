import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('hq_lead_settings')
export class HqLeadSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  packageTier!: string; // 'Bronze', 'Silver', 'Gold'

  @Column({ type: 'int', default: 0 })
  dailyLimit!: number; // Number of HQ leads per day (2 for Bronze, 4 for Silver, -1 for unlimited)

  @Column({ default: true }) // To enable/disable the package
  isActive!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}