// Trinity Code 21日間プログラム データ定義
// 各日のテーマ、詩、呼吸法、チャート反映値を管理

export interface TrinityCodeDay {
    day: number;
    spiral: 1 | 2 | 3;
    theme: string;
    themeJp: string;
    color: string;
    colorCode: string;
    poem: string;
    breathing?: string;
    chartRewards: {
        ego_observation?: number;    // 自己観察力
        ego_control?: number;        // 自己制御力
        ego_efficacy?: number;       // 自己効力感
        ego_affirmation?: number;    // 自己肯定感
        stress_tolerance?: number;   // ストレス耐性
    };
}

export interface BrainTypeMission {
    sora: string;   // ソラ（冒険家）
    shin: string;   // シン（戦略家）
    piku: string;   // ピク（癒やし手）
    mamoru: string; // マモル（守護者）
}

// 脳タイプマッピング
export const BRAIN_TYPE_MAP: Record<string, keyof BrainTypeMission> = {
    'right_3d': 'sora',   // 右脳3D → ソラ
    'left_3d': 'shin',    // 左脳3D → シン
    'right_2d': 'piku',   // 右脳2D → ピク
    'left_2d': 'mamoru',  // 左脳2D → マモル
};

// ===================================
// 第1スパイラル：感覚を呼び覚ます (Day 1-7)
// 目的: 分母（Resistance/抵抗）を減らす
// ===================================
const spiral1: TrinityCodeDay[] = [
    {
        day: 1,
        spiral: 1,
        theme: 'move',
        themeJp: '動こう',
        color: '赤',
        colorCode: '#EF4444',
        poem: '風のように いま一歩ふみだせば...',
        breathing: '4-6-8呼吸（吸4・止6・吐8）',
        chartRewards: { ego_observation: 10, stress_tolerance: 5 }
    },
    {
        day: 2,
        spiral: 1,
        theme: 'play',
        themeJp: '遊ぼう',
        color: '橙',
        colorCode: '#F97316',
        poem: 'まわり道をしていたら風がくすぐってきた...',
        breathing: '四角い呼吸（各4秒）',
        chartRewards: { ego_efficacy: 10 }
    },
    {
        day: 3,
        spiral: 1,
        theme: 'leap',
        themeJp: '跳ぼう',
        color: '黄',
        colorCode: '#EAB308',
        poem: 'わたしの中の光が「行ってみよう」とささやいた...',
        breathing: '4-6-8呼吸（みぞおち意識）',
        chartRewards: { ego_efficacy: 15 }
    },
    {
        day: 4,
        spiral: 1,
        theme: 'surrender',
        themeJp: 'ゆだねる',
        color: '緑',
        colorCode: '#22C55E',
        poem: 'ふみだした足が ゆれている...',
        breathing: '4-7-8呼吸（胸の温かさ）',
        chartRewards: { stress_tolerance: 15, ego_affirmation: 5 }
    },
    {
        day: 5,
        spiral: 1,
        theme: 'resonate',
        themeJp: '響こう',
        color: '青',
        colorCode: '#3B82F6',
        poem: '小さなひかりが まだ音にならずに...',
        breathing: '4-6-8呼吸（ハミング「ん〜」）',
        chartRewards: { ego_observation: 10 }
    },
    {
        day: 6,
        spiral: 1,
        theme: 'observe',
        themeJp: '観る',
        color: '藍',
        colorCode: '#4338CA',
        poem: '藍色の風が まぶたの裏にひろがって...',
        breathing: '夜の呼吸（吸4・止7・吐8）',
        chartRewards: { ego_observation: 15 }
    },
    {
        day: 7,
        spiral: 1,
        theme: 'illuminate',
        themeJp: '灯そう',
        color: '紫',
        colorCode: '#A855F7',
        poem: 'わたしの中に ひかりの種がある...',
        breathing: 'クラウン呼吸（吸4・止7・吐8）',
        chartRewards: { ego_observation: 3, ego_control: 3, ego_efficacy: 3, ego_affirmation: 3, stress_tolerance: 3 }
    }
];

// ===================================
// 第2スパイラル：光を育てる (Day 8-14)
// 目的: 分子（Potential/潜在能力）を増やす
// ===================================
const spiral2: TrinityCodeDay[] = [
    {
        day: 8,
        spiral: 2,
        theme: 'move',
        themeJp: '動こう',
        color: '赤',
        colorCode: '#EF4444',
        poem: 'たったひとつの 行動がこころの奥に 火をともす...',
        chartRewards: { ego_efficacy: 10 }
    },
    {
        day: 9,
        spiral: 2,
        theme: 'play',
        themeJp: '遊ぼう',
        color: '橙',
        colorCode: '#F97316',
        poem: 'あそびのまんなかにいるときわたしは...',
        chartRewards: { ego_affirmation: 10, ego_efficacy: 5 }
    },
    {
        day: 10,
        spiral: 2,
        theme: 'notice',
        themeJp: '気づく',
        color: '黄',
        colorCode: '#EAB308',
        poem: 'イヤだったただそれだけの感情の中に...',
        chartRewards: { ego_observation: 10, ego_control: 5 }
    },
    {
        day: 11,
        spiral: 2,
        theme: 'believe',
        themeJp: '信じる',
        color: '緑',
        colorCode: '#22C55E',
        poem: 'あなたがまだ気づいていない光に...',
        chartRewards: { ego_affirmation: 15, stress_tolerance: 5 }
    },
    {
        day: 12,
        spiral: 2,
        theme: 'voice',
        themeJp: '声にする',
        color: '青',
        colorCode: '#3B82F6',
        poem: 'わたしの中に 響いていたのは...',
        chartRewards: { ego_efficacy: 10, ego_control: 5 }
    },
    {
        day: 13,
        spiral: 2,
        theme: 'observe',
        themeJp: '観よう',
        color: '藍',
        colorCode: '#4338CA',
        poem: '静かな中でわたしは わたしの光を灯している...',
        chartRewards: { ego_observation: 15 }
    },
    {
        day: 14,
        spiral: 2,
        theme: 'return',
        themeJp: '還る',
        color: '紫',
        colorCode: '#A855F7',
        poem: 'ただここに 在ることがもうすでに 光だった...',
        chartRewards: { ego_affirmation: 20 }
    }
];

