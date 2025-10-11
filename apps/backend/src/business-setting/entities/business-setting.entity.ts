import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'business_settings' })
export class BusinessSetting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  businessName!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  // Privacy Policy field
  @Column({ type: 'text', nullable: true })
  privacyPolicy?: string;

  // Terms & Conditions field
  @Column({ type: 'text', nullable: true })
  termsAndConditions?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
