/**
 * 21日間デイリーメッセージコンテンツ
 * 才能フロー方程式: Flow = Potential(分子) / Resistance(分母)
 */

// ===== 名言アーカイブ =====
export const quoteArchive = {
    // 分子（Potential / Divinity）を呼び覚ます言葉
    potential: [
        {
            author: 'エマソン',
            quote: '私たちの背後にあるもの、私たちの前にあるもの。それは、私たちの内側にあるものに比べれば、些細なことだ。',
            phase: 1,
        },
        {
            author: 'ユング',
            quote: '無意識を意識化しない限り、それは運命としてあなたの人生を支配し、あなたはそれを「運命」と呼ぶことになる。',
            phase: 2,
        },
        {
            author: 'ゲーテ',
            quote: '自分自身を信じた瞬間に、どう生きればいいかがわかる。',
            phase: 3,
        },
    ],
    // 分母（Resistance / Ego）と和解する言葉
    resistance: [
        {
            author: 'フランクル',
            quote: '刺激と反応の間にはスペースがある。そのスペースの中に、私たちの自由と成長が横たわっている。',
            phase: 1,
        },
        {
            author: 'キーガン',
            quote: 'あなたは壊れているのではない。ただ、今の器では抱いきれないほど、魂が成長しようとしているだけだ。',
            phase: 2,
        },
        {
            author: 'リルケ',
            quote: '解決しようとするのではなく、心の中にある「問い」そのものを愛しなさい。いつか答えの中に生きている自分に気づくだろう。',
            phase: 2,
        },
    ],
    // 点火（Ignition）と航海（Drive）を促す言葉
    ignition: [
        {
            author: 'サン＝テグジュペリ',
            quote: '未来とは、予測するものではない。それを可能にすることだ。',
            phase: 3,
        },
        {
            author: 'キャンベル',
            quote: 'あなたが恐れて足を踏み入れないその洞窟の中にこそ、あなたが探し求めている宝がある。',
            phase: 3,
        },
        {
            author: 'Taka',
            quote: "Broken's beautiful —— 壊れていることは、美しい。",
            phase: 3,
        },
    ],
};

// ===== フェーズ定義 =====
export const phases = {
    1: {
        name: 'Hangar（格納庫）での和解',
        days: [1, 2, 3, 4, 5, 6, 7],
        theme: '安心感（Safe and Sound）と、今の自分の全肯定',
        milestone: 'ひび割れの美学（通信ログ解析）',
    },
    2: {
        name: 'Sensation（感覚）の覚醒',
        days: [8, 9, 10, 11, 12, 13, 14],
        theme: 'Trinity Code（三位一体）による感覚の拡張',
        milestone: '三位一体の音（Trinity Audio）',
    },
    3: {
        name: 'Ignition（点火）と拡張',
        days: [15, 16, 17, 18, 19, 20, 21],
        theme: 'ヒーローズ・ドライブ（英雄の旅）への出発',
        milestone: '最終航路図（ヒーローズ・ドライブマップ）',
    },
};

