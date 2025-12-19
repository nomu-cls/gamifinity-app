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

async function triggerHotLeadAnalysis(supabaseUrl: string, data: RequestBody) {
  try {
    await fetch(`${supabaseUrl}/functions/v1/hot-lead-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Hot lead analysis trigger failed:', error);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { day, fields, email, userName, lineUserId }: RequestBody = await req.json();

    const dayTitles: Record<number, string> = {
      1: '記憶の森',
      2: '才能の泉',
      3: '未来の扉'
    };

    const dayTitle = dayTitles[day] || 'あなたの物語';

    let aiMessage = '';

    if (day === 1) {
      aiMessage = `✨ ${dayTitle}への旅、お疲れ様でした。\n\nあなたの子供の頃の輝きが、今も心の中で優しく光り続けているのが伝わってきます。過去の記憶は、未来への道しるべ。大切に育んできた「好き」という感情が、これからのあなたを導いてくれるでしょう。\n\n次のステージ「才能の泉」で、さらに深い発見が待っています。`;
    } else if (day === 2) {
      aiMessage = `🌟 ${dayTitle}での気づき、素晴らしいです。\n\nあなたが自然にできてしまうこと、それは神様からの贈り物。頑張らずにできることこそ、本当のあなたの才能です。自分を褒めることは、自分を愛すること。あなたの「好き」と「得意」が重なる場所に、あなたらしい幸せが待っています。\n\n最後の扉「未来の扉」で、夢を形にしていきましょう。`;
    } else if (day === 3) {
      aiMessage = `🎊 ${dayTitle}を開けましたね。おめでとうございます！\n\n3日間の旅を完走されたあなたは、もう新しい未来を歩み始めています。描いた夢は、すでに現実への第一歩を踏み出しました。絵本の世界が教えてくれたように、右脳で感じ、心で描いた未来は必ず叶います。\n\nあなたの物語は、ここから本当の意味で始まります。輝かしい2026年を一緒に創造していきましょう！`;
    }

    const firstFieldValue = fields.field1 || '';
    if (firstFieldValue.length > 20) {
      aiMessage += '\n\n深い洞察と丁寧な言葉で綾られたあなたの想い、心から受け取りました。';
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (supabaseUrl) {
      triggerHotLeadAnalysis(supabaseUrl, { day, fields, email, userName, lineUserId });
    }

    return new Response(
      JSON.stringify({ message: aiMessage }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});