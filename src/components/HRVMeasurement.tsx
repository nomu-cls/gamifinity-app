import React, { useState, useEffect } from 'react';

// ステートの定義
type Phase = 'intro' | 'q1' | 'q2' | 'q3' | 'calculating' | 'result';
type BrainType = 'SORA' | 'SHIN' | 'PIKU' | 'MAMORU' | 'UNKNOWN';

interface Props {
  onClose?: () => void;
  onComplete?: (metrics: any, feedback: string) => void;
  lineUserId?: string;
  brainType?: string; // e.g. 'Sora', 'Shin'
}

export const HRVMeasurement: React.FC<Props> = ({ onClose, onComplete, brainType = 'UNKNOWN', lineUserId }) => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [scores, setScores] = useState({ body: 3, mind: 3, passion: 3 });
  const [totalScore, setTotalScore] = useState(0);
  const [adviceState, setAdviceState] = useState({ title: '', message: '', type: '' });
  const [prevScore, setPrevScore] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('last_checkin_score');
    if (saved) {
      setPrevScore(parseInt(saved, 10));
    }
  }, []);

  // 質問データ
  const questions = {
    q1: {
      title: "体の感覚をチェック",
      question: "今のカラダの感覚は？",
      minLabel: "重い・どんより",
      maxLabel: "無重力・軽やか",
      icon: "🪶",
      color: "from-blue-400 to-indigo-500",
      key: 'body' as keyof typeof scores
    },
    q2: {
      title: "頭のノイズをチェック",
      question: "今のアタマのノイズは？",
      minLabel: "ガヤガヤ・焦り",
      maxLabel: "澄み渡っている",
      icon: "🧠",
      color: "from-teal-400 to-emerald-500",
      key: 'mind' as keyof typeof scores
    },
    q3: {
      title: "情熱の温度をチェック",
      question: "今のワクワク度は？",
      minLabel: "静かな情熱",
      maxLabel: "爆発しそう！",
      icon: "🔥",
      color: "from-orange-400 to-red-500",
      key: 'passion' as keyof typeof scores
    }
  };

  const handleScoreChange = (val: number) => {
    const key = phase === 'q1' ? 'body' : phase === 'q2' ? 'mind' : 'passion';
    setScores(prev => ({ ...prev, [key]: val }));
  };

  const nextPhase = () => {
    if (phase === 'intro') setPhase('q1');
    else if (phase === 'q1') setPhase('q2');
    else if (phase === 'q2') setPhase('q3');
    else if (phase === 'q3') calculateResult();
  };

  const calculateResult = () => {
    setPhase('calculating');
    setTimeout(() => {
      // スコア算出ロジック
      let rawScore = ((scores.body + scores.mind + scores.passion) / 15) * 100;

      // 重み付け（ペナルティ）：体が重い(<=2)場合は強制的にスコアを下げる
      if (scores.body <= 2) {
        rawScore = Math.min(rawScore, 59); // 強制的にメンテナンス以下にする
      }

      const finalScore = Math.round(rawScore);
      setTotalScore(finalScore);

      // アドバイス生成
      let resultType = '';
      let title = '';
      let msg = '';

      if (finalScore >= 85) {
        resultType = 'FLOW';
        title = '神フロー状態';
        msg = "最高です！今すぐ『本丸（最優先の創造）』に着手してください。あなたの『ソラ』が爆発し、未来を塗り替える時間です。";
      } else if (finalScore >= 60) {
        resultType = 'CREATIVE';
        title = 'クリエイティブ・ゾーン';
        msg = "良好なバランスです！未来を描く作業や、仕組み作りなど、形にする作業に最適。一気に進めましょう。";
      } else if (finalScore >= 40) {
        resultType = 'MAINTENANCE';
        title = '安定・メンテナンス';
        msg = "安定しています。メール返信や細かい調整など『ピク』的な作業を片付けると、さらに波に乗れますよ。";
      } else {
        resultType = 'RESET';
        title = 'リセット推奨';
        msg = "今は『マモル』のブレーキが作動中。5分間の瞑想か、温かい飲み物を。分母を削るのが、今の最優先タスクです。";
      }

      setAdviceState({ title, message: msg, type: resultType });

      // Save current score
      localStorage.setItem('last_checkin_score', finalScore.toString());

      if (onComplete) onComplete({ score: finalScore, type: resultType, detail: scores }, msg);
      setPhase('result');
    }, 1500); // 計算演出時間
  };

  const getBgColor = () => {
    if (phase === 'intro') return 'bg-white';
    if (phase === 'q1') return 'bg-blue-50';
    if (phase === 'q2') return 'bg-emerald-50';
    if (phase === 'q3') return 'bg-orange-50';
    if (phase === 'result' && totalScore >= 85) return 'bg-yellow-50';
    if (phase === 'result' && totalScore < 40) return 'bg-gray-100';
    return 'bg-white';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-sm ${getBgColor()} rounded-3xl shadow-2xl overflow-hidden transition-colors duration-500 relative min-h-[500px] flex flex-col`}>

        {onClose && phase !== 'calculating' && (
          <button onClick={onClose} className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 p-2 bg-white/50 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}

        {/* --- Intro --- */}
        {phase === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg text-4xl">
              ✨
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">30秒セルフチェック</h2>
            <p className="text-gray-800 font-medium mb-8 leading-relaxed text-sm">
              「身体・心・情熱」の状態を<br />
              直感でチェックしてみましょう。
            </p>

            {prevScore !== null && (
              <div className="mb-8 flex items-center justify-center gap-2 text-gray-400">
                <span className="text-[10px] font-bold tracking-widest">前回スコア：</span>
                <span className="text-lg font-bold">{prevScore}</span>
              </div>
            )}
            <button onClick={nextPhase} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
              はじめる
            </button>
          </div>
        )}

        {/* --- Questions --- */}
        {(phase === 'q1' || phase === 'q2' || phase === 'q3') && (() => {
          const qKey = phase as keyof typeof questions;
          const q = questions[qKey];
          const currentVal = scores[q.key];

          return (
            <div className="flex-1 flex flex-col p-8 animate-in slide-in-from-right duration-300">
              <div className="flex items-center gap-2 mb-8">
                <span className={`text-xs font-bold px-2 py-1 rounded text-white bg-gradient-to-r ${q.color}`}>
                  STEP {phase === 'q1' ? 1 : phase === 'q2' ? 2 : 3}/3
                </span>
                <span className="text-sm text-gray-500 font-medium">{q.title}</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-6xl mb-6 drop-shadow-sm">{q.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-10 text-center">{q.question}</h3>

                {/* Slider UI */}
                <div className="w-full mb-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={currentVal}
                    onChange={(e) => handleScoreChange(Number(e.target.value))}
                    className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-3 font-medium">
                    <span>{q.minLabel}</span>
                    <span>{q.maxLabel}</span>
                  </div>
                </div>

                <div className="mt-8 text-4xl font-bold text-gray-800">{currentVal}</div>
              </div>

              <button onClick={nextPhase} className={`w-full mt-auto text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] bg-gradient-to-r ${q.color}`}>
                次へ
              </button>
            </div>
          );
        })()}

        {/* --- Calculating --- */}
        {phase === 'calculating' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-bold animate-pulse">分析中...</p>
          </div>
        )}

        {/* --- Result --- */}
        {phase === 'result' && (
          <div className="flex-1 flex flex-col items-center p-8 animate-in zoom-in duration-500 overflow-y-auto">
            <span className="text-xs font-bold text-gray-400 tracking-widest mb-2">DIAGNOSIS RESULT</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{adviceState.title}</h2>

            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                <circle cx="80" cy="80" r="70" stroke="url(#gradient)" strokeWidth="8" fill="none"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * ((100 - totalScore) / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center">
                <span className="text-5xl font-black text-gray-800">{totalScore}</span>
                <span className="text-sm text-gray-400 block mt-1">SCORE</span>
              </div>
            </div>

            {prevScore !== null && (
              <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
                <span>前回: <span className="font-bold">{prevScore}</span></span>
                <span className="text-gray-300">→</span>
                <span>今回: <span className={`font-bold ${totalScore >= prevScore ? 'text-red-500' : 'text-blue-500'}`}>
                  {totalScore}
                  {totalScore > prevScore && ' ⤴'}
                  {totalScore < prevScore && ' ⤵'}
                </span></span>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full mb-6">
              <h4 className="text-sm font-bold text-gray-400 mb-3 border-b pb-2">Future Advice</h4>
              <p className="text-gray-700 leading-relaxed font-medium">
                {adviceState.message}
              </p>
            </div>



            <div className="grid grid-cols-3 gap-2 w-full mb-6 text-center text-xs text-gray-500">
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <div className="font-bold text-lg text-blue-500">{scores.body}</div>
                <div>Body</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <div className="font-bold text-lg text-emerald-500">{scores.mind}</div>
                <div>Mind</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100">
                <div className="font-bold text-lg text-orange-500">{scores.passion}</div>
                <div>Passion</div>
              </div>
            </div>

            <div className="mt-auto w-full space-y-3">
              <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">
                ホームに戻る
              </button>
              <button onClick={onClose} className="w-full text-gray-400 text-xs hover:text-gray-600 py-2">
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
