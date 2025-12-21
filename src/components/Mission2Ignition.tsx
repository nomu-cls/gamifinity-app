import { useState, useEffect } from 'react';
import { Send, Sparkles, Brain, Shield, Zap, Heart, Loader2 } from 'lucide-react';

interface Mission2IgnitionProps {
    onSubmit: (data: any) => void;
}

const Mission2Ignition = ({ onSubmit }: Mission2IgnitionProps) => {
    const [resistanceLog, setResistanceLog] = useState('');
    const [selectedCrew, setSelectedCrew] = useState('');
    const [analysisLog, setAnalysisLog] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Gemini crew voice states
    const [crewVoice, setCrewVoice] = useState<string | null>(null);
    const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

    // Generate crew voice when crew is selected and user has entered resistance
    useEffect(() => {
        const generateVoice = async () => {
            if (!selectedCrew || resistanceLog.trim().length < 10) {
                setCrewVoice(null);
                return;
            }

            setIsGeneratingVoice(true);
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-crew-voice`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                        },
                        body: JSON.stringify({
                            crewId: selectedCrew,
                            userResistance: resistanceLog
                        })
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.crewVoice) {
                        setCrewVoice(data.crewVoice);
                    }
                }
            } catch (error) {
                console.error('Failed to generate crew voice:', error);
            } finally {
                setIsGeneratingVoice(false);
            }
        };

        // Debounce the API call
        const timeoutId = setTimeout(generateVoice, 500);
        return () => clearTimeout(timeoutId);
    }, [selectedCrew, resistanceLog]);

    const handleSubmit = async () => {
        if (!resistanceLog.trim() || !selectedCrew || !analysisLog.trim() || isSubmitting) return;

        setIsSubmitting(true);
        await onSubmit({
            resistance_log: resistanceLog,
            max_output_crew: selectedCrew,
            analysis_log: analysisLog
        });
        setIsSubmitted(true);
        setIsSubmitting(false);
    };

    const crewOptions = [
        { id: 'sora', name: 'ソラ（冒険家）', desc: '未来へのアクセル', color: 'from-amber-400 to-yellow-500', icon: Zap, iconColor: 'text-amber-400' },
        { id: 'mamoru', name: 'マモル（守護者）', desc: '安全と日常の維持', color: 'from-emerald-400 to-green-500', icon: Shield, iconColor: 'text-emerald-400' },
        { id: 'shin', name: 'シン（戦略家）', desc: '論理による最適化', color: 'from-blue-400 to-indigo-500', icon: Brain, iconColor: 'text-blue-400' },
        { id: 'piku', name: 'ピク（癒やし手）', desc: 'つながりと感情の維持', color: 'from-pink-400 to-rose-500', icon: Heart, iconColor: 'text-pink-400' },
    ];

    if (isSubmitted) {
        return (
            <div className="text-center py-8 space-y-4 animate-in fade-in duration-500">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    <Sparkles size={32} className="text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">解析完了</h3>
                    <p className="text-white/70 text-sm">
                        脳内クルーの声が特定されました。<br />
                        この気付きが、変容への第一歩です。
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-xl font-bold text-white tracking-widest drop-shadow-md">
                    —— 脳内解析プロトコル ——
                </h3>
                <p className="text-xs text-white/50 mt-2 font-mono">NEURAL CONFLICT ANALYSIS</p>
            </div>

            {/* Field 1: Resistance Log */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/90 font-bold text-sm">
                    <span className="w-1 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>
                    現在の抵抗ログ
                </div>
                <div className="relative group">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <p className="text-sm text-white/80 mb-3 font-medium">
                            今、あなたが始めたいのに踏み出せないこと、<br />
                            または強い「抵抗」を感じていることは何ですか？
                        </p>
                        <textarea
                            value={resistanceLog}
                            onChange={(e) => setResistanceLog(e.target.value)}
                            placeholder="例：新しいプロジェクトに挑戦したいけれど、失敗が怖くて動けない..."
                            rows={3}
                            className="w-full bg-black/20 rounded-xl border border-white/10 p-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-400/50 focus:bg-black/30 transition-all resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Field 2: Max Output Crew */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/90 font-bold text-sm">
                    <span className="w-1 h-4 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(192,132,255,0.5)]"></span>
                    最大出力クルーの特定
                </div>
                <p className="text-xs text-white/60 px-1">
                    今、あなたの耳に一番大きく響いているのは、誰の声ですか？
                </p>

                <div className="grid grid-cols-1 gap-2">
                    {crewOptions.map((crew) => {
                        const isSelected = selectedCrew === crew.id;
                        const Icon = crew.icon;

                        return (
                            <button
                                key={crew.id}
                                onClick={() => setSelectedCrew(crew.id)}
                                className={`relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 text-left group
                                    ${isSelected
                                        ? `bg-white/10 border-${crew.iconColor.split('-')[1]}-400 shadow-[0_0_15px_rgba(255,255,255,0.1)]`
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${crew.color} flex items-center justify-center shadow-lg transform transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                                    <Icon size={18} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                        {crew.name}
                                    </p>
                                    <p className="text-xs text-white/50 mt-0.5">
                                        {crew.desc}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Field 3: Analysis Log */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/90 font-bold text-sm">
                    <span className="w-1 h-4 bg-pink-400 rounded-full shadow-[0_0_10px_rgba(244,114,182,0.5)]"></span>
                    通信内容の詳細（解析ログ）
                </div>
                <div className="relative group">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        {/* Crew Icon + Question */}
                        {selectedCrew ? (
                            <div className="flex items-start gap-3 mb-4">
                                {/* Crew Icon */}
                                {(() => {
                                    const crew = crewOptions.find(c => c.id === selectedCrew);
                                    if (!crew) return null;
                                    const Icon = crew.icon;
                                    return (
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${crew.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                            <Icon size={18} className="text-white" />
                                        </div>
                                    );
                                })()}

                                {/* Speech Bubble */}
                                <div className="flex-1">
                                    <div className="relative bg-white/10 rounded-xl p-3 border border-white/20">
                                        {/* Arrow pointing to icon */}
                                        <div className="absolute left-[-8px] top-3 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-white/10 border-b-[8px] border-b-transparent"></div>

                                        <p className="text-xs text-white/60 mb-1 font-bold">
                                            {crewOptions.find(c => c.id === selectedCrew)?.name}からの確認:
                                        </p>

                                        {isGeneratingVoice ? (
                                            <div className="flex items-center gap-2 text-white/70">
                                                <Loader2 size={14} className="animate-spin" />
                                                <span className="text-sm">声を聴いています...</span>
                                            </div>
                                        ) : crewVoice ? (
                                            <p className="text-sm text-white font-medium italic">
                                                {crewVoice}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-white/80">
                                                「そのクルーは、あなたに何と言っていますか？」
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-white/80 mb-3 font-medium">
                                そのクルーは、具体的に何と言っていますか？
                            </p>
                        )}
                        <textarea
                            value={analysisLog}
                            onChange={(e) => setAnalysisLog(e.target.value)}
                            placeholder={
                                selectedCrew === 'sora'
                                    ? "例：『もっとワクワクすることをしろよ！』『つまらない選択するな！』『安全策ばかり取ってたら人生面白くないぞ！』"
                                    : selectedCrew === 'mamoru'
                                        ? "例：『危険だから止めておけ！』『今のままで十分だろ？』『失敗したらどうするんだ！』"
                                        : selectedCrew === 'shin'
                                            ? "例：『それは非効率だ！』『もっと論理的に考えろ！』『感情で判断するな！』"
                                            : selectedCrew === 'piku'
                                                ? "例：『みんなの気持ちを考えて！』『誰かを傷つけたらどうするの？』『争いは避けよう！』"
                                                : "例：『そんなことしてお金はどうするんだ！』『嫌われたら居場所がなくなるぞ！』"
                            }
                            rows={3}
                            className="w-full bg-black/20 rounded-xl border border-white/10 p-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-400/50 focus:bg-black/30 transition-all resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!resistanceLog.trim() || !selectedCrew || !analysisLog.trim() || isSubmitting}
                className="w-full py-4 rounded-xl font-bold text-base tracking-widest uppercase
                    bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500
                    hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-400
                    disabled:opacity-30 disabled:cursor-not-allowed
                    text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)]
                    flex items-center justify-center gap-3
                    transform hover:scale-[1.02] active:scale-[0.98]
                    transition-all duration-300 border border-white/20 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Send size={18} className={isSubmitting ? 'animate-pulse' : ''} />
                {isSubmitting ? 'TRANSMITTING...' : '解析データを送信'}
            </button>
        </div>
    );
};

export default Mission2Ignition;