// ===== 21日分のデイリーメッセージ =====
export const dailyMessages: Record<number, {
    quote: { author: string; text: string };
    theme: string;
    affirmation: string;
}> = {
    // ===== フェーズ1: Hangar（1-7日目）=====
    1: {
        quote: { author: 'エマソン', text: '私たちの内側にあるものこそが、最も大きな力を持っている。' },
        theme: '今日は、ただ「ここにいる」ことを許可する日。何も変わらなくていい。',
        affirmation: '私は私のために、今日この一歩をドライブする。',
    },
    2: {
        quote: { author: 'フランクル', text: '刺激と反応の間にはスペースがある。' },
        theme: '反応する前に、一呼吸おく練習。そのスペースが軌道を広げる。',
        affirmation: '私は反応ではなく、選択で進む。',
    },
    3: {
        quote: { author: 'リルケ', text: '「問い」そのものを愛しなさい。' },
        theme: '答えを急がない。今日は問いと共にいることを楽しむ。',
        affirmation: '私は答えを待つ勇気を持っている。',
    },
    4: {
        quote: { author: 'エマソン', text: '私たちの前にあるものは、内側にあるものに比べれば些細なことだ。' },
        theme: '外の世界の雑音を一度忘れ、内なる声に耳を傾ける。',
        affirmation: '私の内側には、必要な全てがある。',
    },
    5: {
        quote: { author: 'フランクル', text: 'そのスペースの中に、私たちの自由と成長が横たわっている。' },
        theme: '今日は「自由」とは何かを感じる日。縛っているものは何だろう？',
        affirmation: '私は自由に向かって進んでいる。',
    },
    6: {
        quote: { author: 'リルケ', text: 'いつか答えの中に生きている自分に気づくだろう。' },
        theme: '明日のマイルストーンに向けて、今日はゆっくり準備する。',
        affirmation: '私は成長のプロセスを信頼している。',
    },
    7: {
        quote: { author: 'キーガン', text: '今の器では抱いきれないほど、魂が成長しようとしている。' },
        theme: '🌟 7日目マイルストーン：「ひび割れの美学」ワーク実施日。',
        affirmation: '私のひび割れは、光が差し込む入り口だ。',
    },

    // ===== フェーズ2: Sensation（8-14日目）=====
    8: {
        quote: { author: 'ユング', text: '無意識を意識化しない限り、それは運命としてあなたの人生を支配する。' },
        theme: '今日から感覚の海へ潜る。頭ではなく、体で感じる練習。',
        affirmation: '私は感覚を信頼する。',
    },
    9: {
        quote: { author: 'キーガン', text: '悩みは「故障」ではなく、成長の最前線（エッジ）だ。' },
        theme: '不快な感覚も、軌道拡張のサイン。観察してみる。',
        affirmation: '私は不快さの中にも意味を見つける。',
    },
    10: {
        quote: { author: 'リルケ', text: '心の中にある「問い」そのものを愛しなさい。' },
        theme: '三位一体（脳の偏り × 価値観 × 環境）を感じる日。',
        affirmation: '私は3つの要素で構成されている。',
    },
    11: {
        quote: { author: 'ユング', text: '無意識を意識化することで、運命は選択に変わる。' },
        theme: '今日は「抵抗（分母）」を観察する。何がブレーキになっている？',
        affirmation: '私は抵抗を敵ではなく、パートナーとして見る。',
    },
    12: {
        quote: { author: 'フランクル', text: '刺激と反応の間のスペースが、自由への鍵。' },
        theme: '感覚が研ぎ澄まされてきた。そのスペースを広げ続ける。',
        affirmation: '私のスペースは日々広がっている。',
    },
    13: {
        quote: { author: 'キーガン', text: '主観から客観へのシフトが、器を拡張する。' },
        theme: '明日のマイルストーンに向け、感覚を整える。',
        affirmation: '私は観察者としての自分を育てている。',
    },
    14: {
        quote: { author: 'ユング', text: '意識化された無意識は、あなたの味方になる。' },
        theme: '🔥 14日目マイルストーン：「三位一体の音（Trinity Audio）」配布日。',
        affirmation: '私は三位一体の調和を体現する。',
    },

    // ===== フェーズ3: Ignition（15-21日目）=====
    15: {
        quote: { author: 'キャンベル', text: '恐れて足を踏み入れない洞窟の中にこそ、宝がある。' },
        theme: '今日から点火フェーズ。恐れの先にある宝を目指す。',
        affirmation: '私は恐れの先へ進む勇気を持っている。',
    },
    16: {
        quote: { author: 'サン＝テグジュペリ', text: '未来とは、予測するものではない。それを可能にすることだ。' },
        theme: '未来を「待つ」のではなく、「創る」意識へシフト。',
        affirmation: '私は未来を創造する主体だ。',
    },
    17: {
        quote: { author: 'ゲーテ', text: '自分自身を信じた瞬間に、どう生きればいいかがわかる。' },
        theme: '自分を信じる練習。疑いの声を観察し、手放す。',
        affirmation: '私は自分を信じることを選ぶ。',
    },
    18: {
        quote: { author: 'キャンベル', text: 'あなたが探し求めている宝は、洞窟の中にある。' },
        theme: 'ヒーローの旅の本質：恐れを超えた先の変容。',
        affirmation: '私は変容の途中にいる。',
    },
    19: {
        quote: { author: 'サン＝テグジュペリ', text: '未来を可能にするのは、今日の行動だ。' },
        theme: '最終航路図の下書きを始める。どこへ向かいたい？',
        affirmation: '私は自分の航路を描く。',
    },
    20: {
        quote: { author: 'ゲーテ', text: '信じることが、道を照らす光になる。' },
        theme: '明日の完成に向けて、最後の調整。',
        affirmation: '私は完成を恐れない。',
    },
    21: {
        quote: { author: 'Taka', text: "Broken's beautiful —— 壊れていることは、美しい。" },
        theme: '🚀 21日目マイルストーン：「最終航路図」完成日。自由航行軌道へ。',
        affirmation: '私は私のために、この銀河をドライブする。',
    },
};

