import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('bank_details')
export class BankDetails {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  accountHolderName!: string;

  @Column({ type: 'varchar', length: 50 })
  accountNumber!: string;

  @Column({ type: 'varchar', length: 50 })
  bankName!: string;

  @Column({ type: 'varchar', length: 50 })
  branchName!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ifscCode?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  iban?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  swiftCode?: string;

  @ManyToOne('User', 'bankDetails')
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
