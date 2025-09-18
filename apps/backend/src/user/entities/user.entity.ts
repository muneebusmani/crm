import { UserType, UserStatus } from '@crm/types';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

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
}
