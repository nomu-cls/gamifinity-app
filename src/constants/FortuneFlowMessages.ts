export type BrainType = 'SORA' | 'SHIN' | 'PIKU' | 'MAMORU';

export const FORTUNE_MESSAGES: Record<BrainType, { title: string; message: string }[]> = {
    SORA: [
        {
            title: "直感の羅針盤",
            message: "論理で説明できない「偏り」こそが、あなただけの独創性を生むエンジンです。"
        },
        {
            title: "いい加減の才能",
            message: "あなたの「あいまいさ」は、生命が進化のために獲得した高度な生存戦略です。"
        },
        {
            title: "未来へのワープ",
            message: "抵抗（分母）が外れた瞬間、人生で初めての「爆速」が始まります。"
        },
        // Repeats or randomized in real app, simplified for MVP
    ],
    SHIN: [
        {
            title: "参謀の休息",
            message: "シンはあなたを批判したいのではなく、あなたが失敗しないよう事前に穴を塞ぐ参謀です。"
        },
        {
            title: "正解の先へ",
            message: "論理の限界は、誰でも同じ正解に行き着くこと。今日は「美意識」に席を譲りましょう。"
        },
        {
            title: "最強のパートナー",
            message: "データ処理はAIに任せ、あなたにしかできない「意志」の操縦を楽しみましょう。"
        }
    ],
    PIKU: [
        {
            title: "器を広げる勇気",
            message: "心臓が引き裂かれるような痛みは、器が大きな愛を受け取るために広がっている音です。"
        },
        {
            title: "凪の魔法",
            message: "感謝はストレスホルモンを23%低下させます。今日の「おかげさま」を3つ数えましょう。"
        },
        {
            title: "つながりの天才",
            message: "場の気配を察知する才能を、まずは自分自身を慈しむために使ってください。"
        }
    ],
    MAMORU: [
        {
            title: "最強のスタビライザー",
            message: "マモルの慎重さは、最高速で走るための「最強の安定装置」です。"
        },
        {
            title: "ブレーキは才能の証",
            message: "強力なブレーキがあるのは、その下に強力なエンジンがある証拠です。"
        },
        {
            title: "職人の誇り",
            message: "マモルは決めたことをコツコツやり遂げる実行力の要。今日の小さな一歩を誇りましょう。"
        }
    ]
};

export const getRandomMessage = (type: BrainType | 'UNKNOWN' | undefined) => {
    const targetType = (type && type !== 'UNKNOWN' && type in FORTUNE_MESSAGES) ? (type as BrainType) : 'SORA';
    const messages = FORTUNE_MESSAGES[targetType];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
};
