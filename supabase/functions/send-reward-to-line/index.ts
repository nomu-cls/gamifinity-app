import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LineSettings {
  channel_access_token: string;
}

async function getLineSettings(supabase: any): Promise<LineSettings | null> {
  const { data } = await supabase
    .from('line_settings')
    .select('channel_access_token')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();
  return data;
}

async function getMessageTemplate(supabase: any, templateKey: string): Promise<string> {
  const { data } = await supabase
    .from('line_message_templates')
    .select('message_content')
    .eq('template_key', templateKey)
    .eq('is_active', true)
    .maybeSingle();
  return data?.message_content || '';
}

async function getSiteSettings(supabase: any): Promise<any> {
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .maybeSingle();
  return data;
}

function replacePlaceholders(template: string, values: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

async function pushMessage(userId: string, messages: any[], accessToken: string) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
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
    const { email, rewardType, rewardTitle, rewardMessage, imageUrl, rewardUrl } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const lineSettings = await getLineSettings(supabase);
    if (!lineSettings) {
      return new Response(JSON.stringify({ error: 'LINE settings not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const siteSettings = await getSiteSettings(supabase);

    const { data: lineUser } = await supabase
      .from('line_users')
      .select('line_user_id, display_name')
      .eq('email', email)
      .maybeSingle();

    if (!lineUser) {
      return new Response(JSON.stringify({
        error: 'LINE account not linked',
        message: 'このメールアドレスに紐づくLINEアカウントが見つかりません。LINEで友だち追加後、メールアドレスを登録してください。'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let finalRewardUrl = rewardUrl;
    let finalRewardTitle = rewardTitle;
    let finalRewardMessage = rewardMessage;
    let finalImageUrl = imageUrl;

    if (!finalRewardUrl) {
      if (rewardType === 'perfect') {
        const { data: giftContent } = await supabase
          .from('gift_contents')
          .select('reward_url, title, message, image_url')
          .eq('is_active', true)
          .maybeSingle();

        if (giftContent) {
          finalRewardUrl = giftContent.reward_url;
          finalRewardTitle = finalRewardTitle || giftContent.title;
          finalRewardMessage = finalRewardMessage || giftContent.message;
          finalImageUrl = finalImageUrl || giftContent.image_url;
        }
      } else if (rewardType && !isNaN(Number(rewardType))) {
        const { data: dayReward } = await supabase
          .from('day_rewards')
          .select('reward_url, title, message, image_url')
          .eq('day', Number(rewardType))
          .maybeSingle();

        if (dayReward) {
          finalRewardUrl = dayReward.reward_url;
          finalRewardTitle = finalRewardTitle || dayReward.title;
          finalRewardMessage = finalRewardMessage || dayReward.message;
          finalImageUrl = finalImageUrl || dayReward.image_url;
        }
      }
    }

    const messages: any[] = [];

    if (finalImageUrl) {
      messages.push({
        type: 'image',
        originalContentUrl: finalImageUrl,
        previewImageUrl: finalImageUrl,
      });
    }

    const typeLabel = rewardType === 'perfect' ? 'Perfect特典プレゼント' : `Day${rewardType}特典プレゼント`;

    const template = await getMessageTemplate(supabase, 'reward_notification');
    let textMessage: string;

    if (template) {
      textMessage = replacePlaceholders(template, {
        app_title: siteSettings?.app_title || '絵本で「未来を設定する」ノート',
        reward_type: typeLabel,
        reward_title: finalRewardTitle ? `【${finalRewardTitle}】` : '',
        reward_message: finalRewardMessage || '特典を受け取りました！',
        reward_url: finalRewardUrl || ''
      });
    } else {
      textMessage = `${typeLabel}をお届けします！\n\n${finalRewardTitle ? `【${finalRewardTitle}】\n\n` : ''}${finalRewardMessage || '特典を受け取りました！'}`;
      if (finalRewardUrl) {
        textMessage += `\n\n▼ 特典はこちら ▼\n${finalRewardUrl}`;
      }
    }

    messages.push({
      type: 'text',
      text: textMessage,
    });

    const response = await pushMessage(lineUser.line_user_id, messages, lineSettings.channel_access_token);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LINE API error:', errorText);
      return new Response(JSON.stringify({
        error: 'Failed to send LINE message',
        details: errorText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'LINEに特典を送信しました',
      sentRewardUrl: finalRewardUrl
    }), {
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
