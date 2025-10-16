import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  number!: string;

  @Column({ nullable: true })
  vehicle_model!: string;

  @Column({ nullable: true })
  vehicle_reg!: string;

  @Column({ nullable: true })
  vehicle_brand!: string;

  @Column({ nullable: true })
  vehicle_title!: string;

  @Column({ nullable: true })
  vehicle_vrm!: string;

  @Column({ nullable: true })
  vehicle_series!: string;

  @Column({ nullable: true })
  vehicle_part!: string;

  @Column({ nullable: true })
  engin_capacity!: string;

  @Column({ nullable: true })
  fuelType!: string;

  @Column({ nullable: true })
  part_supplied!: string;

  @Column({ nullable: true })
  supply_only!: string;

  @Column({ nullable: true })
  consider_both!: string;

  @Column({ nullable: true })
  reconditioned_condition!: string;

  @Column({ nullable: true })
  used_condition!: string;

  @Column({ nullable: true })
  new_condition!: string;

  @Column({ nullable: true })
  consider_all_condition!: string;

  @Column({ nullable: true })
  postcode!: string;

  @Column({ nullable: true })
  vehicle_drive!: string;

  @Column({ nullable: true })
  collection_required!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string;

  @Column({ nullable: true })
  engine_code!: string;

  @Column({ nullable: true })
  source!: string;

  @Column({ nullable: true })
  status!: string;

  @Column({ nullable: true })
  assigned_to!: string;

  @Column({ nullable: true, type: 'timestamp' })
  follow_up_date!: Date;

  @Column({ nullable: true, type: 'text' })
  notes!: string;

  @Column({ type: 'boolean', default: false })
  is_deleted!: boolean;

  @OneToMany('DealerLead', 'lead')
  dealerLeads!: any[];

  @OneToMany('Quotation', 'lead')
  quotations!: any[];

  @OneToMany('invoices', 'lead') // 'Quotation' is the target, 'dealer' is property in Quotation
  invoices!: any[];

  @Column({
    name: 'createdAt',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({
    name: 'updatedAt',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @OneToMany('LeadMessage', 'lead')
  messages!: any[];
}
