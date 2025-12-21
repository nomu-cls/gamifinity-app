const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const crewProfiles: Record<string, {
    name: string;
    personality: string;
    speechPattern: string;
    fears: string;
    samplePhrases: string[];
}> = {
    sora: {
        name: 'ソラ（冒険家）',
        personality: '常にワクワクしており、好奇心の塊。新しいことが大好きで、じっとしているのが苦手。',
        speechPattern: '楽観的で勢いがある。「！」を多用。未来志向の言葉を使う。',
        fears: 'つまらないこと、制限されること、同じことの繰り返し',
        samplePhrases: [
            '「もっとワクワクすることをしろよ！」',
            '「つまらない選択するな！」',
            '「安全策ばかり取ってたら人生面白くないぞ！」',
            '「面白そうじゃん！やってみようよ！」'
        ]
    },
    mamoru: {
        name: 'マモル（守護者）',
        personality: 'リスクを管理し、安全と信念を守る保安官。「維持・継続」のスペシャリスト。',
        speechPattern: '慎重で警告的。「危ない」「ちゃんと」「〜すべき」などを使う。',
        fears: '失敗、リスク、変化、前例のないこと',
        samplePhrases: [
            '「危険だから止めておけ！」',
            '「今のままで十分だろ？」',
            '「失敗したらどうするんだ！」',
            '「もっとちゃんと考えてからにしろよ」'
        ]
    },
    shin: {
        name: 'シン（戦略家）',
        personality: 'クールで論理的。数字やファクトを重視し、本質を見抜く参謀。',
        speechPattern: '冷静で分析的。「意味ある？」「効率」「論理的に」などを使う。',
        fears: '非効率、感情的な判断、無駄なこと',
        samplePhrases: [
            '「それは非効率だ！」',
            '「もっと論理的に考えろ！」',
            '「感情で判断するな！」',
            '「コスパを考えてみろよ」'
        ]
    },
    piku: {
        name: 'ピク（癒やし手）',
        personality: '感受性が豊かで、「みんなと仲良くしたい」「役に立ちたい」という想いで動く。',
        speechPattern: '優しく気遣いがある。「みんな」「大丈夫？」「一緒に」などを使う。',
        fears: '嫌われること、孤立、争い、他者を傷つけること',
        samplePhrases: [
            '「みんなの気持ちを考えて！」',
            '「誰かを傷つけたらどうするの？」',
            '「争いは避けよう！」',
            '「周りの人はどう思うかな？」'
        ]
    }
};

async function generateCrewVoice(
    crewId: string,
    userResistance: string,
    geminiApiKey: string
): Promise<string> {
    const crew = crewProfiles[crewId];
    if (!crew) {
        return crewProfiles.mamoru.samplePhrases[0]; // Fallback
    }

    // If no user input, return sample phrase
    if (!userResistance || userResistance.trim().length < 5) {
        return crew.samplePhrases[Math.floor(Math.random() * crew.samplePhrases.length)];
    }

    const prompt = `あなたは脳内キャラクター「${crew.name}」です。

【キャラクター設定】
- 性格: ${crew.personality}
- 話し方: ${crew.speechPattern}
- 恐れていること: ${crew.fears}

【ユーザーの抵抗・悩み】
「${userResistance}」

【指示】
上記のユーザーの抵抗に対して、${crew.name}としてリアクションしてください。
- ${crew.name}の性格と話し方で、1-2文の短いセリフを生成
- 「」で囲んだセリフ形式で出力
- ユーザーの具体的な内容に言及する
- ${crew.name}らしい視点でコメント

【出力例】
${crew.samplePhrases.slice(0, 2).join('\n')}

【出力】
`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.9,
                        maxOutputTokens: 150,
                    }
                })
            }
        );

        if (!response.ok) {
            console.error('Gemini API error:', response.status);
            return crew.samplePhrases[0];
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Clean up the response
        const cleaned = generatedText.trim();
        if (cleaned.length > 0) {
            return cleaned;
        }

        return crew.samplePhrases[0];
    } catch (error) {
        console.error('Gemini API error:', error);
        return crew.samplePhrases[0];
    }
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { crewId, userResistance } = await req.json();

        if (!crewId) {
            return new Response(
                JSON.stringify({ error: 'crewId is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
        if (!geminiApiKey) {
            // Fallback to static phrases if no API key
            const crew = crewProfiles[crewId] || crewProfiles.mamoru;
            return new Response(
                JSON.stringify({
                    success: true,
                    crewVoice: crew.samplePhrases[Math.floor(Math.random() * crew.samplePhrases.length)],
                    crewName: crew.name,
                    isGenerated: false
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const crewVoice = await generateCrewVoice(crewId, userResistance || '', geminiApiKey);
        const crew = crewProfiles[crewId] || crewProfiles.mamoru;

        return new Response(
            JSON.stringify({
                success: true,
                crewVoice,
                crewName: crew.name,
                isGenerated: true
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
