import { UserType, UserStatus } from '@crm/types';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  username!: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.DEALER,
  })
  type!: UserType;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @OneToOne('Admin', 'user')
  // biome-ignore lint/suspicious/noExplicitAny: <fixing circular dependency>
  admin: any;

  @OneToOne('Dealer', 'user')
  // biome-ignore lint/suspicious/noExplicitAny: <fixing circular dependency>
  dealer: any;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetPasswordToken!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resetPasswordExpires!: Date | null;

  @OneToMany('DealerLead', 'dealer')
  dealerLeads!: any[];

  @OneToMany('Quotation', 'dealer') // 'Quotation' is the target, 'dealer' is property in Quotation
  quotations!: any[];

  @OneToMany('invoices', 'dealer') // 'Quotation' is the target, 'dealer' is property in Quotation
  invoices!: any[];

  @OneToMany('LeadMessage', 'dealer')
  messages!: any[];

  @OneToMany('BankDetails', 'user')
  bankDetails!: any[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @Column({ nullable: true })
  refreshToken!: string;

  @Column({ name: 'allowed_devices', type: 'int', nullable: true })
  allowedDevices!: number | null; // NULL = unlimited devices

  @OneToMany('UserDevice', 'user')
  devices!: any[];
}
