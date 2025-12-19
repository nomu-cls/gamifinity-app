import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SendMessageRequest {
  lineUserId: string;
  message: string;
  adminName?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { lineUserId, message, adminName }: SendMessageRequest = await req.json();

    if (!lineUserId || !message) {
      return new Response(JSON.stringify({ error: 'lineUserId and message are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: lineSettings } = await supabase
      .from('line_settings')
      .select('channel_access_token')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (!lineSettings?.channel_access_token) {
      return new Response(JSON.stringify({ error: 'LINE settings not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lineSettings.channel_access_token}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [{
          type: 'text',
          text: message,
        }],
      }),
    });

    if (!lineResponse.ok) {
      const errorText = await lineResponse.text();
      console.error('LINE API error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to send LINE message', details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await supabase
      .from('line_messages')
      .insert({
        line_user_id: lineUserId,
        direction: 'outbound',
        message_type: 'text',
        message_text: message,
        sent_by_admin: adminName || 'admin',
      });

    await supabase
      .from('chat_status')
      .update({
        last_admin_reply_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('line_user_id', lineUserId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
