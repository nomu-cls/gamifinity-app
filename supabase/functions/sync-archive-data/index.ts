import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { archiveSheetUrl } = await req.json();

    if (!archiveSheetUrl) {
      throw new Error('Archive sheet URL is required');
    }

    console.log('Fetching archive data from Google Sheets...');

    // Fetch data from Google Sheets
    const response = await fetch(archiveSheetUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Google Sheets: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received data from sheets:', data);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update all user_stories with archive data
    const updates = [];

    if (data.day1) {
      updates.push({
        day1_archive_url: data.day1.url,
        day1_archive_expires_at: data.day1.expiresAt,
      });
    }

    if (data.day2) {
      updates.push({
        day2_archive_url: data.day2.url,
        day2_archive_expires_at: data.day2.expiresAt,
      });
    }

    if (data.day3) {
      updates.push({
        day3_archive_url: data.day3.url,
        day3_archive_expires_at: data.day3.expiresAt,
      });
    }

    // Merge all updates into one object
    const allUpdates = Object.assign({}, ...updates);

    // Update all user stories
    const { error: updateError } = await supabase
      .from('user_stories')
      .update(allUpdates)
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records

    if (updateError) {
      throw new Error(`Failed to update database: ${updateError.message}`);
    }

    console.log('Successfully synced archive data');

    return new Response(
      JSON.stringify({ success: true, data: allUpdates }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in sync-archive-data function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});