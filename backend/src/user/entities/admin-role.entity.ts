import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Admin } from './admin.entity';

@Entity('admin_role')
export class AdminRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    () => Admin,
    (admin) => admin.adminRole,
  )
  admins: Admin[];
}
