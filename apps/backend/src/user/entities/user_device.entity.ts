import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_device')
export class UserDevice {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @ManyToOne('User', 'devices')
  user!: any;

  @Column({ type: 'varchar', length: 255 })
  deviceId!: string;

  @Column({ type: 'varchar', length: 100, default: 'web' })
  platform!: 'web' | 'android' | 'ios';

  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceName!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt!: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
