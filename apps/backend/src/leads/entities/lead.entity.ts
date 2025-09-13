import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("leads")
export class Lead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  vehicle_model!: string;

  @Column({ nullable: true })
  vehicle_reg!: string;

  @Column({ nullable: true })
  customer_name!: string;

  @Column({ nullable: true })
  customer_email!: string;

  @Column({ nullable: true })
  customer_phone!: string;

  @Column({ nullable: true })
  source!: string;

  @Column({ nullable: true })
  status!: string;

  @Column({ nullable: true })
  assigned_to!: string;

  @Column({ nullable: true, type: "timestamp" })
  follow_up_date!: Date;

  @Column({ nullable: true, type: "text" })
  notes!: string;
}
