/** biome-ignore-all lint/suspicious/noExplicitAny: <idk> */
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @OneToOne('Admin', 'user')
  admin: any;

  @OneToOne('Dealer', 'user')
  dealer: any;
}
