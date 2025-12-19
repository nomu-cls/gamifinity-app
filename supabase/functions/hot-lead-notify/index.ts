import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  day: number;
  fields: Record<string, string>;
  email: string;
  userName?: string;
  lineUserId?: string;
}

interface LineSettings {
  channel_access_token: string;
  admin_line_user_id: string;
  hot_lead_enabled: boolean;
  hot_lead_threshold: number;
}

async function analyzeWithAI(day: number, fields: Record<string, string>, geminiApiKey: string): Promise<{ score: number; reason: string }> {
  const assignmentText = Object.entries(fields)
    .filter(([_, value]) => value && value.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const prompt = `あなたは営業コンサルタントです。以下は、ビジネス講座のDay${day}の課題回答です。

この回答内容から、参加者の「購買意欲・成約確率」を1-10のスコアで評価してください。

【評価基準】
- 具体的な目標金額や期限の記載 (+2)
- 現状への不満や危機感の表現 (+2)
- 講師への信頼や期待の言葉 (+1)
- 行動への意欲・決意表明 (+2)
- 投資や自己成長への前向きな姿勢 (+2)
- 質問や相談したい内容の記載 (+1)
- 曖昧・消極的な表現 (-1)
- 短すぎる回答・やる気のない回答 (-2)

【回答内容】
${assignmentText}

【出力形式】
必ず以下のJSON形式のみで回答してください。他の文章は不要です。
{"score": <1-10の数値>, "reason": "<100文字以内の分析理由>"}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 256,
        },
      }),
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(10, Math.max(1, parseInt(parsed.score) || 5)),
        reason: parsed.reason || '分析不能',
      };
    }
    return { score: 5, reason: '分析結果を取得できませんでした' };
  } catch (error) {
    console.error('AI analysis error:', error);
    return { score: 5, reason: 'AI分析エラー' };
  }
}

async function sendLineMessage(userId: string, message: string, accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: 'text', text: message }],
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('LINE send error:', error);
    return false;
  }
}

function replacePlaceholders(template: string, values: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
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

    const { day, fields, email, userName, lineUserId }: RequestBody = await req.json();

    const { data: lineSettings } = await supabase
      .from('line_settings')
      .select('channel_access_token, admin_line_user_id, hot_lead_enabled, hot_lead_threshold')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (!lineSettings?.hot_lead_enabled) {
      return new Response(
        JSON.stringify({ success: true, message: 'Hot lead notification disabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lineSettings.admin_line_user_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Admin LINE user ID not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Gemini API key not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analysis = await analyzeWithAI(day, fields, geminiApiKey);
    
    const assignmentSummary = Object.values(fields)
      .filter(v => v && v.trim())
      .join(' ')
      .slice(0, 200);

    await supabase.from('hot_lead_logs').insert({
      line_user_id: lineUserId || '',
      user_email: email,
      user_name: userName || email.split('@')[0],
      day_number: day,
      assignment_content: assignmentSummary,
      score: analysis.score,
      analysis_reason: analysis.reason,
      notified_at: analysis.score >= lineSettings.hot_lead_threshold ? new Date().toISOString() : null,
    });

    if (analysis.score >= lineSettings.hot_lead_threshold) {
      const { data: template } = await supabase
        .from('line_message_templates')
        .select('message_content')
        .eq('template_key', 'hot_lead_admin_notify')
        .eq('is_active', true)
        .maybeSingle();

      const messageTemplate = template?.message_content || `【ホットリード検知】\n\n{{user_name}}さん（{{user_email}}）\n\nスコア: {{score}}/10\n\n{{analysis_reason}}\n\n今すぐ個別メッセージを送ってください！`;

      const message = replacePlaceholders(messageTemplate, {
        user_name: userName || email.split('@')[0],
        user_email: email,
        day_number: String(day),
        score: String(analysis.score),
        analysis_reason: analysis.reason,
        assignment_summary: assignmentSummary.slice(0, 100) + (assignmentSummary.length > 100 ? '...' : ''),
      });

      await sendLineMessage(lineSettings.admin_line_user_id, message, lineSettings.channel_access_token);

      return new Response(
        JSON.stringify({ 
          success: true, 
          isHotLead: true,
          score: analysis.score,
          reason: analysis.reason,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        isHotLead: false,
        score: analysis.score,
        reason: analysis.reason,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});