// ===================================
// 第3スパイラル：存在としてひらかれる (Day 15-21)
// 目的: Flow（至福）の状態を定着させる
// ===================================
const spiral3: TrinityCodeDay[] = [
    {
        day: 15,
        spiral: 3,
        theme: 'root',
        themeJp: '根ざす声',
        color: '赤',
        colorCode: '#EF4444',
        poem: '',
        chartRewards: { stress_tolerance: 10 }
    },
    {
        day: 16,
        spiral: 3,
        theme: 'sway',
        themeJp: '揺れる',
        color: '橙',
        colorCode: '#F97316',
        poem: '',
        chartRewards: { ego_affirmation: 10 }
    },
    {
        day: 17,
        spiral: 3,
        theme: 'stand',
        themeJp: '芯に立つ',
        color: '黄',
        colorCode: '#EAB308',
        poem: '',
        chartRewards: { ego_efficacy: 10, ego_control: 10 }
    },
    {
        day: 18,
        spiral: 3,
        theme: 'resonate',
        themeJp: '響く',
        color: '緑',
        colorCode: '#22C55E',
        poem: '',
        chartRewards: { stress_tolerance: 10 }
    },
    {
        day: 19,
        spiral: 3,
        theme: 'voice',
        themeJp: '声がひらく',
        color: '青',
        colorCode: '#3B82F6',
        poem: '',
        chartRewards: { ego_control: 10 }
    },
    {
        day: 20,
        spiral: 3,
        theme: 'observe',
        themeJp: '観よう',
        color: '藍',
        colorCode: '#4338CA',
        poem: '',
        chartRewards: { ego_observation: 15 }
    },
    {
        day: 21,
        spiral: 3,
        theme: 'illuminate',
        themeJp: '灯そう',
        color: '紫',
        colorCode: '#A855F7',
        poem: '',
        chartRewards: {
            ego_observation: 10,
            ego_control: 10,
            ego_efficacy: 10,
            ego_affirmation: 10,
            stress_tolerance: 10
        }
    }
];

// 全21日間のデータ
export const TRINITY_CODE_DAYS: TrinityCodeDay[] = [...spiral1, ...spiral2, ...spiral3];

// 日毎に取得
export const getTrinityCodeDay = (day: number): TrinityCodeDay | undefined => {
    return TRINITY_CODE_DAYS.find(d => d.day === day);
};

// スパイラル別に取得
export const getSpiral = (spiralNumber: 1 | 2 | 3): TrinityCodeDay[] => {
    return TRINITY_CODE_DAYS.filter(d => d.spiral === spiralNumber);
};

// ===================================
// 脳タイプ別ミッションテンプレート
// ===================================
export const BRAIN_TYPE_MISSIONS: Record<number, BrainTypeMission> = {
    1: {
        sora: '今日の一歩、どんな風が吹いた？✨',
        shin: '最初の一歩を「分析」するより「感じる」。何を感じた？',
        piku: '一歩踏み出した自分に「よくやったね」って言ってあげて💕',
        mamoru: '安全な範囲での一歩。どこまで進めた？'
    },
    2: {
        sora: '今日の「遊び」で見つけた宝物は？🎯',
        shin: '遊びの中に隠れていた法則性は何？',
        piku: '楽しかった瞬間、自分の笑顔を想像してみて☺️',
        mamoru: '安心して遊べた？遊びの中での発見を教えて'
    },
    10: {
        sora: '直感で「イヤ！」と感じたあの瞬間。その裏にあるワクワクの種を教えて！',
        shin: '違和感をデータとして捉えてみよう。あなたの「たいせつ」を言葉にするなら何？',
        piku: 'モヤモヤした時、自分に「大丈夫だよ」って声をかけてあげた？ その温かさをスタンプで送って💕',
        mamoru: '安心を脅かされた感覚は、あなたが誠実である証拠。今の安心度を5段階で教えて'
    }
};

// デフォルトのミッション（データがない日用）
export const getDefaultMission = (day: number): BrainTypeMission => {
    const dayData = getTrinityCodeDay(day);
    const theme = dayData?.themeJp || `Day ${day}`;

    return {
        sora: `今日の「${theme}」で何を感じた？✨`,
        shin: `「${theme}」を論理的に振り返ると、何が見えた？`,
        piku: `「${theme}」の中で、自分を優しく見守れた？💕`,
        mamoru: `安心しながら「${theme}」できた？今日の達成度を教えて`
    };
};

// 脳タイプ別メッセージを取得
export const getMissionForBrainType = (day: number, brainType: string): string => {
    const missions = BRAIN_TYPE_MISSIONS[day] || getDefaultMission(day);
    const typeKey = BRAIN_TYPE_MAP[brainType] || 'sora';
    return missions[typeKey];
};
