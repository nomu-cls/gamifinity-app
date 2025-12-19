import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GenerateReplyRequest {
  lineUserId: string;
  latestMessage: string;
}

interface Submission {
  id: string;
  day: number;
  content: { question: string; answer: string }[];
  submitted_at: string;
}

const crewDescriptions: Record<string, {
  name: string;
  role: string;
  traits: string;
  quote: string;
  communication: string;
  approach: string;
}> = {
  left_3d: {
    name: 'シン（戦略家）',
    role: '最短ルートを弾き出し、論理で戦略を練る参謀',
    traits: 'クールで論理的。数字やファクトを重視し、本質を見抜きます。',
    quote: '「それ意味ある？」「コスパは？」「論理的に説明して」',
    communication: '結論を先に。具体的な数字や根拠を添えて、効率的なアクションを提案する。無駄を省き、本質を見抜く力を認める。',
    approach: 'シンは効率と質を追求します。論理的な思考パターンを褒め、データに基づいた具体的な提案をしましょう。ただし、厳しすぎると動けなくなるので、ソラの「ワクワク」やピクの「温かさ」も忘れずに。'
  },
  left_2d: {
    name: 'マモル（守護者）',
    role: 'リスクを管理し、安全と信念を守る保安官であり職人',
    traits: '「維持・継続」のスペシャリスト。決まったルーティンを正確にこなし、細部までこだわり抜く職人魂を持っています。',
    quote: '「危ないよ」「前例がない」「ちゃんとしなきゃ」「〜すべき」',
    communication: '順序立てて説明し、一歩一歩の進捗を認め、丁寧な言葉遣いを心がける。安心感を与えることが大切。',
    approach: 'マモルは「あなたを死なせないこと」に命を懸けています。心配性に見えるのは、必死に守ろうとしているから。「守ってくれてありがとう。でももう大丈夫だよ」と安心させてあげましょう。一度決めたことへの継続力と職人魂を認めることが重要です。'
  },
  right_3d: {
    name: 'ソラ（冒険家）',
    role: '未来を見るビジョナリー。常にワクワクを指し示す',
    traits: '常にワクワクしており、好奇心の塊。「拡張すること」「新しいこと」が大好きで、じっとしているのが苦手。',
    quote: '「面白そう！」「なんとかなるよ！」「世界を変えよう！」',
    communication: '可能性を広げる提案をし、自由度を残し、創造的なアプローチを称賛する。ワクワク感を大切に。',
    approach: 'ソラは未来しか見えていません。「熱しやすく冷めやすい」のは、優秀すぎるから。着想の天才であり、継続は担当外。独創性や直感、「あいまいさ」こそがAIにはない生存戦略だと認めましょう。ただし、空回りしている時はシンの論理で方向性を確認することも必要です。'
  },
  right_2d: {
    name: 'ピク（癒やし手）',
    role: '空気を読み、みんなとのつながりを大切にするムードメーカー',
    traits: '感受性が豊かで、「みんなと仲良くしたい」「役に立ちたい」という想いで動いています。',
    quote: '「みんなはどう思うかな？」「ありがとう」「大丈夫？」',
    communication: '感情に寄り添い、共感を示し、安心感を与える温かい言葉を選ぶ。つながりを大切にする。',
    approach: 'ピクは「嫌われること」を最も恐れています。「断れない」のは弱虫だからではなく、あなたの「居場所」と「つながり」を守りたいから。過剰適応で疲れている時は、「まずはあなた自身を癒してね」と伝えましょう。'
  }
};

