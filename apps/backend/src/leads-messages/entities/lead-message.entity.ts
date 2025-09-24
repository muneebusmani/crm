import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity('lead_messages')
export class LeadMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne('User', 'messages', { eager: true })
  dealer!: any;

  @ManyToOne('Lead', 'messages', { eager: true })
  lead!: any;

  @CreateDateColumn()
  createdAt!: Date;
}
