import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { crypto } from 'jsr:@std/crypto@1.0.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Line-Signature',
};

interface LineEvent {
  type: string;
  message?: {
    type: string;
    id: string;
    text?: string;
    stickerId?: string;
    packageId?: string;
  };
  timestamp: number;
  source: {
    type: string;
    userId: string;
  };
  replyToken: string;
}

interface WebhookRequestBody {
  destination: string;
  events: LineEvent[];
}

interface LineSettings {
  channel_access_token: string;
  channel_secret: string;
  liff_url: string;
  admin_password: string;
}

interface MessageTemplate {
  template_key: string;
  message_content: string;
}

async function getLineSettings(supabase: any): Promise<LineSettings | null> {
  const { data, error } = await supabase
    .from('line_settings')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching line_settings:', error);
  }
  console.log('line_settings data:', data ? 'found' : 'not found');

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

/**
 * Creates a Flex Message boarding pass for new LINE followers
 */
function createBoardingPassFlexMessage(
  displayName: string,
  liffUrl: string,
  expirationHours: number = 48
): any {
  // Calculate expiration date
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + expirationHours);
  const formattedExpiration = `${expirationDate.getFullYear()}/${String(expirationDate.getMonth() + 1).padStart(2, '0')}/${String(expirationDate.getDate()).padStart(2, '0')} ${String(expirationDate.getHours()).padStart(2, '0')}:${String(expirationDate.getMinutes()).padStart(2, '0')}`;

  return {
    type: 'flex',
    altText: '🚀 搭乗券が発行されました',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '🚀',
                size: 'xl',
                flex: 0
              },
              {
                type: 'text',
                text: 'BOARDING PASS',
                weight: 'bold',
                size: 'lg',
                color: '#FFFFFF',
                flex: 1,
                margin: 'md'
              }
            ],
            alignItems: 'center'
          },
          {
            type: 'text',
            text: 'ISSUED',
            size: 'xs',
            color: '#A0D2DB',
            margin: 'sm'
          }
        ],
        backgroundColor: '#1A365D',
        paddingAll: 'lg'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'COMMANDER NAME',
                size: 'xxs',
                color: '#6B7280',
                weight: 'bold'
              },
              {
                type: 'text',
                text: displayName,
                size: 'xl',
                weight: 'bold',
                color: '#1A365D',
                margin: 'xs'
              }
            ],
            margin: 'md'
          },
          {
            type: 'separator',
            margin: 'lg',
            color: '#E5E7EB'
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: 'EXPIRATION',
                    size: 'xxs',
                    color: '#6B7280',
                    weight: 'bold'
                  },
                  {
                    type: 'text',
                    text: formattedExpiration,
                    size: 'sm',
                    weight: 'bold',
                    color: '#1A365D',
                    margin: 'xs'
                  }
                ],
                flex: 1
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: 'STATUS',
                    size: 'xxs',
                    color: '#6B7280',
                    weight: 'bold'
                  },
                  {
                    type: 'text',
                    text: 'INITIALIZING',
                    size: 'sm',
                    weight: 'bold',
                    color: '#059669',
                    margin: 'xs'
                  }
                ],
                flex: 1
              }
            ],
            margin: 'lg'
          }
        ],
        paddingAll: 'lg',
        backgroundColor: '#FFFFFF'
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'ダッシュボードを開く',
              uri: liffUrl
            },
            style: 'primary',
            color: '#3B82F6',
            height: 'md'
          }
        ],
        paddingAll: 'md',
        backgroundColor: '#F3F4F6'
      },
      styles: {
        header: {
          separator: false
        }
      }
    }
  };
}

async function verifySignature(body: string, signature: string, channelSecret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(channelSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureBase64 = btoa(String.fromCharCode(...signatureArray));
  return signatureBase64 === signature;
}

async function replyMessage(replyToken: string, messages: any[], accessToken: string) {
  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  });
  return response;
}

