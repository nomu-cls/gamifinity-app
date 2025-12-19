import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const CHANNEL_ACCESS_TOKEN = 'LubWxNCaMtbj69PfOEXBajeK02Zcyf1AmPuQq8NmEIOmcLsm06WckxP401TagSBE3K4p/7RwKNj1yrfJzwH6CoBsIArWQy7LgYdEv8DtTlCSPgCcq+24Dq3siOfE12ITtMi4RJIO9voGYBXmOIkhhQdB04t89/1O/w1cDnyilFU=';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

async function pushMessage(userId: string, messages: any[]) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: userId,
      messages,
    }),
  });
  return response;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { googleSheetsUrl, data } = await req.json();

    console.log('Received request:', { googleSheetsUrl, data });

    if (!googleSheetsUrl) {
      throw new Error('Google Sheets URL is required');
    }

    console.log('Sending to Google Sheets...');

    const response = await fetch(googleSheetsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Google Sheets response status:', response.status);

    const responseText = await response.text();
    console.log('Google Sheets response text:', responseText);

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} - ${responseText}`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      result = { raw: responseText };
    }

    console.log('Successfully submitted to Google Sheets');

    if (data.email && data.day) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: lineUser } = await supabase
          .from('line_users')
          .select('line_user_id, display_name')
          .eq('email', data.email)
          .maybeSingle();

        if (lineUser) {
          console.log('Found LINE user:', lineUser.display_name);

          const { data: dayReward } = await supabase
            .from('day_rewards')
            .select('title, message, reward_url, image_url')
            .eq('day', data.day)
            .maybeSingle();

          if (dayReward) {
            console.log('Found day reward:', dayReward);

            const messages: any[] = [];

            let rewardText = `\u{1F381} Day${data.day} \u8AB2\u984C\u5B8C\u4E86\u304A\u3081\u3067\u3068\u3046\uFF01\n\n`;
            rewardText += `\u3010${dayReward.title}\u3011\n\n`;
            rewardText += `${dayReward.message}\n\n`;

            if (dayReward.reward_url) {
              rewardText += `\u{1F381} \u7279\u5178\u306F\u3053\u3061\u3089\uFF1A\n${dayReward.reward_url}`;
            }

            messages.push({
              type: 'text',
              text: rewardText,
            });

            const lineResponse = await pushMessage(lineUser.line_user_id, messages);
            console.log('LINE push response:', lineResponse.status);
          }
        }
      } catch (lineError) {
        console.error('Error sending LINE reward:', lineError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in submit-to-sheets function:', error);
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