// ===== 脳タイプ別トーン修飾 =====
export const brainTypeModifiers: Record<string, {
    name: string;
    keywords: string[];
    greeting: (state: 'low' | 'mid' | 'high') => string;
}> = {
    left_3d: {
        name: 'ソラ',
        keywords: ['ワクワク', '未知', '加速', '冒険'],
        greeting: (state) => state === 'low'
            ? 'コマンダー、今日は静かに翼を休める日かもしれない。'
            : state === 'mid'
                ? 'いい風が吹いてきた！未知の空へ飛び出す準備はOK？'
                : 'エンジン全開！今日は最高の冒険日和だ！🚀',
    },
    right_3d: {
        name: 'マモル',
        keywords: ['安心', '守る', '土台', '確実'],
        greeting: (state) => state === 'low'
            ? 'コマンダー、今日は安全に着陸して休息を。'
            : state === 'mid'
                ? '土台は整っている。一歩ずつ確実に進もう。'
                : '万全の態勢！今日も安心して飛べる環境を整えた。',
    },
    left_2d: {
        name: 'シン',
        keywords: ['解析', '最適解', '構造', '効率'],
        greeting: (state) => state === 'low'
            ? 'データ解析中...今日は内部メンテナンスの日とする。'
            : state === 'mid'
                ? '解析完了。最適な航路が見えてきた。'
                : '全システム最適化完了。最高効率で飛行可能。',
    },
    right_2d: {
        name: 'ピク',
        keywords: ['調和', '繋がり', '呼吸', '共鳴'],
        greeting: (state) => state === 'low'
            ? 'ゆっくり呼吸して...今日は心と体の調和を優先しよう。'
            : state === 'mid'
                ? '穏やかな流れを感じる。繋がりを大切に進もう。'
                : '素晴らしい共鳴を感じる！調和の中で最高の飛行を。',
    },
};

// ===== ヘルパー関数 =====
export const getPhase = (day: number): 1 | 2 | 3 => {
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    return 3;
};

export const getDailyQuote = (day: number) => {
    return dailyMessages[day]?.quote || dailyMessages[1].quote;
};

export const getDailyMessage = (day: number, brainType: string, state: 'low' | 'mid' | 'high') => {
    const message = dailyMessages[day] || dailyMessages[1];
    const modifier = brainTypeModifiers[brainType] || brainTypeModifiers.left_3d;

    return {
        crewName: modifier.name,
        greeting: modifier.greeting(state),
        quote: message.quote,
        theme: message.theme,
        affirmation: message.affirmation,
        phase: getPhase(day),
    };
};
