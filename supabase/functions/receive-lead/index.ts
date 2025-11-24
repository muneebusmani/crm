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

    console.log('Lead saved successfully:', data);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lead received and saved',
        leadId: data[0]?.id,
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
