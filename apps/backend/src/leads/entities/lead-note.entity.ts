import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lead } from './lead.entity';
import { CompanyUser } from '../../company-user/entities/company-user.entity';

@Entity('lead_notes')
export class LeadNote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  lead_id!: number;

  @Column({ type: 'int' })
  company_user_id!: number;

  @Column({ type: 'varchar', length: 500 })
  content!: string;

  @Column({ type: 'varchar', length: 255 })
  created_by_name!: string;

  @ManyToOne(() => Lead, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead!: Lead;

  @ManyToOne(() => CompanyUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_user_id' })
  companyUser!: CompanyUser;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
