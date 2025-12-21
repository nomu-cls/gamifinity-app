import React, { useState } from 'react';
import { HRVMeasurement } from './HRVMeasurement';
import { getRandomMessage } from '../constants/FortuneFlowMessages';
import { UserStory } from '../lib/supabase';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
    story: UserStory;
    onClose: () => void;
    onComplete: () => void;
    brainType?: string;
}

export const DailyNavigationModal: React.FC<Props> = ({ story, onClose, onComplete, brainType }) => {
    const [checkResult, setCheckResult] = useState<any>(null);
    const [fortune, setFortune] = useState<{ title: string; message: string } | null>(null);
    const [missionText, setMissionText] = useState('');
    const [step, setStep] = useState<'check' | 'fortune'>('check');
    const [saving, setSaving] = useState(false);

    // Step 1: Self Check
    if (step === 'check') {
        return (
            <HRVMeasurement
                onClose={onClose}
                brainType={brainType}
                onComplete={(metrics, feedback) => {
                    setCheckResult({ metrics, feedback });
                    // Generate fortune immediately
                    const msg = getRandomMessage(brainType as any);
                    setFortune(msg);
                    setStep('fortune');
                }}
            />
        );
    }

    // Step 2: Fortune Flow
    const handleFinish = async () => {
        if (saving) return;
        setSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const newLog = {
                date: today,
                metrics: checkResult.metrics,
                feedback: checkResult.feedback,
                fortune: fortune,
                mission: missionText,
                mission_completed: false, // Initial state
                completed_at: new Date().toISOString()
            };

            // Merge into daily_logs JSONB
            // Note: Supabase JSONB update usually requires fetching first or using specific operator.
            // For simplicity, we assume 'story.daily_logs' is up to date, modify it, and push.
            const currentLogs = story.daily_logs || {};
            const updatedLogs = { ...currentLogs, [today]: newLog };

            const { error } = await supabase
                .from('user_stories')
                .update({ daily_logs: updatedLogs })
                .eq('id', story.id);

            if (error) throw error;

            onComplete();
        } catch (err) {
            console.error('Failed to save daily log:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-500 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 to-purple-500" />

                <div className="p-8 text-center">
                    {/* Brain Type Icon/Result */}
                    <div className="w-20 h-20 mx-auto bg-purple-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <Sparkles className="text-purple-500" size={32} />
                    </div>

                    <span className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Fortune Flow</span>
                    <h2 className="text-2xl font-black text-gray-900 mb-6">{fortune?.title}</h2>

                    <div className="bg-gray-50 p-6 rounded-2xl mb-8 relative">
                        <div className="absolute -top-3 -left-2 text-4xl text-gray-200">"</div>
                        <p className="text-gray-700 font-medium leading-relaxed relative z-10">
                            {fortune?.message}
                        </p>
                        <div className="absolute -bottom-6 -right-2 text-4xl text-gray-200">"</div>
                    </div>

                    {/* Mission Input */}
                    <div className="mb-6 text-left">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                            Today's Mission
                        </label>
                        <textarea
                            value={missionText}
                            onChange={(e) => setMissionText(e.target.value)}
                            placeholder="今日のミッションを宣言しよう..."
                            className="w-full bg-gray-100 border-0 rounded-xl p-4 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 font-medium resize-none h-24"
                        />
                    </div>

                    <button
                        onClick={handleFinish}
                        disabled={saving}
                        className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                        {saving ? '保存中...' : (
                            <>
                                <CheckCircle2 size={20} />
                                完了してミッションを設定
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