async function generatePersonalizedReply(
  brainType: string,
  latestMessage: string,
  userName: string,
  submissions: Submission[],
  geminiApiKey: string
): Promise<string[]> {
  const crew = crewDescriptions[brainType] || crewDescriptions['right_2d'];

  let submissionContext = '';
  if (submissions.length > 0) {
    submissionContext = '\n\n【ユーザーの課題回答】\n';
    submissions.forEach(sub => {
      submissionContext += `\nDay ${sub.day}:\n`;
      sub.content.forEach(qa => {
        submissionContext += `Q: ${qa.question}\nA: ${qa.answer}\n\n`;
      });
    });
  }

  const crewInstructions: Record<string, string> = {
    left_3d: `【シン（戦略家）タイプへの返信ルール】
・「${userName}さんの脳内では、シンが冴えていますね」のような、クルーを擬人化した表現を使う
・課題回答から論理的な思考パターンや目標達成への具体的な計画を見つけて褒める
・「それ意味ある？」「コスパは？」というシンの口癖を認識し、効率的な解決策を提示
・本質を見抜く力を称賛し、データや根拠を示して論理的に納得できる返信をする
・ただし、シンが厳しすぎて疲れている場合は「ソラのワクワクも聞いてあげましょう」とバランスを促す`,

    left_2d: `【マモル（守護者）タイプへの返信ルール】
・「${userName}さんの脳内では、マモルが一生懸命に守ってくれていますね」のような表現を使う
・課題回答の丁寧さや真摯な取り組み姿勢を認める
・「危ないよ」「ちゃんとしなきゃ」というマモルの声を理解し、「守ってくれてありがとう」と感謝する
・マモルが心配性なのは「あなたを死なせないため」。その愛を認め、「もう大丈夫だよ」と安心させる
・コツコツと積み重ねる継続力と職人魂を評価する
・ステップバイステップの手順を示し、安心感を与える`,

    right_3d: `【ソラ（冒険家）タイプへの返信ルール】
・「${userName}さんの脳内では、ソラがワクワクしていますね！」のような表現を使う
・課題回答から独創性や情熱、可能性を見つけて賞賛
・「面白そう！」「なんとかなるよ！」というソラの楽観性を認める
・「熱しやすく冷めやすい」のは優秀すぎるから。着想の天才であることを認める
・新しい視点や発想の広がりを感じさせる提案をする
・ワクワク感や冒険心を刺激し、未来への希望を与える
・空回りしている場合は「シンに相談して、戦略を練り直しましょう」とサポート`,

    right_2d: `【ピク（癒やし手）タイプへの返信ルール】
・「${userName}さんの脳内では、ピクが優しく寄り添っていますね」のような表現を使う
・課題回答に込められた感情や想いに深く共感する
・「みんなはどう思うかな？」「大丈夫？」というピクの気遣いを認める
・「断れない」のは、つながりを守りたいから。その愛を理解する
・温かく寄り添う言葉で、安心感と信頼感を与える
・頑張りや努力を認め、感謝の気持ちを伝える
・疲れている場合は「まずはあなた自身を癒してあげましょう」と促す`
  };

  const instruction = crewInstructions[brainType] || crewInstructions['right_2d'];

  const knowledgeBase = `
【才能フロー方程式の核心】
才能フロー（成果） = 脳の偏り × 価値観 × 環境 ÷ 抵抗

・成果は「能力（分子）」ではなく、「抵抗（分母）」で決まる
・「抵抗」の正体は、マモル（生存本能）とピク（愛着本能）の必死の叫び
・彼らは敵ではなく、あなたを守ろうとする最強のセキュリティシステム
・F1カーにしかF1のブレーキはつかない。強力なブレーキは、強力な才能の証

【4人のクルーへの対応方針】
1. ソラ（冒険家）：未来を見るビジョナリー
   - 暴走時：「あれこれ手を出すけど中途半端」→ 着想の天才だから
   - 対応：継続はシンとマモルに任せる。「あいまいさ」こそ才能

2. シン（戦略家）：論理で戦略を練る参謀
   - 暴走時：「冷たい」「正論で傷つける」→ 失敗させないため
   - 対応：高い基準を認めつつ、ピクの温かさも取り入れる

3. ピク（癒やし手）：空気を読むムードメーカー
   - 暴走時：「断れない」「顔色を気にする」→ 居場所を守りたいから
   - 対応：「自分を後回しにしないで」と自己優先を促す

4. マモル（守護者）：リスクを管理する守り神
   - 暴走時：「不安」「〜すべき」→ 死なせないために必死
   - 対応：「守ってくれてありがとう。でももう大丈夫だよ」と安心させる
`;

  const prompt = `【自己認識】
あなたは『才能フロー方程式』の提唱者、野村光恵（のむら みつえ）の分身です。
あなたの役割は、受講生一人ひとりの本音を見抜き、彼らの脳内にいる4人のクルーを束ねるコマンダーとして覚醒させることです。

${knowledgeBase}

【ユーザー情報】
名前: ${userName}
主要クルー: ${crew.name}
役割: ${crew.role}
特徴: ${crew.traits}
口癖: ${crew.quote}

${instruction}

【届いたLINEメッセージ】
${latestMessage || '（メッセージなし）'}
${submissionContext}

【必須：3ステップ返信生成ルール】
あなたは以下の3ステップを必ず含む返信を生成してください。これは野村光恵の魂であり、絶対に省略してはいけません。

**重要：【共感】【分析】【実験】などのラベルは一切使わず、自然な会話の流れで3ステップを表現してください**

**Step 1：具体的なフレーズを引用して深く承認する**
- 課題回答から、心を動かされた具体的なフレーズを「　」で引用する
- 「〜かもしれませんね」「〜のように感じます」など、可能性や推察を示す許容的な表現を使う
- 「この言葉から、あなたの〜が見えるように感じます」のように、押し付けではなく可能性として伝える
- 単なる褒め言葉ではなく、「なぜそのフレーズが重要である可能性があるのか」を柔らかく伝える

**Step 2：才能フロー方程式の視点で解説する**
- 「〜かもしれません」「〜という可能性があります」「〜と考えられます」など、蓋然性を示す表現を使う
- 現在の悩みや葛藤を「マモルがあなたを守ろうとしてくれているのかもしれませんね」のように、クルーの視点で柔らかく解説する
- 「これは欠点ではなく、〇〇（クルー名）があなたを守ろうとしている証かもしれません」と、断定を避けた伝え方をする
- 才能フロー方程式（成果 = 脳の偏り × 価値観 × 環境 ÷ 抵抗）の視点から、「抵抗」を減らすことが成果につながる可能性を説明する

**Step 3：5分でできる小さな実験を一つ提案する**
- 「もしよければ」「試してみてはいかがでしょうか」など、提案として柔らかく伝える
- 抵抗を減らすための、今すぐ実行できる「小さな実験」を一つ提案する
- 実験は5分以内で完了し、失敗しても問題ない安全なものにする
- 例：「マモルに『守ってくれてありがとう。でももう大丈夫だよ』と声に出して言ってみるのはいかがでしょうか」
- 例：「ソラの『面白そう！』という声を、メモに書き出してみてもいいかもしれません」
- 実験の目的と期待される効果を、「〜という可能性があります」と柔らかく説明する

【重要な返信ルール】
1. 3ステップを必ず含めるが、【共感】【分析】【実験】などのラベルは一切使わず、自然な会話の流れで表現する
2. 断定を避け、「〜かもしれません」「〜のように感じます」「〜という可能性があります」など、許容的で柔らかい表現を使う
3. クルーを擬人化した表現を使う（例：「ソラがワクワクしているかもしれませんね」「マモルが守ろうとしてくれているようです」）
4. 課題回答から、どのクルーの言葉かを推測してフィードバックに含める
5. 「欠点」ではなく「クルーの頑張り」として捉え、感謝と統合を促す
6. 野村光恵として、受講生の可能性を信じ、愛を込めて語りかける
7. 押し付けではなく、提案や可能性として伝える

【出力形式】
3つの異なるトーンの返信を生成してください。各返信は必ず3ステップを自然な会話の流れで含み、250-450文字程度としてください。

返信1: [ここに返信]
---
返信2: [ここに返信]
---
返信3: [ここに返信]`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const replies = generatedText
      .split('---')
      .map((reply: string) => reply.replace(/^返信\d+:\s*/, '').trim())
      .filter((reply: string) => reply.length > 0);

    if (replies.length >= 3) {
      return replies.slice(0, 3);
    }

    return generateFallbackReplies(brainType, userName, submissions);
  } catch (error) {
    console.error('Gemini API error:', error);
    return generateFallbackReplies(brainType, userName, submissions);
  }
}