async function getUserProfile(userId: string, accessToken: string) {
  const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (response.ok) {
    return await response.json();
  }
  return null;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function saveInboundMessage(supabase: any, userId: string, event: LineEvent) {
  const messageType = event.message?.type || 'unknown';
  const messageText = event.message?.text || null;
  const messageData: any = {};

  if (event.message?.stickerId) {
    messageData.stickerId = event.message.stickerId;
    messageData.packageId = event.message.packageId;
  }

  await supabase
    .from('line_messages')
    .insert({
      line_user_id: userId,
      direction: 'inbound',
      message_type: messageType,
      message_text: messageText,
      message_data: Object.keys(messageData).length > 0 ? messageData : {},
      line_message_id: event.message?.id || null,
    });

  const { data: existingStatus } = await supabase
    .from('chat_status')
    .select('id, unread_count')
    .eq('line_user_id', userId)
    .maybeSingle();

  if (existingStatus) {
    await supabase
      .from('chat_status')
      .update({
        unread_count: (existingStatus.unread_count || 0) + 1,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('line_user_id', userId);
  } else {
    await supabase
      .from('chat_status')
      .insert({
        line_user_id: userId,
        unread_count: 1,
        last_message_at: new Date().toISOString(),
      });
  }
}

async function saveOutboundMessage(supabase: any, userId: string, messageText: string, sentByAdmin?: string) {
  await supabase
    .from('line_messages')
    .insert({
      line_user_id: userId,
      direction: 'outbound',
      message_type: 'text',
      message_text: messageText,
      sent_by_admin: sentByAdmin || 'system',
    });
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

    const signature = req.headers.get('x-line-signature');
    const bodyText = await req.text();

    if (!signature || !await verifySignature(bodyText, signature, lineSettings.channel_secret)) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: WebhookRequestBody = JSON.parse(bodyText);

    for (const event of body.events) {
      const userId = event.source.userId;
      const profile = await getUserProfile(userId, lineSettings.channel_access_token);

      const { data: existingUser } = await supabase
        .from('line_users')
        .select('*')
        .eq('line_user_id', userId)
        .maybeSingle();

      if (event.type === 'follow') {
        let isNewUser = false;
        if (!existingUser) {
          isNewUser = true;
          await supabase
            .from('line_users')
            .insert({
              line_user_id: userId,
              display_name: profile?.displayName || 'Unknown',
              reminder_enabled: true,
            });
        }

        const siteSettings = await getSiteSettings(supabase);
        const welcomeTemplate = await getMessageTemplate(supabase, 'welcome');
        const welcomeMessage = replacePlaceholders(welcomeTemplate || '友だち追加ありがとうございます！', {
          app_title: siteSettings?.app_title || '絵本で「未来を設定する」ノート',
        });

        const messages: any[] = [{
          type: 'text',
          text: welcomeMessage,
        }];

        // Add Flex Message boarding pass with LIFF URL
        if (lineSettings.liff_url) {
          messages.push(createBoardingPassFlexMessage(
            profile?.displayName || 'Commander',
            lineSettings.liff_url,
            48 // Expiration in 48 hours
          ));
        }

        await replyMessage(event.replyToken, messages, lineSettings.channel_access_token);
        await saveOutboundMessage(supabase, userId, welcomeMessage, 'system');
      } else if (event.type === 'message') {
        await saveInboundMessage(supabase, userId, event);

        if (event.message?.type !== 'text') {
          continue;
        }

        const messageText = event.message.text || '';

        if (!existingUser) {
          await supabase
            .from('line_users')
            .insert({
              line_user_id: userId,
              display_name: profile?.displayName || 'Unknown',
              reminder_enabled: true,
            });
        } else {
          await supabase
            .from('line_users')
            .update({
              display_name: profile?.displayName || existingUser.display_name,
              updated_at: new Date().toISOString(),
            })
            .eq('line_user_id', userId);
        }

        let replyText = '';
        const lowerText = messageText.toLowerCase();

        const currentUser = await supabase
          .from('line_users')
          .select('*')
          .eq('line_user_id', userId)
          .maybeSingle();

        if (lowerText === '管理者' || lowerText === 'admin') {
          await supabase
            .from('line_users')
            .update({ is_admin_mode: true })
            .eq('line_user_id', userId);
          replyText = `管理者モード起動\n\nパスワードを入力してください：`;
        } else if (currentUser?.data?.is_admin_mode && messageText === lineSettings.admin_password) {
          replyText = `管理者メニューにアクセス\n\n統計 - ユーザー統計を表示\n送信 - リマインダー手動送信\n状態 - システム状態確認\n\n【ホットリード通知】\n通知登録 - 自分を通知先に登録\nホットリード - 設定状況を確認\n通知オン/通知オフ - 機能切替\n閾値N - 閾値設定(1-10)\n\n解除 - 管理者モード終了`;
        } else if (currentUser?.data?.is_admin_mode && (lowerText === '解除' || lowerText === 'exit' || lowerText === '終了')) {
          await supabase
            .from('line_users')
            .update({ is_admin_mode: false })
            .eq('line_user_id', userId);
          replyText = '管理者モードを解除しました。通常モードに戻ります。';
        } else if (currentUser?.data?.is_admin_mode && (lowerText === '統計' || lowerText === 'stats')) {
          const { count: userCount } = await supabase
            .from('line_users')
            .select('*', { count: 'exact', head: true });

          const { data: users } = await supabase
            .from('line_users')
            .select('email, reminder_enabled');

          const { count: storyCount } = await supabase
            .from('user_stories')
            .select('*', { count: 'exact', head: true });

          const usersWithEmail = users?.filter(u => u.email).length || 0;
          const usersWithReminder = users?.filter(u => u.reminder_enabled).length || 0;

          replyText = `システム統計\n\n総ユーザー数: ${userCount || 0}\nメール登録済み: ${usersWithEmail}\nリマインダー有効: ${usersWithReminder}\n総ストーリー数: ${storyCount || 0}`;
        } else if (currentUser?.data?.is_admin_mode && (lowerText === '送信' || lowerText === 'send')) {
          replyText = 'リマインダー送信機能は開発中です';
        } else if (currentUser?.data?.is_admin_mode && (lowerText === '状態' || lowerText === 'status')) {
          replyText = `システム状態\n\nWebhook: 正常\nDatabase: 接続中\nLINE API: 正常`;
        } else if (currentUser?.data?.is_admin_mode && (lowerText === '通知登録' || lowerText === '登録通知')) {
          await supabase
            .from('line_settings')
            .update({ admin_line_user_id: userId })
            .eq('is_active', true);
          replyText = `ホットリード通知の送信先を登録しました！\n\nあなたのLINE ID: ${userId}\n\n高スコアの参加者を検知した際、この LINE に通知が届きます。`;
        } else if (currentUser?.data?.is_admin_mode && (lowerText === 'ホットリード' || lowerText === 'hotlead')) {
          const { data: settings } = await supabase
            .from('line_settings')
            .select('admin_line_user_id, hot_lead_enabled, hot_lead_threshold')
            .eq('is_active', true)
            .maybeSingle();
          const { count: hotLeadCount } = await supabase
            .from('hot_lead_logs')
            .select('*', { count: 'exact', head: true });
          const { count: notifiedCount } = await supabase
            .from('hot_lead_logs')
            .select('*', { count: 'exact', head: true })
            .not('notified_at', 'is', null);
          const isRegistered = settings?.admin_line_user_id === userId;
          replyText = `ホットリード通知設定\n\n状態: ${settings?.hot_lead_enabled ? 'オン' : 'オフ'}\n閾値: ${settings?.hot_lead_threshold || 7}/10以上\n通知先: ${isRegistered ? '登録済み (あなた)' : (settings?.admin_line_user_id ? '登録済み' : '未登録')}\n\n総分析数: ${hotLeadCount || 0}件\n通知済み: ${notifiedCount || 0}件`;
        } else if (currentUser?.data?.is_admin_mode && (lowerText === '通知オン' || lowerText === 'notify on')) {
          await supabase
            .from('line_settings')
            .update({ hot_lead_enabled: true })
            .eq('is_active', true);
          replyText = 'ホットリード通知をオンにしました。';
        } else if (currentUser?.data?.is_admin_mode && (lowerText === '通知オフ' || lowerText === 'notify off')) {
          await supabase
            .from('line_settings')
            .update({ hot_lead_enabled: false })
            .eq('is_active', true);
          replyText = 'ホットリード通知をオフにしました。';
        } else if (currentUser?.data?.is_admin_mode && lowerText.startsWith('閾値')) {
          const thresholdMatch = messageText.match(/閾値\s*(\d+)/);
          if (thresholdMatch) {
            const threshold = Math.min(10, Math.max(1, parseInt(thresholdMatch[1])));
            await supabase
              .from('line_settings')
              .update({ hot_lead_threshold: threshold })
              .eq('is_active', true);
            replyText = `ホットリード通知の閾値を ${threshold}/10 に設定しました。\n\nスコアが ${threshold} 以上の参加者を検知した際に通知されます。`;
          } else {
            replyText = '閾値の設定例: 「閾値７」';
          }
        } else if (lowerText.includes('リマインダー') || lowerText.includes('reminder')) {
          if (lowerText.includes('オン') || lowerText.includes('on') || lowerText.includes('有効')) {
            await supabase
              .from('line_users')
              .update({ reminder_enabled: true })
              .eq('line_user_id', userId);
            const template = await getMessageTemplate(supabase, 'reminder_on');
            replyText = template || 'リマインダーをオンにしました！';
          } else if (lowerText.includes('オフ') || lowerText.includes('off') || lowerText.includes('無効')) {
            await supabase
              .from('line_users')
              .update({ reminder_enabled: false })
              .eq('line_user_id', userId);
            const template = await getMessageTemplate(supabase, 'reminder_off');
            replyText = template || 'リマインダーをオフにしました。';
          } else {
            replyText = 'リマインダー設定\n\n「リマインダーオン」→有効化\n「リマインダーオフ」→無効化';
          }
        } else if (lowerText.includes('診断') || lowerText.includes('脳タイプ') || lowerText === 'type') {
          const brainTypeLabels: Record<string, string> = {
            left_3d: '左脳3次元（合理主義）',
            left_2d: '左脳2次元（原理主義）',
            right_3d: '右脳3次元（拡張主義）',
            right_2d: '右脳2次元（温情主義）',
          };
          if (currentUser?.data?.diagnosis_completed && currentUser?.data?.brain_type) {
            const typeName = brainTypeLabels[currentUser.data.brain_type] || currentUser.data.brain_type;
            replyText = `あなたの脳タイプ診断結果\n\n${typeName}\n\nアプリで自律神経チェックを行うと、脳タイプに合わせたパーソナライズされたアドバイスを受けられます。`;
            if (lineSettings.liff_url) {
              replyText += `\n\n▼アプリを開く\n${lineSettings.liff_url}`;
            }
          } else {
            replyText = '脳タイプ診断がまだ完了していません。\n\nアプリで診断を受けて、あなたに最適なアドバイスを受け取りましょう！';
            if (lineSettings.liff_url) {
              replyText += `\n\n▼診断を始める\n${lineSettings.liff_url}`;
            }
          }
        } else if (lowerText === 'help' || lowerText === 'ヘルプ') {
          // Simple help message without email registration
          const template = await getMessageTemplate(supabase, 'help');
          replyText = template || 'こんにちは！\n\n「診断」→ 脳タイプを確認\n「リマインダーオン/オフ」→ 通知設定';
          if (lineSettings.liff_url) {
            replyText += `\n\n▼アプリを開く\n${lineSettings.liff_url}`;
          }
        } else {
          // Default: show help message instead of asking for email
          const template = await getMessageTemplate(supabase, 'help');
          replyText = template || 'ご質問ありがとうございます！\n\n「ヘルプ」と送信するとコマンド一覧を確認できます。';
          if (lineSettings.liff_url) {
            replyText += `\n\n▼アプリを開く\n${lineSettings.liff_url}`;
          }
        }

        await replyMessage(event.replyToken, [{
          type: 'text',
          text: replyText,
        }], lineSettings.channel_access_token);

        await saveOutboundMessage(supabase, userId, replyText, 'system');
      }
    }

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
