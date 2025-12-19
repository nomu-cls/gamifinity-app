import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LineSettings {
  channel_access_token: string;
  liff_url: string;
}

interface DaySetting {
  day: number;
  title: string;
}

async function getLineSettings(supabase: any): Promise<LineSettings | null> {
  const { data } = await supabase
    .from('line_settings')
    .select('channel_access_token, liff_url')
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

async function getDaySettings(supabase: any): Promise<Record<number, DaySetting>> {
  const { data } = await supabase
    .from('day_settings')
    .select('day, title')
    .eq('is_active', true)
    .order('day');

  if (!data) return {};
  return data.reduce((acc: Record<number, DaySetting>, setting: DaySetting) => {
    acc[setting.day] = setting;
    return acc;
  }, {});
}

function replacePlaceholders(template: string, values: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

async function getSiteSettings(supabase: any) {
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .maybeSingle();
  return data;
}

function getCurrentDay(now: Date, siteSettings: any, daySettings: Record<number, DaySetting>): { day: number; title: string; fieldName: string } | null {
  const deadlines = [
    { day: 1, deadline: siteSettings?.day1_assignment_deadline, fieldName: 'day1_field1' },
    { day: 2, deadline: siteSettings?.day2_assignment_deadline, fieldName: 'day2_field1' },
    { day: 3, deadline: siteSettings?.day3_assignment_deadline, fieldName: 'day3_field1' },
  ];

  for (const { day, deadline, fieldName } of deadlines) {
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (now <= deadlineDate) {
        return {
          day,
          title: daySettings[day]?.title || `Day ${day}`,
          fieldName
        };
      }
    }
  }

  return null;
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
    const daySettings = await getDaySettings(supabase);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const currentDayInfo = getCurrentDay(now, siteSettings, daySettings);

    if (!currentDayInfo) {
      return new Response(JSON.stringify({
        success: true,
        message: '現在は課題期間外です',
        sentCount: 0,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: users, error: usersError } = await supabase
      .from('line_users')
      .select('*')
      .eq('reminder_enabled', true)
      .not('email', 'is', null);

    if (usersError) {
      throw usersError;
    }

    let sentCount = 0;
    let skippedCount = 0;
    const errors: any[] = [];

    const reminderTemplate = await getMessageTemplate(supabase, 'reminder');

    for (const user of users || []) {
      const reminderTime = user.reminder_time || '09:00:00';
      const [hour, minute] = reminderTime.split(':').map(Number);

      const shouldSend = hour === currentHour && Math.abs(minute - currentMinute) < 5;

      const lastReminded = user.last_reminded_at ? new Date(user.last_reminded_at) : null;
      const alreadySentToday = lastReminded &&
        lastReminded.getFullYear() === now.getFullYear() &&
        lastReminded.getMonth() === now.getMonth() &&
        lastReminded.getDate() === now.getDate();

      if (shouldSend && !alreadySentToday) {
        try {
          const { data: userStory } = await supabase
            .from('user_stories')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();

          const isSubmitted = userStory && userStory[currentDayInfo.fieldName] &&
            userStory[currentDayInfo.fieldName].trim() !== '';

          if (isSubmitted) {
            skippedCount++;
            continue;
          }

          let message: string;
          if (reminderTemplate) {
            message = replacePlaceholders(reminderTemplate, {
              app_title: siteSettings?.app_title || '絵本で「未来を設定する」ノート',
              day: String(currentDayInfo.day),
              title: currentDayInfo.title,
              liff_url: lineSettings.liff_url
            });
          } else {
            message = `おはようございます！\n\nDay ${currentDayInfo.day} 「${currentDayInfo.title}」の課題がまだ未提出です。\n今日の予測ストーリーを書きましょう！`;
            message += `\n\n下記のフォームから記入してください：\n${lineSettings.liff_url}`;
          }

          const response = await pushMessage(user.line_user_id, [{
            type: 'text',
            text: message,
          }], lineSettings.channel_access_token);

          if (response.ok) {
            await supabase
              .from('line_users')
              .update({ last_reminded_at: now.toISOString() })
              .eq('line_user_id', user.line_user_id);
            sentCount++;
          } else {
            const errorText = await response.text();
            errors.push({ userId: user.line_user_id, error: errorText });
          }
        } catch (err) {
          errors.push({ userId: user.line_user_id, error: err.message });
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      currentDay: currentDayInfo.day,
      sentCount,
      skippedCount,
      totalUsers: users?.length || 0,
      errors: errors.length > 0 ? errors : undefined,
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
