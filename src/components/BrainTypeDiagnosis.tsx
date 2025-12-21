import { useState, useEffect } from 'react';
import { Compass, ChevronRight, Sparkles, Brain, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DiagnosticQuestion {
  question_id: string;
  question_text: string;
  options: Array<{
    option_id: string;
    option_text: string;
    brain_type: string;
    score: number;
  }>;
}

interface Diagnostic {
  id: string;
  theme: string;
  title: string;
  description: string;
  questions: DiagnosticQuestion[];
}

interface BrainTypeDiagnosisProps {
  lineUserId: string;
  onComplete: (brainType: string) => void;
  onClose?: () => void;
}

const BRAIN_TYPE_INFO: Record<string, { name: string; description: string; color: string; traits: string[]; image: string }> = {
  left_3d: {
    name: 'シン（戦略家）',
    description: '最短ルートを弾き出し、論理で戦略を練る参謀です',
    color: '#3B82F6',
    traits: ['クールで論理的', '本質を見抜く', 'コスパ重視', '進化と質の向上'],
    image: '/characters/sora.png'
  },
  left_2d: {
    name: 'マモル（守護者）',
    description: 'リスクを管理し、安全と信念を守る保安官であり職人です',
    color: '#10B981',
    traits: ['維持・継続力', '職人魂', '正確性', '信念を貫く'],
    image: '/characters/mamoru.png'
  },
  right_3d: {
    name: 'ソラ（冒険家）',
    description: '未来を見るビジョナリー。常にワクワクを指し示します',
    color: '#FBBF24',
    traits: ['好奇心旺盛', '拡張志向', '直感力', '楽観的'],
    image: '/characters/piku.png'
  },
  right_2d: {
    name: 'ピク（癒やし手）',
    description: '空気を読み、みんなとのつながりを大切にするムードメーカーです',
    color: '#EC4899',
    traits: ['感受性豊か', '共感力', '調和重視', '思いやり'],
    image: '/characters/shin.png'
  }
};

const colors = {
  cream: '#FDF6E9',
  peach: '#FFECD2',
  rose: '#E8A598',
  sage: '#A8C5A8',
  deepBrown: '#5D4E37',
  gold: '#D4A574',
  berry: '#C17B7B',
  sakura: '#FFE4E6'
};

export default function BrainTypeDiagnosis({ lineUserId, onComplete, onClose }: BrainTypeDiagnosisProps) {
  const [phase, setPhase] = useState<'intro' | 'questions' | 'calculating' | 'result'>('intro');
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { brain_type: string; score: number }>>({});
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActiveDiagnostic();
  }, []);

  const loadActiveDiagnostic = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('diagnostics')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setDiagnostic(data);
    }
    setIsLoading(false);
  };

  const handleAnswer = (questionId: string, brainType: string, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { brain_type: brainType, score }
    }));

    if (diagnostic && currentQuestionIndex < diagnostic.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    } else {
      calculateResult();
    }
  };

  const calculateResult = async () => {
    setPhase('calculating');

    const scores: Record<string, number> = {
      left_3d: 0,
      left_2d: 0,
      right_3d: 0,
      right_2d: 0
    };

    Object.values(answers).forEach(answer => {
      if (scores[answer.brain_type] !== undefined) {
        scores[answer.brain_type] += answer.score;
      }
    });

    const sortedTypes = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const dominantType = sortedTypes[0][0];

    try {
      await supabase
        .from('line_users')
        .update({
          brain_type: dominantType,
          brain_type_scores: scores,
          diagnosis_completed: true,
          diagnosis_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('line_user_id', lineUserId);

      await supabase.from('diagnostic_answers').insert({
        line_user_id: lineUserId,
        diagnostic_id: diagnostic?.id,
        answers: answers,
        result_brain_type: dominantType,
        scores: scores
      });
    } catch (err) {
      console.error('Error saving diagnosis result:', err);
    }

    setTimeout(() => {
      setResult(dominantType);
      setPhase('result');
    }, 2000);
  };

  const handleComplete = () => {
    if (result) {
      onComplete(result);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
        <div className="text-center text-white">
          <Compass className="w-12 h-12 mx-auto animate-spin mb-4" />
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!diagnostic) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
        <div className="w-full max-w-md p-6 rounded-3xl text-center" style={{ background: colors.cream }}>
          <p style={{ color: colors.deepBrown }}>診断データが見つかりませんでした</p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 rounded-full text-white font-bold"
              style={{ background: colors.rose }}
            >
              閉じる
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = diagnostic.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / diagnostic.questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl" style={{ background: colors.cream }}>
        {onClose && phase === 'intro' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white/80 hover:bg-white/30 z-10"
          >
            <X size={20} />
          </button>
        )}

        {phase === 'intro' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-full rounded-2xl overflow-hidden mb-4 shadow-lg">
              <img src="/characters/crew_all.jpg" alt="4人のクルー" className="w-full h-auto object-cover" />
            </div>

            <div>
              <h2 className="text-xl font-bold mb-2" style={{ color: colors.deepBrown }}>
                {diagnostic.title}
              </h2>
              <p className="text-sm opacity-70" style={{ color: colors.deepBrown }}>
                {diagnostic.description}
              </p>
            </div>

            <div className="p-4 rounded-xl text-left" style={{ background: `${colors.peach}50` }}>
              <p className="text-xs font-bold mb-2" style={{ color: colors.deepBrown }}>4人のクルー</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(BRAIN_TYPE_INFO).map(([key, info]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: info.color }} />
                    <span className="text-[10px]" style={{ color: colors.deepBrown }}>{info.name.split('（')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs opacity-60" style={{ color: colors.deepBrown }}>
              全{diagnostic.questions.length}問・約2分で完了
            </p>

            <button
              onClick={() => setPhase('questions')}
              className="w-full py-4 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              style={{ background: `linear-gradient(to right, ${colors.gold}, ${colors.rose})` }}
            >
              診断を始める
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {phase === 'questions' && currentQuestion && (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs" style={{ color: colors.deepBrown }}>
                <span className="font-bold">Q{currentQuestionIndex + 1} / {diagnostic.questions.length}</span>
                <span className="opacity-60">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: `${colors.peach}` }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: `linear-gradient(to right, ${colors.gold}, ${colors.rose})` }}
                />
              </div>
            </div>

            <div className="py-4">
              <h3 className="text-lg font-bold leading-relaxed" style={{ color: colors.deepBrown }}>
                {currentQuestion.question_text}
              </h3>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option.option_id}
                  onClick={() => handleAnswer(currentQuestion.question_id, option.brain_type, option.score)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 hover:scale-[1.02] active:scale-95
                    ${answers[currentQuestion.question_id]?.brain_type === option.brain_type
                      ? 'ring-2 ring-offset-2'
                      : 'hover:shadow-md'
                    }`}
                  style={{
                    background: answers[currentQuestion.question_id]?.brain_type === option.brain_type
                      ? `${BRAIN_TYPE_INFO[option.brain_type]?.color}20`
                      : 'rgba(255,255,255,0.7)',
                    ringColor: BRAIN_TYPE_INFO[option.brain_type]?.color
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: `${colors.peach}`, color: colors.deepBrown }}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-sm" style={{ color: colors.deepBrown }}>
                      {option.option_text}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'calculating' && (
          <div className="p-12 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ background: colors.gold }} />
              <div className="absolute inset-2 rounded-full animate-pulse"
                style={{ background: `linear-gradient(135deg, ${colors.gold}, ${colors.rose})` }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain size={40} className="text-white" />
              </div>
            </div>
            <div>
              <p className="font-bold text-lg mb-2" style={{ color: colors.deepBrown }}>
                あなたのクルーを分析中...
              </p>
              <p className="text-sm opacity-60" style={{ color: colors.deepBrown }}>
                回答を元にあなたのコマンダータイプを判定しています
              </p>
            </div>
          </div>
        )}

        {phase === 'result' && result && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{ background: `${colors.gold}20` }}>
                <Sparkles size={16} style={{ color: colors.gold }} />
                <span className="text-sm font-bold" style={{ color: colors.gold }}>診断結果</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl text-center"
              style={{ background: `linear-gradient(135deg, ${BRAIN_TYPE_INFO[result].color}15, ${BRAIN_TYPE_INFO[result].color}05)` }}>
              <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 overflow-hidden border-4"
                style={{ borderColor: BRAIN_TYPE_INFO[result].color, background: `${BRAIN_TYPE_INFO[result].color}20` }}>
                <img
                  src={BRAIN_TYPE_INFO[result].image}
                  alt={BRAIN_TYPE_INFO[result].name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-xl font-bold mb-2" style={{ color: colors.deepBrown }}>
                {BRAIN_TYPE_INFO[result].name}
              </h3>

              <p className="text-sm mb-4" style={{ color: colors.deepBrown }}>
                {BRAIN_TYPE_INFO[result].description}
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {BRAIN_TYPE_INFO[result].traits.map((trait, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: `${BRAIN_TYPE_INFO[result].color}20`, color: BRAIN_TYPE_INFO[result].color }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: `${colors.peach}50` }}>
              <p className="text-xs text-center" style={{ color: colors.deepBrown }}>
                あなたのコマンダータイプに合わせて、最適なアドバイスやコーチングをお届けします。
                30秒ステート・チェックインなどの機能で、より詳しいパーソナライズされた体験をお楽しみください。
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full py-4 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-95"
              style={{ background: `linear-gradient(to right, ${BRAIN_TYPE_INFO[result].color}, ${colors.rose})` }}
            >
              診断を完了する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