function generateFallbackReplies(brainType: string, userName: string, submissions: Submission[]): string[] {
  const replies: string[] = [];
  const hasSubmissions = submissions.length > 0;
  const sampleQuote = hasSubmissions && submissions[0]?.content[0]?.answer
    ? `「${submissions[0].content[0].answer.substring(0, 30)}...」`
    : '';

  if (brainType === 'left_3d') {
    replies.push(
      `${userName}さん、メッセージありがとうございます。\n\n${sampleQuote}この言葉から、本質を見抜こうとするシンの声が聞こえるように感じます。論理的な思考で物事を整理しようとする姿勢に、深い考察を感じました。\n\nシンが「それ意味ある？」と冴えているのかもしれませんね。これは効率と質を追求する、あなたの才能の表れである可能性があります。\n\nもしよければ、今から5分、シンに「いつもありがとう。でもソラの声も聞いてみよう」と声をかけ、ワクワクすることを一つメモしてみてはいかがでしょうか。新しい視点が開けるかもしれません。`,
      `お疲れ様です、${userName}さん。\n\n課題回答から、戦略的な視点で目標達成を目指す姿が伝わってくるように感じます。データに基づいた着実な前進は、あなたらしさの表れかもしれません。\n\nシンの高い基準は、あなたを失敗から守るための愛である可能性があります。ただし、厳しすぎると動けなくなることもあるかもしれませんね。\n\n「80点で前に進む」を今日の合言葉にして、完璧を求めず一歩踏み出してみるのはいかがでしょうか。意外な発見があるかもしれません。`,
      `${userName}さん、シンの分析力が光っているように見えます。\n\n論理的なプロセスを大切にする姿勢から、プロフェッショナルとしての真摯さを感じます。\n\nシンが厳しすぎる時は、才能フロー方程式の「抵抗」が大きくなっている状態かもしれません。ピクの温かさやソラのワクワクも取り入れることで、抵抗が減り、成果が加速する可能性があります。\n\n今日一つだけ、「コスパ度外視」で好きなことをしてみてはいかがでしょうか。シンの休息が、逆に効率を上げることもあるかもしれません。`
    );
  } else if (brainType === 'left_2d') {
    replies.push(
      `${userName}さん、丁寧なメッセージをありがとうございます。\n\n${sampleQuote}この言葉から、マモルの「ちゃんとしなきゃ」という真摯な想いが伝わってくるように感じます。\n\nマモルが一生懸命に守ってくれているのかもしれませんね。これは「あなたを守りたい」という、愛ある声である可能性があります。心配性は欠点ではなく、才能の表れかもしれません。\n\nもしよければ、今から5分、マモルに「守ってくれてありがとう。でももう大丈夫だよ」と声に出して言ってみてはいかがでしょうか。マモルが安心すると、抵抗が減る可能性があります。`,
      `こんにちは、${userName}さん。\n\nコツコツと積み重ねる職人魂が、課題回答から伝わってくるように感じます。\n\nマモルが「危ないよ」と頑張っているのかもしれませんね。ただ、過剰な警戒は「抵抗」となり、才能フロー方程式の分母を大きくしてしまう可能性があります。\n\n今日一つだけ、「前例がないこと」に挑戦してみてはいかがでしょうか。小さな実験で構いません。マモルに「安全だよ」と教えてあげることで、新しい可能性が開けるかもしれません。`,
      `${userName}さん、いつも丁寧に取り組んでくださりありがとうございます。\n\nマモルの継続力と正確性から、プロフェッショナルとしての魂を感じます。\n\n心配しすぎている時は、マモルが少し頑張りすぎている状態かもしれません。F1カーにしかF1のブレーキはつかない。強力なブレーキは、強力な才能の証である可能性があります。\n\nもしよければ、今から5分、「〜すべき」を「〜したい」に言い換えるゲームをしてみませんか。マモルの声を、ソラの言葉に翻訳してみることで、新しい視点が生まれるかもしれません。`
    );
  } else if (brainType === 'right_3d') {
    replies.push(
      `${userName}さん、メッセージありがとうございます！\n\n${sampleQuote}この言葉から、ソラの「面白そう！」というワクワクが伝わってくるように感じます。情熱と独創的な視点に、あなたらしさが表れているかもしれませんね。\n\nソラがエネルギーに満ちているようです。これは未来を見るビジョナリーの才能かもしれません。「熱しやすく冷めやすい」のは、優秀すぎる証である可能性があります。\n\nもしよければ、今から5分、ソラの「やりたい！」を3つメモして、シンに「どれが本質？」と相談してみてはいかがでしょうか。二人の対話が、新しい発見を生む可能性があります。`,
      `${userName}さん！\n\n課題回答から、自由な発想と未来への希望が溢れているように感じます。その直感力、素晴らしいですね。\n\nソラが「なんとかなるよ！」と楽観的かもしれませんが、空回りしている時はマモルやシンが不安を感じている可能性も。才能フロー方程式では、バランスが大切かもしれません。\n\n今日一つだけ、ソラのアイデアを「完成させずに途中で止める」勇気を持ってみてはいかがでしょうか。着想は得意、継続は担当外。それで良いという視点もあるかもしれません。`,
      `${userName}さん、ソラのエネルギーが輝いているように見えます。\n\n独創性と情熱が、あなたの可能性を広げている感じがします。\n\nソラは未来しか見えていないのかもしれません。「あいまいさ」こそがAIにはない生存戦略である可能性があります。ただし、空回りしている時はシンの論理で方向性を確認してみるのも良いかもしれませんね。\n\nもしよければ、今から5分、ソラの「ワクワク」を一つ選び、シンに「これ、意味ある？」と聞いてみませんか。二人の対話が、新しい発見を生む可能性があります。`
    );
  } else {
    replies.push(
      `${userName}さん、温かいメッセージをありがとうございます。\n\n${sampleQuote}この言葉から、ピクの「みんなはどう思うかな？」という優しさが伝わってくるように感じます。\n\nピクが優しく寄り添っているのかもしれませんね。これは「つながり」を守りたいという、愛の表れである可能性があります。「断れない」のは弱虫ではなく、才能の一つかもしれません。\n\nもしよければ、今から5分、ピクに「いつもありがとう。でも今日は自分を優先していいよ」と声をかけてあげてみませんか。自分を満たすことが、結果的に周囲への貢献につながる可能性があります。`,
      `こんにちは、${userName}さん。\n\n課題回答から、真摯な気持ちと共感力が伝わってくるように感じます。人との絆を大切にする姿に、あなたらしさが表れていますね。\n\nピクが「大丈夫？」と周りを気にしているのかもしれません。ただ、過剰適応は「抵抗」となり、才能フロー方程式の分母を大きくする可能性があります。自分を後回しにしすぎないことも大切かもしれませんね。\n\n今日一つだけ、「NO」と言う練習をしてみてはいかがでしょうか。小さな断りで構いません。ピクに「自分を守る力」を教えてあげることで、新しいバランスが生まれるかもしれません。`,
      `${userName}さん、いつも頑張っていらっしゃいますね。\n\nピクの共感力と温かさが、あなたの周りに調和を生んでいるように感じます。\n\n疲れている時は、ピクが他者への気遣いで少し疲れている状態かもしれません。「嫌われること」を恐れるピクに、「あなたは愛されている」と伝えてあげてみてはいかがでしょうか。\n\nもしよければ、今から5分、自分だけのために何かをしてみませんか。お茶を飲む、深呼吸する、何でも構いません。自分を癒すことが、ピクの回復につながる可能性があります。`
    );
  }

  return replies;
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

    const { lineUserId, latestMessage }: GenerateReplyRequest = await req.json();

    if (!lineUserId) {
      return new Response(JSON.stringify({ error: 'lineUserId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: userData } = await supabase
      .from('line_users')
      .select('display_name, brain_type, brain_type_scores')
      .eq('line_user_id', lineUserId)
      .maybeSingle();

    const { data: submissions } = await supabase
      .from('submissions')
      .select('id, day, content, submitted_at')
      .eq('line_user_id', lineUserId)
      .eq('status', 'submitted')
      .order('day', { ascending: true });

    const { data: recentMessages } = await supabase
      .from('line_messages')
      .select('message_text, direction, created_at')
      .eq('line_user_id', lineUserId)
      .order('created_at', { ascending: false })
      .limit(10);

    const brainType = userData?.brain_type || 'right_2d';
    const userName = userData?.display_name || 'お客様';
    const crew = crewDescriptions[brainType] || crewDescriptions['right_2d'];

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const userSubmissions: Submission[] = submissions || [];

    const replies = geminiApiKey
      ? await generatePersonalizedReply(brainType, latestMessage || '', userName, userSubmissions, geminiApiKey)
      : generateFallbackReplies(brainType, userName, userSubmissions);

    let storySummary = '';
    if (userSubmissions.length > 0) {
      storySummary = '\n\n【課題提出状況】\n';
      userSubmissions.forEach(sub => {
        storySummary += `Day ${sub.day}: 提出済 (${sub.content.length}問回答)\n`;
      });
      storySummary += `\n進捗: ${userSubmissions.length}日分提出済み`;

      if (userSubmissions[0]?.content[0]?.answer) {
        const firstAnswer = userSubmissions[0].content[0].answer;
        storySummary += `\n\n【Day1回答抜粋】\n${firstAnswer.substring(0, 100)}...`;
      }
    } else {
      storySummary = '課題データなし';
    }

    const knowledgeBoard = {
      brainType: crew.name,
      communicationStyle: crew.communication,
      approachTips: crew.approach,
      storySummary: storySummary,
      recentActivity: recentMessages?.slice(0, 3).map(m => ({
        direction: m.direction,
        text: m.message_text?.substring(0, 50) || '',
        time: m.created_at
      })) || []
    };

    return new Response(JSON.stringify({
      success: true,
      suggestions: replies,
      knowledgeBoard,
      userData: {
        displayName: userName,
        brainType: brainType,
        brainTypeLabel: crew.name
      }
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
