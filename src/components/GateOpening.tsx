import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GateOpeningProps {
    userName: string;
    brainType: string;
    onEnroll: () => Promise<void>;
    onSkip: () => void;
}

const GateOpening: React.FC<GateOpeningProps> = ({
    userName,
    brainType,
    onEnroll,
    onSkip
}) => {
    const [phase, setPhase] = useState<'choice' | 'ignition' | 'complete'>('choice');
    const [selectedPill, setSelectedPill] = useState<'red' | 'blue' | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // ゲート開放SE再生
    const playGateOpenSound = useCallback(() => {
        try {
            const audio = new Audio('/audio/se/gate-open.mp3');
            audio.volume = 0.7;
            audio.play().catch(() => { });
        } catch (e) {
            console.log('Audio not available');
        }
    }, []);

    // 点火SE再生
    const playIgnitionSound = useCallback(() => {
        try {
            const audio = new Audio('/audio/se/ignition.mp3');
            audio.volume = 0.8;
            audio.play().catch(() => { });
        } catch (e) {
            console.log('Audio not available');
        }
    }, []);

    // 赤いカプセル選択
    const handleRedPill = async () => {
        setSelectedPill('red');
        setIsLoading(true);

        // 点火演出開始
        playIgnitionSound();
        setPhase('ignition');

        // エントリー処理
        try {
            await onEnroll();

            // 演出完了後にゲート開放
            setTimeout(() => {
                playGateOpenSound();
                setPhase('complete');
            }, 3000);
        } catch (error) {
            console.error('Enrollment failed:', error);
            setIsLoading(false);
            setPhase('choice');
        }
    };

    // 青いカプセル選択
    const handleBluePill = () => {
        setSelectedPill('blue');
        setTimeout(() => {
            onSkip();
        }, 1000);
    };

    // 脳タイプに応じた色
    const brainTypeColors: Record<string, string> = {
        left_3d: 'from-blue-500 to-cyan-400',
        left_2d: 'from-green-500 to-emerald-400',
        right_3d: 'from-purple-500 to-pink-400',
        right_2d: 'from-orange-500 to-yellow-400',
    };

    const typeGradient = brainTypeColors[brainType] || 'from-purple-500 to-blue-400';

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
            {/* マトリックス風背景 */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-green-500/30 text-xs font-mono"
                        initial={{
                            y: -20,
                            x: Math.random() * window.innerWidth,
                            opacity: 0
                        }}
                        animate={{
                            y: window.innerHeight + 20,
                            opacity: [0, 1, 1, 0]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                    >
                        {String.fromCharCode(0x30A0 + Math.random() * 96)}
                    </motion.div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* Phase 1: カプセル選択 */}
                {phase === 'choice' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 text-center px-6 max-w-lg"
                    >
                        <motion.h1
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-3xl md:text-4xl font-bold text-white mb-6"
                        >
                            {userName}さん、
                            <br />
                            <span className="text-green-400">運命の選択</span>です
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-white/70 mb-12 leading-relaxed"
                        >
                            コマンダーへの昇格、おめでとうございます！
                            <br />
                            これから21日間、本当の自分を取り戻す旅が始まります。
                        </motion.p>

                        {/* カプセル選択 */}
                        <div className="flex justify-center gap-8 md:gap-16">
                            {/* 赤いカプセル */}
                            <motion.button
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRedPill}
                                disabled={isLoading}
                                className={`flex flex-col items-center gap-4 ${selectedPill === 'red' ? 'opacity-100' :
                                    selectedPill === 'blue' ? 'opacity-30' : 'opacity-100'
                                    }`}
                            >
                                <div className="w-20 h-28 bg-gradient-to-b from-red-500 to-red-700 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:shadow-[0_0_50px_rgba(239,68,68,0.8)] transition-shadow">
                                    <div className="w-full h-1/2 bg-gradient-to-b from-red-400 to-red-500 rounded-t-full" />
                                </div>
                                <span className="text-red-400 font-bold text-lg">点火する</span>
                                <span className="text-white/50 text-sm">21日間の旅へ</span>
                            </motion.button>

                            {/* 青いカプセル */}
                            <motion.button
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBluePill}
                                disabled={isLoading}
                                className={`flex flex-col items-center gap-4 ${selectedPill === 'blue' ? 'opacity-100' :
                                    selectedPill === 'red' ? 'opacity-30' : 'opacity-100'
                                    }`}
                            >
                                <div className="w-20 h-28 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] transition-shadow">
                                    <div className="w-full h-1/2 bg-gradient-to-b from-blue-400 to-blue-500 rounded-t-full" />
                                </div>
                                <span className="text-blue-400 font-bold text-lg">保留する</span>
                                <span className="text-white/50 text-sm">あとで考える</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Phase 2: 点火演出 */}
                {phase === 'ignition' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 text-center"
                    >
                        {/* 点火アニメーション */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.5, 1] }}
                            transition={{ duration: 1.5 }}
                            className={`w-48 h-48 rounded-full bg-gradient-to-br ${typeGradient} 
                shadow-[0_0_100px_rgba(255,255,255,0.8)] mx-auto mb-8`}
                        >
                            <motion.div
                                animate={{
                                    boxShadow: [
                                        '0 0 20px rgba(255,255,255,0.5)',
                                        '0 0 60px rgba(255,255,255,0.8)',
                                        '0 0 20px rgba(255,255,255,0.5)'
                                    ]
                                }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-full h-full rounded-full flex items-center justify-center"
                            >
                                <span className="text-6xl">🚀</span>
                            </motion.div>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-3xl font-bold text-white"
                        >
                            IGNITION
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="text-white/70 mt-4"
                        >
                            点火シーケンス開始...
                        </motion.p>

                        {/* プログレスバー */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2.5 }}
                            className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 mt-8 mx-auto max-w-xs rounded-full"
                        />
                    </motion.div>
                )}

                {/* Phase 3: ゲート開放完了 */}
                {phase === 'complete' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 text-center px-6"
                    >
                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="mb-8"
                        >
                            <div className="text-6xl mb-4">🛸</div>
                            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                                GATE OPENED
                            </h2>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-white text-xl mb-4"
                        >
                            ようこそ、{userName}さん
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-white/70 mb-8"
                        >
                            21日間の航海が始まります
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            onClick={onSkip}
                            className={`px-8 py-4 bg-gradient-to-r ${typeGradient} text-white font-bold rounded-2xl
                shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1`}
                        >
                            コックピットへ進む
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GateOpening;
