import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  action!: string; // e.g., CREATE_LEAD, UPDATE_LEAD

  @Column({ nullable: true, type: 'text' })
  description?: string; // human-readable description

  @Column({ nullable: true })
  user_id?: number; // user performing the action

  @Column({ nullable: true })
  entity?: string; // entity type e.g., Lead, User

  @Column({ nullable: true })
  entity_id?: string; // entity id

  @CreateDateColumn()
  created_at!: Date;
}
