import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';

/**
 * HqLeadVisibility - Join table for 1:Many HQ Lead distribution
 *
 * This table tracks which dealers can see which HQ leads.
 * A single HQ lead can be visible to multiple dealers based on their tier quota.
 *
 * Key fields:
 * - leadId: The HQ lead that is visible
 * - dealerId: The dealer who can see this lead
 * - assignedDate: When the visibility was granted (for daily quota tracking)
 * - isManualOverride: True if admin manually assigned (bypasses quota)
 */
@Entity('hq_lead_visibility')
@Unique(['leadId', 'dealerId'])
@Index(['dealerId', 'assignedDate'])
export class HqLeadVisibility {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  leadId!: number;

  @ManyToOne('Lead', 'hqVisibility', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead!: any;

  @Column()
  dealerId!: number;

  @ManyToOne('Dealer', 'hqLeadVisibility', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dealerId' })
  dealer!: any;

  /**
   * The date when this lead was made visible to the dealer.
   * Used for daily quota calculations - only leads assigned "today" count against quota.
   */
  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  assignedDate!: Date;

  /**
   * If true, this assignment was done manually by an admin and bypassed quota limits.
   * Manual overrides are always preserved regardless of quota status.
   */
  @Column({ type: 'boolean', default: false })
  isManualOverride!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
