import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BRAIN_TYPE_KNOWLEDGE = `
【脳優位タイプ論】
個人の個性は「脳の使い方のクセ」で決まる。以下の4タイプに分類される：

1. 左脳3次元（合理主義 / left_3d）
   - 特徴: 論理的、本質重視、効率的、目標達成、進歩を重んじる
   - キーワード: 本質、効率、統計的、なぜ？
   - 行動傾向: データや根拠に基づいて判断、無駄を嫌う、改善志向

2. 左脳2次元（原理主義 / left_2d）
   - 特徴: 緻密、規則・ルール重視、信念、勤勉、前例重視
   - キーワード: 確認、前例、規則、結論から
   - 行動傾向: マニュアルや手順を重視、計画的、正確性を求める

3. 右脳3次元（拡張主義 / right_3d）
   - 特徴: 行動的、情熱、独創的、人を巻き込む、量を拡大する
   - キーワード: すごい！、絶対！、とりあえず、世界初
   - 行動傾向: 直感で動く、新しいことに挑戦、影響力を持ちたい

4. 右脳2次元（温情主義 / right_2d）
   - 特徴: 人間関係重視、平和、感謝、共感、サポート
   - キーワード: ありがとう、素晴らしい、大変だったね、一緒に
   - 行動傾向: 人の気持ちを優先、調和を重んじる、協力的
`;

interface QuestionOption {
  option_id: string;
  option_text: string;
  brain_type: string;
  score: number;
}

interface Question {
  question_id: string;
  question_text: string;
  options: QuestionOption[];
}

interface GenerateRequest {
  theme: string;
  question_count?: number;
  provider?: 'gemini' | 'openai' | 'anthropic';
}

interface GenerateResult {
  title: string;
  description: string;
  questions: Question[];
}

