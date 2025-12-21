import { useState, useRef } from 'react';
import { Rocket, Send, Headphones, Sparkles, Play, Pause } from 'lucide-react';

interface MissionIgnitionProps {
    onSubmit: (answer: string) => void;
    audioUrl?: string;
}

const MissionIgnition = ({ onSubmit, audioUrl }: MissionIgnitionProps) => {
    const [answer, setAnswer] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleSubmit = async () => {
        if (!answer.trim() || isSubmitting) return;

        setIsSubmitting(true);
        await onSubmit(answer);
        setIsSubmitted(true);
        setIsSubmitting(false);
    };

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="mission-ignition-container animate-slide-up">
            <div className="relative overflow-hidden rounded-3xl">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-yellow-900/40 to-slate-900/80 backdrop-blur-xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(217,119,6,0.1),transparent_50%)]" />

                {/* Glass border effect */}
                <div className="absolute inset-0 rounded-3xl border border-amber-400/20" />

                <div className="relative p-6 space-y-5">
                    {!isSubmitted ? (
                        <>
                            {/* Header */}
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                                    <Rocket size={16} className="text-yellow-400" />
                                    <span className="text-xs font-bold tracking-[0.2em] text-yellow-100 uppercase drop-shadow-sm">
                                        Mission: First Ignition
                                    </span>
                                </div>
                                <h3 className="text-3xl font-bold text-white tracking-widest drop-shadow-[0_2px_10px_rgba(251,191,36,0.2)]">
                                    —— 点火 ——
                                </h3>
                            </div>

                            {/* Main Question */}
                            <div className="relative p-6 rounded-3xl bg-gradient-to-b from-yellow-950/30 to-amber-950/30 border border-yellow-400/20 shadow-lg backdrop-blur-md">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-full border border-yellow-200/20 shadow-lg">
                                    <Sparkles size={16} className="text-white animate-pulse" />
                                </div>
                                <p className="text-center text-white text-lg leading-relaxed font-medium mt-2">
                                    もし、ブレーキが<br />1ミリもかからないとしたら、
                                </p>
                                <p className="text-center mt-3">
                                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-200 drop-shadow-sm">
                                        本当は何がしたい？
                                    </span>
                                </p>
                            </div>

                            {/* Input Field */}
                            <div className="space-y-4 pt-2">
                                <div className="relative group">
                                    <textarea
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        placeholder="ワクワクを書き込んでください..."
                                        rows={6}
                                        className="w-full px-6 py-5 rounded-2xl bg-black/20 border border-yellow-400/30 
                                            text-white placeholder-amber-100/30 text-base leading-relaxed
                                            focus:outline-none focus:border-yellow-400 focus:bg-black/30 focus:shadow-[0_0_20px_rgba(250,204,21,0.2)]
                                            transition-all duration-300 resize-none scrollbar-thin scrollbar-thumb-yellow-400/20 scrollbar-track-transparent"
                                    />
                                    <div className="absolute right-4 bottom-4 text-white/30 pointer-events-none group-focus-within:text-yellow-400 transition-colors">
                                        <Sparkles size={18} />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!answer.trim() || isSubmitting}
                                    className="w-full py-4 rounded-2xl font-bold text-base tracking-wider
                                        bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500
                                        hover:from-yellow-400 hover:via-amber-400 hover:to-orange-400
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        text-white shadow-[0_4px_20px_rgba(245,158,11,0.3)]
                                        flex items-center justify-center gap-3
                                        transform hover:scale-[1.02] active:scale-[0.98]
                                        transition-all duration-300 border border-white/20"
                                >
                                    <Send size={18} className={isSubmitting ? 'animate-pulse' : ''} />
                                    {isSubmitting ? '送信中...' : '目的地を報告してログを受領'}
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center space-y-5 py-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-amber-500/30">
                                <Sparkles size={28} className="text-white" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">
                                    イグニッション完了！
                                </h3>
                                <p className="text-white/70 text-sm">
                                    夜の音声リンクを転送しました。
                                </p>
                            </div>

                            {/* Unlocked Audio Track */}
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                        <Headphones size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-xs text-indigo-300 font-medium uppercase tracking-wider">
                                            Unlocked
                                        </p>
                                        <p className="text-white font-bold">
                                            夜のフライトログ（Track 2）
                                        </p>
                                    </div>
                                </div>

                                {audioUrl && (
                                    <div className="mt-4">
                                        <button
                                            onClick={toggleAudio}
                                            className="w-full py-3 rounded-xl bg-indigo-500/30 border border-indigo-400/40
                               text-indigo-200 text-sm font-medium
                               flex items-center justify-center gap-2
                               hover:bg-indigo-500/40 transition-colors"
                                        >
                                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                            {isPlaying ? '一時停止' : '音声を聴く'}
                                        </button>
                                        <audio
                                            ref={audioRef}
                                            src={audioUrl}
                                            onEnded={() => setIsPlaying(false)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .mission-ignition-container {
          opacity: 0;
          animation: slideUp 0.6s ease-out forwards;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
      `}</style>
        </div>
    );
};

export default MissionIgnition;
