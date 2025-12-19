import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

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
    const { sheetUrl } = await req.json();

    if (!sheetUrl) {
      throw new Error('Sheet URL is required');
    }

    console.log('Fetching reward URLs from Google Sheets...');

    const response = await fetch(sheetUrl + '?action=getRewards', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Google Sheets: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received reward data:', data);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results = [];

    if (data.reward1) {
      const { error } = await supabase
        .from('day_rewards')
        .update({ reward_url: data.reward1 })
        .eq('day', 1);
      results.push({ day: 1, url: data.reward1, error: error?.message });
    }

    if (data.reward2) {
      const { error } = await supabase
        .from('day_rewards')
        .update({ reward_url: data.reward2 })
        .eq('day', 2);
      results.push({ day: 2, url: data.reward2, error: error?.message });
    }

    if (data.reward3) {
      const { error } = await supabase
        .from('day_rewards')
        .update({ reward_url: data.reward3 })
        .eq('day', 3);
      results.push({ day: 3, url: data.reward3, error: error?.message });
    }

    if (data.perfectReward) {
      const { error } = await supabase
        .from('gift_contents')
        .update({ reward_url: data.perfectReward })
        .eq('is_active', true);
      results.push({ type: 'perfect', url: data.perfectReward, error: error?.message });
    }

    console.log('Successfully synced reward URLs');

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in sync-reward-urls function:', error);
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