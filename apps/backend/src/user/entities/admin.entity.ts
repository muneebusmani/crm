import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AdminRole } from './admin-role.entity';
import { User } from './user.entity';

@Entity('admin')
@Unique(['userId'])
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column({ nullable: true })
  roleId!: number;

  @Column()
  role!: string;

  @OneToOne(
    () => User,
    (user) => user.admin,
  )

  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(
    () => AdminRole,
    (adminRole) => adminRole.admins,
    { nullable: true },
  )
  @JoinColumn({ name: 'roleId' })
  adminRole!: AdminRole;
}
