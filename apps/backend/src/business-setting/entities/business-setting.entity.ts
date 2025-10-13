import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('business_settings')
export class BusinessSetting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  dealerId!: Number; // no foreign key constraint — safe in production

  @Column({ type: 'text', nullable: true })
  salesTerms!: string;

  @Column({ type: 'text', nullable: true })
  quotation!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
