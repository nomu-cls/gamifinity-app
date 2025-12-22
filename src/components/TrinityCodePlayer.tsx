import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, Radio, Zap } from 'lucide-react';

interface TrinityCodePlayerProps {
    day: number;
    audioUrl?: string;
    onComplete?: () => void;
}

const TrinityCodePlayer: React.FC<TrinityCodePlayerProps> = ({
    day,
    audioUrl,
    onComplete
}) => {
    const [phase, setPhase] = useState<'idle' | 'receiving' | 'playing' | 'complete'>('idle');
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const noiseRef = useRef<HTMLAudioElement>(null);

    // Default audio URL if not provided
    const defaultAudioUrl = `/audio/daily/TC_Day${String(day).padStart(2, '0')}.mp3`;
    const actualAudioUrl = audioUrl || defaultAudioUrl;

    // SE URLs
    const noiseSeUrl = '/audio/se/transmission-noise.mp3';
    const gateOpenSeUrl = '/audio/se/gate-open.mp3';

    // Play transmission noise SE
    const playNoiseSe = () => {
        try {
            const audio = new Audio(noiseSeUrl);
            audio.volume = 0.5;
            audio.play().catch(() => console.log('SE not available'));
        } catch { }
    };

    // Play gate open SE
    const playGateOpenSe = () => {
        try {
            const audio = new Audio(gateOpenSeUrl);
            audio.volume = 0.6;
            audio.play().catch(() => console.log('SE not available'));
        } catch { }
    };

    // Start receiving transmission
    const handleReceive = () => {
        setPhase('receiving');
        playNoiseSe();

        // Simulate transmission receiving
        setTimeout(() => {
            playGateOpenSe();
            setPhase('playing');
            if (audioRef.current) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }, 2000);
    };

    // Toggle play/pause
    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Audio event handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setPhase('complete');
            playGateOpenSe();
            onComplete?.();
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [onComplete]);

    // Format time (seconds to mm:ss)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 border border-indigo-500/30">
            {/* Background noise effect */}
            <div className="absolute inset-0 opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(99, 102, 241, 0.1) 2px, rgba(99, 102, 241, 0.1) 4px)'
                    }}
                />
            </div>

            {/* Audio element */}
            <audio ref={audioRef} src={actualAudioUrl} preload="metadata" />

            <AnimatePresence mode="wait">
                {/* Idle State - Ready to receive */}
                {phase === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 text-center"
                    >
                        <div className="mb-4 flex items-center justify-center gap-2 text-indigo-400">
                            <Radio className="w-5 h-5 animate-pulse" />
                            <span className="text-sm font-mono tracking-wider">INCOMING TRANSMISSION</span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">
                            Day {day} - Trinity Code
                        </h3>
                        <p className="text-slate-400 text-sm mb-6">
                            のむ司令官からの音声通信
                        </p>

                        <button
                            onClick={handleReceive}
                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl
                shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_50px_rgba(99,102,241,0.8)]
                transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto"
                        >
                            <Zap className="w-5 h-5" />
                            今日の通信を受信
                        </button>
                    </motion.div>
                )}

                {/* Receiving State - Loading animation */}
                {phase === 'receiving' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 text-center py-8"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full mx-auto mb-4"
                        />
                        <p className="text-indigo-400 font-mono text-sm animate-pulse">
                            RECEIVING TRANSMISSION...
                        </p>
                        <div className="flex justify-center gap-1 mt-4">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ scaleY: [1, 2, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                    className="w-2 h-4 bg-indigo-500 rounded"
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Playing State - Audio player */}
                {phase === 'playing' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-indigo-400 text-xs font-mono">LIVE TRANSMISSION</p>
                                <h3 className="text-xl font-bold text-white">Day {day}</h3>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-xs font-mono">ON AIR</span>
                            </div>
                        </div>

                        {/* Waveform visualization */}
                        <div className="flex items-center justify-center gap-1 h-16 mb-4">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={isPlaying ? {
                                        scaleY: [0.3, Math.random() * 0.7 + 0.3, 0.3]
                                    } : { scaleY: 0.3 }}
                                    transition={{
                                        duration: 0.3 + Math.random() * 0.3,
                                        repeat: Infinity,
                                        repeatType: 'reverse'
                                    }}
                                    className="w-1.5 h-full bg-gradient-to-t from-indigo-600 to-purple-400 rounded origin-bottom"
                                />
                            ))}
                        </div>

                        {/* Progress bar */}
                        <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                            <motion.div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Time display */}
                        <div className="flex justify-between text-xs text-slate-400 font-mono mb-4">
                            <span>{formatTime((progress / 100) * duration)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={togglePlay}
                                className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full 
                  flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            >
                                {isPlaying ? (
                                    <Pause className="w-6 h-6 text-white" />
                                ) : (
                                    <Play className="w-6 h-6 text-white ml-1" />
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Complete State */}
                {phase === 'complete' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 text-center py-4"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 10 }}
                            className="text-5xl mb-4"
                        >
                            ✅
                        </motion.div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            通信完了
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Day {day} の通信を受信しました
                        </p>
                        <button
                            onClick={() => setPhase('playing')}
                            className="px-6 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600 transition"
                        >
                            もう一度聴く
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrinityCodePlayer;