async function generateWithGemini(theme: string, questionCount: number, apiKey: string): Promise<GenerateResult> {
  const prompt = `${BRAIN_TYPE_KNOWLEDGE}

上記の脳優位タイプ論に基づいて、「${theme}」というテーマで${questionCount}問の診断質問を作成してください。

【重要な要件】
- 各質問には必ず4つの選択肢を用意する
- 各選択肢は4つの脳タイプ（left_3d, left_2d, right_3d, right_2d）のいずれかに対応
- 選択肢は自然な文章で、どのタイプか推測しにくいように書く
- 質問は日常的な場面や具体的なシチュエーションに基づく
- 診断タイトルは魅力的でキャッチーなものにする
- 説明文は診断の内容を簡潔に説明する

【出力形式】
必ず以下のJSON形式で出力してください。他のテキストは含めないでください：
{
  "title": "診断タイトル",
  "description": "この診断の説明文",
  "questions": [
    {
      "question_id": "q1",
      "question_text": "質問文",
      "options": [
        {"option_id": "q1_a", "option_text": "選択肢A", "brain_type": "left_3d", "score": 1},
        {"option_id": "q1_b", "option_text": "選択肢B", "brain_type": "left_2d", "score": 1},
        {"option_id": "q1_c", "option_text": "選択肢C", "brain_type": "right_3d", "score": 1},
        {"option_id": "q1_d", "option_text": "選択肢D", "brain_type": "right_2d", "score": 1}
      ]
    }
  ]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error response:', errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  const jsonMatch = text.match(/\{[\s\S]*"questions"[\s\S]*\}/);
  if (!jsonMatch) {
    const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      return {
        title: `${theme}診断`,
        description: `あなたの${theme}に関する脳タイプを診断します`,
        questions: JSON.parse(arrayMatch[0])
      };
    }
    throw new Error('Failed to parse Gemini response as JSON');
  }
  
  return JSON.parse(jsonMatch[0]);
}

async function generateWithOpenAI(theme: string, questionCount: number, apiKey: string): Promise<GenerateResult> {
  const prompt = `${BRAIN_TYPE_KNOWLEDGE}

上記の脳優位タイプ論に基づいて、「${theme}」というテーマで${questionCount}問の診断質問を作成してください。

【重要な要件】
- 各質問には必ず4つの選択肢を用意する
- 各選択肢は4つの脳タイプ（left_3d, left_2d, right_3d, right_2d）のいずれかに対応
- 選択肢は自然な文章で、どのタイプか推測しにくいように書く
- 質問は日常的な場面や具体的なシチュエーションに基づく
- 診断タイトルは魅力的でキャッチーなものにする
- 説明文は診断の内容を簡潔に説明する

【出力形式】
必ず以下のJSON形式で出力してください：
{
  "title": "診断タイトル",
  "description": "この診断の説明文",
  "questions": [
    {
      "question_id": "q1",
      "question_text": "質問文",
      "options": [
        {"option_id": "q1_a", "option_text": "選択肢A", "brain_type": "left_3d", "score": 1},
        {"option_id": "q1_b", "option_text": "選択肢B", "brain_type": "left_2d", "score": 1},
        {"option_id": "q1_c", "option_text": "選択肢C", "brain_type": "right_3d", "score": 1},
        {"option_id": "q1_d", "option_text": "選択肢D", "brain_type": "right_2d", "score": 1}
      ]
    }
  ]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const parsed = JSON.parse(content);
  
  if (parsed.questions && parsed.title) {
    return parsed;
  }
  
  return {
    title: `${theme}診断`,
    description: `あなたの${theme}に関する脳タイプを診断します`,
    questions: parsed.questions || parsed
  };
}

async function generateWithAnthropic(theme: string, questionCount: number, apiKey: string): Promise<GenerateResult> {
  const prompt = `${BRAIN_TYPE_KNOWLEDGE}

上記の脳優位タイプ論に基づいて、「${theme}」というテーマで${questionCount}問の診断質問を作成してください。

【重要な要件】
- 各質問には必ず4つの選択肢を用意する
- 各選択肢は4つの脳タイプ（left_3d, left_2d, right_3d, right_2d）のいずれかに対応
- 選択肢は自然な文章で、どのタイプか推測しにくいように書く
- 質問は日常的な場面や具体的なシチュエーションに基づく
- 診断タイトルは魅力的でキャッチーなものにする
- 説明文は診断の内容を簡潔に説明する

【出力形式】
必ず以下のJSON形式のみで出力してください。他のテキストは含めないでください：
{
  "title": "診断タイトル",
  "description": "この診断の説明文",
  "questions": [
    {
      "question_id": "q1",
      "question_text": "質問文",
      "options": [
        {"option_id": "q1_a", "option_text": "選択肢A", "brain_type": "left_3d", "score": 1},
        {"option_id": "q1_b", "option_text": "選択肢B", "brain_type": "left_2d", "score": 1},
        {"option_id": "q1_c", "option_text": "選択肢C", "brain_type": "right_3d", "score": 1},
        {"option_id": "q1_d", "option_text": "選択肢D", "brain_type": "right_2d", "score": 1}
      ]
    }
  ]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  
  const jsonMatch = text.match(/\{[\s\S]*"questions"[\s\S]*\}/);
  if (!jsonMatch) {
    const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      return {
        title: `${theme}診断`,
        description: `あなたの${theme}に関する脳タイプを診断します`,
        questions: JSON.parse(arrayMatch[0])
      };
    }
    throw new Error('Failed to parse Anthropic response as JSON');
  }
  
  return JSON.parse(jsonMatch[0]);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { theme, question_count = 7, provider = 'gemini' }: GenerateRequest = await req.json();

    if (!theme) {
      return new Response(
        JSON.stringify({ error: 'テーマを入力してください' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: aiSettings, error: settingsError } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('provider', provider)
      .eq('is_active', true)
      .maybeSingle();

    if (settingsError || !aiSettings) {
      return new Response(
        JSON.stringify({ error: `${provider}のAPI設定が見つかりません。管理画面でAPIキーを設定してください。` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = aiSettings.api_key_encrypted;
    let result: GenerateResult;

    switch (provider) {
      case 'openai':
        result = await generateWithOpenAI(theme, question_count, apiKey);
        break;
      case 'anthropic':
        result = await generateWithAnthropic(theme, question_count, apiKey);
        break;
      case 'gemini':
      default:
        result = await generateWithGemini(theme, question_count, apiKey);
        break;
    }

    return new Response(
      JSON.stringify({
        success: true,
        theme,
        title: result.title,
        description: result.description,
        question_count: result.questions.length,
        questions: result.questions,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating questions:', error);
    return new Response(
      JSON.stringify({ error: error.message || '質問の生成に失敗しました' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});