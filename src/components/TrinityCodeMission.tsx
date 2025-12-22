import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, Check, ChevronRight } from 'lucide-react';
import TrinityCodePlayer from './TrinityCodePlayer';
import { getTrinityCodeDay, getMissionForBrainType, TrinityCodeDay } from '../data/trinityCodeDays';

interface TrinityCodeMissionProps {
    day: number;
    brainType: string;
    userName: string;
    currentStats: {
        ego_observation: number;
        ego_control: number;
        ego_efficacy: number;
        ego_affirmation: number;
        stress_tolerance: number;
    };
    onComplete?: (rewards: TrinityCodeDay['chartRewards']) => Promise<void>;
    onClose?: () => void;
}

const TrinityCodeMission: React.FC<TrinityCodeMissionProps> = ({
    day,
    brainType,
    userName,
    currentStats,
    onComplete,
    onClose
}) => {
    const [phase, setPhase] = useState<'audio' | 'mission' | 'response' | 'reward'>('audio');
    const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const dayData = getTrinityCodeDay(day);
    const missionText = getMissionForBrainType(day, brainType);

    if (!dayData) {
        return <div className="text-white p-4">Day {day} data not found</div>;
    }

    // Quick response options
    const quickResponses = [
        { id: 'done', label: '✅ できた！', emoji: '✅' },
        { id: 'try', label: '🌱 やってみた', emoji: '🌱' },
        { id: 'feel', label: '💭 感じ中...', emoji: '💭' },
        { id: 'difficult', label: '🤔 難しかった', emoji: '🤔' }
    ];

    // Handle audio completion
    const handleAudioComplete = () => {
        setTimeout(() => setPhase('mission'), 500);
    };

    // Handle response submission
    const handleRespond = async (responseId: string) => {
        setSelectedResponse(responseId);
        setIsProcessing(true);

        // Simulate processing
        setTimeout(async () => {
            if (dayData.chartRewards && onComplete) {
                await onComplete(dayData.chartRewards);
            }
            setPhase('reward');
            setIsProcessing(false);
        }, 1500);
    };

    // Calculate new stats after rewards
    const newStats = dayData.chartRewards ? {
        ego_observation: currentStats.ego_observation + (dayData.chartRewards.ego_observation || 0),
        ego_control: currentStats.ego_control + (dayData.chartRewards.ego_control || 0),
        ego_efficacy: currentStats.ego_efficacy + (dayData.chartRewards.ego_efficacy || 0),
        ego_affirmation: currentStats.ego_affirmation + (dayData.chartRewards.ego_affirmation || 0),
        stress_tolerance: currentStats.stress_tolerance + (dayData.chartRewards.stress_tolerance || 0)
    } : currentStats;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-screen p-4 flex flex-col items-center justify-center">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div
                            className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-2"
                            style={{
                                backgroundColor: `${dayData.colorCode}20`,
                                color: dayData.colorCode
                            }}
                        >
                            第{dayData.spiral}スパイラル・{dayData.color}
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            Day {day}: {dayData.themeJp}
                        </h2>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Phase 1: Audio Player */}
                        {phase === 'audio' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <TrinityCodePlayer
                                    day={day}
                                    onComplete={handleAudioComplete}
                                />

                                {/* Poem display */}
                                {dayData.poem && (
                                    <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-white/70 text-center italic leading-relaxed">
                                            "{dayData.poem}"
                                        </p>
                                    </div>
                                )}

                                {/* Breathing instruction */}
                                {dayData.breathing && (
                                    <div className="mt-4 text-center">
                                        <p className="text-white/50 text-sm">
                                            🌬️ {dayData.breathing}
                                        </p>
                                    </div>
                                )}

                                {/* Skip to mission button */}
                                <button
                                    onClick={() => setPhase('mission')}
                                    className="mt-6 w-full py-3 text-white/50 text-sm hover:text-white/80 transition flex items-center justify-center gap-2"
                                >
                                    ミッションへ進む <ChevronRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                        {/* Phase 2: Mission Display */}
                        {phase === 'mission' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-white/10"
                            >
                                <div className="flex items-center gap-2 text-amber-400 mb-4">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="text-sm font-bold">TODAY'S MISSION</span>
                                </div>

                                <p className="text-white text-lg leading-relaxed mb-6">
                                    {missionText}
                                </p>

                                {/* Breathing reminder */}
                                {dayData.breathing && (
                                    <div className="bg-white/5 rounded-lg p-3 mb-6">
                                        <p className="text-white/60 text-sm flex items-center gap-2">
                                            <span>🌬️</span>
                                            <span>{dayData.breathing}</span>
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => setPhase('response')}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl
                    flex items-center justify-center gap-2 hover:opacity-90 transition"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    返信する
                                </button>
                            </motion.div>
                        )}

                        {/* Phase 3: Response Selection */}
                        {phase === 'response' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-white/10">
                                    <p className="text-white/60 text-sm mb-4">
                                        {userName}さん、今日のワークはいかがでしたか？
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        {quickResponses.map((response) => (
                                            <button
                                                key={response.id}
                                                onClick={() => handleRespond(response.id)}
                                                disabled={isProcessing}
                                                className={`p-4 rounded-xl border transition-all text-left
                          ${selectedResponse === response.id
                                                        ? 'bg-indigo-600 border-indigo-400 text-white'
                                                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                                    }
                          ${isProcessing && selectedResponse !== response.id ? 'opacity-50' : ''}`}
                                            >
                                                <span className="text-2xl block mb-1">{response.emoji}</span>
                                                <span className="text-sm">{response.label.split(' ')[1]}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {isProcessing && (
                                        <div className="mt-6 text-center">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full mx-auto"
                                            />
                                            <p className="text-white/60 text-sm mt-2">ポイントを加算中...</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Phase 4: Reward Animation */}
                        {phase === 'reward' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-white/10 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 10 }}
                                    className="text-6xl mb-4"
                                >
                                    🎉
                                </motion.div>

                                <h3 className="text-2xl font-bold text-white mb-2">
                                    ミッション完了！
                                </h3>
                                <p className="text-white/60 mb-6">
                                    Day {day} のワークを完了しました
                                </p>

                                {/* Rewards display */}
                                {dayData.chartRewards && (
                                    <div className="bg-white/5 rounded-xl p-4 mb-6">
                                        <p className="text-amber-400 text-sm font-bold mb-3">
                                            ✨ 獲得ポイント
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {dayData.chartRewards.ego_observation && (
                                                <div className="flex items-center justify-between text-white/80">
                                                    <span>観察力</span>
                                                    <span className="text-emerald-400">+{dayData.chartRewards.ego_observation}</span>
                                                </div>
                                            )}
                                            {dayData.chartRewards.ego_control && (
                                                <div className="flex items-center justify-between text-white/80">
                                                    <span>制御力</span>
                                                    <span className="text-emerald-400">+{dayData.chartRewards.ego_control}</span>
                                                </div>
                                            )}
                                            {dayData.chartRewards.ego_efficacy && (
                                                <div className="flex items-center justify-between text-white/80">
                                                    <span>効力感</span>
                                                    <span className="text-emerald-400">+{dayData.chartRewards.ego_efficacy}</span>
                                                </div>
                                            )}
                                            {dayData.chartRewards.ego_affirmation && (
                                                <div className="flex items-center justify-between text-white/80">
                                                    <span>肯定感</span>
                                                    <span className="text-emerald-400">+{dayData.chartRewards.ego_affirmation}</span>
                                                </div>
                                            )}
                                            {dayData.chartRewards.stress_tolerance && (
                                                <div className="flex items-center justify-between text-white/80">
                                                    <span>耐性</span>
                                                    <span className="text-emerald-400">+{dayData.chartRewards.stress_tolerance}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl
                    flex items-center justify-center gap-2 hover:opacity-90 transition"
                                >
                                    <Check className="w-5 h-5" />
                                    完了
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Close button (always visible) */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="mt-6 w-full py-3 text-white/50 text-sm hover:text-white/80 transition"
                        >
                            閉じる
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrinityCodeMission;
