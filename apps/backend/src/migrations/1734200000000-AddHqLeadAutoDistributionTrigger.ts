import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add a Postgres trigger for automatic HQ Lead distribution.
 *
 * This trigger fires AFTER INSERT on the leads table when isHqLead = true.
 * It automatically creates hq_lead_visibility records for all eligible dealers
 * based on their tier quotas.
 *
 * Quota Logic:
 * - Gold tier (hqLeadQuota = -1): Unlimited, always gets visibility
 * - Silver tier (hqLeadQuota = 10): Up to 10 leads per day
 * - Bronze tier (hqLeadQuota = 5): Up to 5 leads per day
 * - customHqQuota on dealer overrides tier default if set
 * - Quota = 0 means no HQ leads for that dealer
 */
export class AddHqLeadAutoDistributionTrigger1734200000000
  implements MigrationInterface
{
  name = 'AddHqLeadAutoDistributionTrigger1734200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the function that handles HQ lead distribution
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION distribute_hq_lead_to_dealers()
            RETURNS TRIGGER AS $$
            DECLARE
                dealer_record RECORD;
                effective_quota INTEGER;
                today_count INTEGER;
                today_date DATE := CURRENT_DATE;
            BEGIN
                -- Only process if this is an HQ lead
                IF NEW."isHqLead" = true THEN
                    -- Log for debugging
                    RAISE LOG 'HQ Lead Distribution: Processing lead ID %', NEW.id;
                    
                    -- Loop through all dealers with their tier info
                    FOR dealer_record IN 
                        SELECT 
                            d.id AS dealer_id,
                            d."customHqQuota",
                            COALESCE(t."hqLeadQuota", 0) AS tier_quota
                        FROM dealer d
                        LEFT JOIN dealer_tier t ON d."tierId" = t.id
                    LOOP
                        -- Calculate effective quota: customHqQuota takes priority, then tier quota
                        IF dealer_record."customHqQuota" IS NOT NULL THEN
                            effective_quota := dealer_record."customHqQuota";
                        ELSE
                            effective_quota := dealer_record.tier_quota;
                        END IF;
                        
                        -- Skip dealers with no HQ access (quota = 0)
                        IF effective_quota = 0 THEN
                            CONTINUE;
                        END IF;
                        
                        -- Unlimited quota (-1) - always assign
                        IF effective_quota = -1 THEN
                            BEGIN
                                INSERT INTO hq_lead_visibility ("leadId", "dealerId", "assignedDate", "isManualOverride")
                                VALUES (NEW.id, dealer_record.dealer_id, today_date, false)
                                ON CONFLICT ("leadId", "dealerId") DO NOTHING;
                                
                                RAISE LOG 'HQ Lead Distribution: Assigned lead % to dealer % (unlimited)', NEW.id, dealer_record.dealer_id;
                            EXCEPTION WHEN OTHERS THEN
                                RAISE LOG 'HQ Lead Distribution: Failed to assign lead % to dealer %: %', NEW.id, dealer_record.dealer_id, SQLERRM;
                            END;
                            CONTINUE;
                        END IF;
                        
                        -- Check daily quota for limited dealers
                        SELECT COUNT(*) INTO today_count
                        FROM hq_lead_visibility
                        WHERE "dealerId" = dealer_record.dealer_id
                          AND "assignedDate" = today_date;
                        
                        IF today_count < effective_quota THEN
                            BEGIN
                                INSERT INTO hq_lead_visibility ("leadId", "dealerId", "assignedDate", "isManualOverride")
                                VALUES (NEW.id, dealer_record.dealer_id, today_date, false)
                                ON CONFLICT ("leadId", "dealerId") DO NOTHING;
                                
                                RAISE LOG 'HQ Lead Distribution: Assigned lead % to dealer % (quota: %/%)', NEW.id, dealer_record.dealer_id, today_count + 1, effective_quota;
                            EXCEPTION WHEN OTHERS THEN
                                RAISE LOG 'HQ Lead Distribution: Failed to assign lead % to dealer %: %', NEW.id, dealer_record.dealer_id, SQLERRM;
                            END;
                        ELSE
                            RAISE LOG 'HQ Lead Distribution: Dealer % at quota limit (%/%)', dealer_record.dealer_id, today_count, effective_quota;
                        END IF;
                    END LOOP;
                END IF;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

    // Create the trigger
    await queryRunner.query(`
            DROP TRIGGER IF EXISTS trigger_distribute_hq_lead ON leads;
            
            CREATE TRIGGER trigger_distribute_hq_lead
            AFTER INSERT ON leads
            FOR EACH ROW
            WHEN (NEW."isHqLead" = true)
            EXECUTE FUNCTION distribute_hq_lead_to_dealers();
        `);

    console.log('✅ HQ Lead auto-distribution trigger created');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the trigger
    await queryRunner.query(`
            DROP TRIGGER IF EXISTS trigger_distribute_hq_lead ON leads;
        `);

    // Drop the function
    await queryRunner.query(`
            DROP FUNCTION IF EXISTS distribute_hq_lead_to_dealers();
        `);

    console.log('✅ HQ Lead auto-distribution trigger removed');
  }
}
