import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface IncomingLead {
  // Fields from enginefinders.co.uk form
  name?: string;
  email?: string;
  number?: string;
  vehicle_model?: string;
  vehicle_reg?: string;
  vehicle_brand?: string;
  vehicle_title?: string;
  vehicle_vrm?: string;
  vehicle_series?: string;
  vehicle_part?: string;
  engine_capacity?: string;
  fuel_type?: string;
  part_supplied?: string;
  supply_only?: string;
  consider_both?: string;
  reconditioned_condition?: string;
  used_condition?: string;
  new_condition?: string;
  consider_all_condition?: string;
  postcode?: string;
  vehicle_drive?: string;
  collection_required?: string;
  description?: string;
  engine_code?: string;
}

// Regex to identify HQ brands (case-insensitive)
const hqBrandsRegex =
  /(bmw|land\s?rover|rang(e)?\s?rover|jaguar|merc(edes)?[\s-]?benz)/i;

const isHqLead = (leadData: IncomingLead): boolean => {
  const searchableString = [
    leadData.vehicle_model,
    leadData.vehicle_reg,
    leadData.vehicle_brand,
    leadData.vehicle_title,
    leadData.vehicle_vrm,
    leadData.vehicle_series,
    leadData.vehicle_part,
    leadData.fuel_type,
  ]
    .join(' ')
    .toLowerCase();

  if (!searchableString) return false;
  return hqBrandsRegex.test(searchableString);
};

serve(async (req) => {
  // CORS headers for cross-origin requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role (has full access)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Parse incoming lead data
    const leadData: IncomingLead = await req.json();

    // Log for debugging
    console.log('Received lead:', leadData);

    // Validate required fields
    if (!leadData.email && !leadData.number) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email or phone number is required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Determine if it's an HQ lead
    const isHq = isHqLead(leadData);

    // Process and structure the data matching Lead entity structure
    const processedLead = {
      name: leadData.name || null,
      email: leadData.email || null,
      number: leadData.number || null,
      vehicle_model: leadData.vehicle_model || null,
      vehicle_reg: leadData.vehicle_reg || null,
      vehicle_brand: leadData.vehicle_brand || null,
      vehicle_title: leadData.vehicle_title || null,
      vehicle_vrm: leadData.vehicle_vrm || null,
      vehicle_series: leadData.vehicle_series || null,
      vehicle_part: leadData.vehicle_part || null,
      engin_capacity: leadData.engine_capacity || null,
      fuelType: leadData.fuel_type || null,
      part_supplied: leadData.part_supplied || null,
      supply_only: leadData.supply_only || null,
      consider_both: leadData.consider_both || null,
      reconditioned_condition: leadData.reconditioned_condition || null,
      used_condition: leadData.used_condition || null,
      new_condition: leadData.new_condition || null,
      consider_all_condition: leadData.consider_all_condition || null,
      postcode: leadData.postcode || null,
      vehicle_drive: leadData.vehicle_drive || null,
      collection_required: leadData.collection_required || null,
      description: leadData.description || null,
      engine_code: leadData.engine_code || null,
      source: 'enginefinders.co.uk',
      status: 'NEW',
      is_deleted: false,
      isHqLead: isHq, // Set the flag here
    };

    // Insert into database
    const { data, error } = await supabaseClient
      .from('leads') // Lead table name from entity
      .insert([processedLead])
      .select();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save lead',
          details: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const savedLead = data[0];
    console.log('Lead saved successfully:', savedLead);

    // If this is an HQ lead, distribute to eligible dealers
    // Note: This is a fallback - the Postgres trigger should handle this automatically
    let distributedCount = 0;
    if (isHq && savedLead?.id) {
      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        // Get all dealers with their tier info
        const { data: dealers, error: dealerError } = await supabaseClient
          .from('dealer')
          .select(`
            id,
            customHqQuota,
            tier:dealer_tier(hqLeadQuota)
          `);

        if (dealerError) {
          console.error('Error fetching dealers:', dealerError);
        } else if (dealers) {
          for (const dealer of dealers) {
            // Calculate effective quota
            const customQuota = dealer.customHqQuota;
            const tierQuota = dealer.tier?.hqLeadQuota ?? 0;
            const effectiveQuota =
              customQuota !== null ? customQuota : tierQuota;

            // Skip dealers with no HQ access
            if (effectiveQuota === 0) continue;

            // Check if unlimited or has quota available
            if (effectiveQuota === -1) {
              // Unlimited - assign directly
              const { error: insertError } = await supabaseClient
                .from('hq_lead_visibility')
                .upsert(
                  {
                    leadId: savedLead.id,
                    dealerId: dealer.id,
                    assignedDate: today,
                    isManualOverride: false,
                  },
                  { onConflict: 'leadId,dealerId' },
                );

              if (!insertError) distributedCount++;
              else
                console.log(
                  `Dealer ${dealer.id} already has access or error:`,
                  insertError,
                );
            } else {
              // Check quota - count today's assignments
              const { count, error: countError } = await supabaseClient
                .from('hq_lead_visibility')
                .select('*', { count: 'exact', head: true })
                .eq('dealerId', dealer.id)
                .eq('assignedDate', today);

              if (countError) {
                console.error(
                  `Error counting quota for dealer ${dealer.id}:`,
                  countError,
                );
                continue;
              }

              const todayCount = count ?? 0;
              if (todayCount < effectiveQuota) {
                const { error: insertError } = await supabaseClient
                  .from('hq_lead_visibility')
                  .upsert(
                    {
                      leadId: savedLead.id,
                      dealerId: dealer.id,
                      assignedDate: today,
                      isManualOverride: false,
                    },
                    { onConflict: 'leadId,dealerId' },
                  );

                if (!insertError) {
                  distributedCount++;
                  console.log(
                    `Assigned lead ${savedLead.id} to dealer ${dealer.id} (${todayCount + 1}/${effectiveQuota})`,
                  );
                }
              } else {
                console.log(
                  `Dealer ${dealer.id} at quota limit (${todayCount}/${effectiveQuota})`,
                );
              }
            }
          }
          console.log(
            `HQ Lead ${savedLead.id} distributed to ${distributedCount} dealers`,
          );
        }
      } catch (distError) {
        console.error('Error distributing HQ lead:', distError);
        // Don't fail the request - lead was saved successfully
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lead received and saved',
        leadId: savedLead?.id,
        isHqLead: isHq,
        distributedTo: distributedCount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error processing lead:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
