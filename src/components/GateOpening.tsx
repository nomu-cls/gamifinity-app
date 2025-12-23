import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadarChart from './RadarChart';
import MatrixRain from './MatrixRain';

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
    const [phase, setPhase] = useState<'choice' | 'glitch' | 'scan' | 'transmission' | 'complete'>('choice');
    const [selectedPill, setSelectedPill] = useState<'red' | 'blue' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [scanProgress, setScanProgress] = useState(0);
    const [chartValues, setChartValues] = useState({
        ego_observation: 0,
        ego_control: 0,
        ego_efficacy: 0,
        ego_affirmation: 0,
        stress_tolerance: 0
    });

    // Transmission text
    const transmissionText = `Transmission ID: TC-001
Status: OS Updating...

「おめでとう、コマンダー。
あなたは今、正解を求める『思考の牢獄』から抜け出し、
『感覚の光』という真実へ戻る道を選びました。

ここから21日間、あなたの内側で眠っていた
『TRINITY CODE（観る・結ぶ・顕れる）』を再起動します。

最初のゲートは『赤：動こう』。
理由ではなく、あなたの内なる『衝動』の火を灯してください。

準備はいいですか？」`;

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

    // Glitch SE
    const playGlitchSound = useCallback(() => {
        try {
            const audio = new Audio('/audio/se/glitch.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => { });
        } catch (e) {
            console.log('Audio not available');
        }
    }, []);

    // Typewriter effect
    useEffect(() => {
        if (phase === 'transmission') {
            let index = 0;
            const timer = setInterval(() => {
                if (index < transmissionText.length) {
                    setDisplayedText(transmissionText.slice(0, index + 1));
                    index++;
                } else {
                    clearInterval(timer);
                }
            }, 30);
            return () => clearInterval(timer);
        }
    }, [phase, transmissionText]);

    // Scan animation
    useEffect(() => {
        if (phase === 'scan') {
            const timer = setInterval(() => {
                setScanProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);
                        // Animate chart values
                        const baseValues = { ego_observation: 20, ego_control: 15, ego_efficacy: 25, ego_affirmation: 20, stress_tolerance: 15 };
                        setChartValues(baseValues);
                        setTimeout(() => setPhase('transmission'), 1500);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 50);
            return () => clearInterval(timer);
        }
    }, [phase]);

    // 赤いカプセル選択
    const handleRedPill = async () => {
        setSelectedPill('red');
        setIsLoading(true);
        playGlitchSound();

        // Glitch phase
        setPhase('glitch');

        setTimeout(() => {
            playIgnitionSound();
            setPhase('scan');
        }, 1500);

        // エントリー処理
        try {
            await onEnroll();
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

    // Complete handler
    const handleComplete = () => {
        playGateOpenSound();
        setPhase('complete');
    };

    // 脳タイプに応じた色
    const brainTypeColors: Record<string, string> = {
        left_3d: 'from-blue-500 to-cyan-400',
        left_2d: 'from-green-500 to-emerald-400',
        right_3d: 'from-purple-500 to-pink-400',
        right_2d: 'from-orange-500 to-yellow-400',
    };

    const typeGradient = brainTypeColors[brainType] || 'from-purple-500 to-blue-400';

    // Matrix Rain Column - more authentic dense effect
    const MatrixColumn = ({ x, speed, initialDelay }: { x: number; speed: number; initialDelay: number }) => {
        const chars = Array.from({ length: 25 }, () =>
            String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
        );

        return (
            <motion.div
                className="absolute flex flex-col font-mono text-xs leading-none"
                initial={{ y: '-100%' }}
                animate={{ y: '100vh' }}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    delay: initialDelay,
                    ease: 'linear'
                }}
                style={{ left: `${x}%` }}
            >
                {chars.map((char, i) => (
                    <span
                        key={i}
                        className="h-4"
                        style={{
                            color: i === 0 ? '#ffffff' : `rgba(34, 197, 94, ${1 - (i * 0.04)})`,
                            textShadow: i === 0 ? '0 0 10px #fff, 0 0 20px #22c55e' : i < 5 ? '0 0 5px #22c55e' : 'none'
                        }}
                    >
                        {char}
                    </span>
                ))}
            </motion.div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
            {/* デジタルレイン背景 - Canvas based for smooth animation */}
            <MatrixRain opacity={0.8} />

            {/* Scanlines overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.1) 2px, rgba(0, 255, 0, 0.1) 4px)'
                }}
            />

            <AnimatePresence mode="wait">
                {/* Phase 1: カプセル選択 (Matrix Edition) */}
                {phase === 'choice' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 text-center px-6 py-8 max-w-lg bg-black/70 backdrop-blur-sm rounded-2xl border border-green-500/20"
                    >
                        {/* System Error Header */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mb-8"
                        >
                            <div className="inline-block px-4 py-2 bg-green-900/50 border border-green-500/50 rounded mb-4">
                                <span className="text-green-400 font-mono text-xs tracking-wider animate-pulse">
                                    ⚠️ SYSTEM ERROR
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-mono font-bold text-green-400 mb-2" style={{ textShadow: '0 0 10px #22c55e, 0 0 20px #22c55e' }}>
                                才能渋滞を検知しました
                            </h1>
                            <p className="text-green-400 font-mono text-sm" style={{ textShadow: '0 0 5px #22c55e' }}>
                                真実のOSを起動しますか？
                            </p>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-green-400 mb-12 leading-relaxed font-mono text-sm"
                            style={{ textShadow: '0 0 5px #22c55e' }}
                        >
                            {userName}さん、コマンダーへの昇格おめでとうございます。
                            <br />
                            選択の時が来ました。
                        </motion.p>

                        {/* カプセル選択 (Matrix Style) */}
                        <div className="flex justify-center gap-8 md:gap-16">
                            {/* 赤いカプセル */}
                            <motion.button
                                initial={{ x: -50, opacity: 0 }}
                                animate={{
                                    x: 0,
                                    opacity: 1,
                                    y: [0, -8, 0]
                                }}
                                transition={{
                                    delay: 1,
                                    y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                                }}
                                whileHover={{ scale: 1.1, boxShadow: '0 0 50px rgba(239,68,68,0.8)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRedPill}
                                disabled={isLoading}
                                className={`flex flex-col items-center gap-4 p-4 rounded-xl border border-red-500/30 bg-black/50
                                    ${selectedPill === 'red' ? 'opacity-100 border-red-500' :
                                        selectedPill === 'blue' ? 'opacity-30' : 'opacity-100'}`}
                            >
                                <motion.div
                                    className="w-16 h-24 bg-gradient-to-b from-red-500 to-red-700 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                                    animate={{ rotate: -70 }}
                                    whileHover={{ rotate: -60 }}
                                >
                                    <div className="w-full h-1/2 bg-gradient-to-b from-red-400 to-red-500 rounded-t-full" />
                                </motion.div>
                                <span className="text-green-400 font-mono font-bold" style={{ textShadow: '0 0 5px #22c55e' }}>[ 点火 ]</span>
                                <span className="text-green-400 text-xs font-mono text-center leading-relaxed" style={{ textShadow: '0 0 3px #22c55e' }}>
                                    『感覚の光』を<br />取り戻す旅へ
                                </span>
                            </motion.button>

                            {/* 青いカプセル */}
                            <motion.button
                                initial={{ x: 50, opacity: 0 }}
                                animate={{
                                    x: 0,
                                    opacity: 1,
                                    y: [0, -8, 0]
                                }}
                                transition={{
                                    delay: 1.2,
                                    y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBluePill}
                                disabled={isLoading}
                                className={`flex flex-col items-center gap-4 p-4 rounded-xl border border-blue-500/30 bg-black/50
                                    ${selectedPill === 'blue' ? 'opacity-100 border-blue-500' :
                                        selectedPill === 'red' ? 'opacity-30' : 'opacity-100'}`}
                            >
                                <motion.div
                                    className="w-16 h-24 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                                    animate={{ rotate: 70 }}
                                    whileHover={{ rotate: 60 }}
                                >
                                    <div className="w-full h-1/2 bg-gradient-to-b from-blue-400 to-blue-500 rounded-t-full" />
                                </motion.div>
                                <span className="text-green-400 font-mono font-bold" style={{ textShadow: '0 0 5px #22c55e' }}>[ 保留 ]</span>
                                <span className="text-green-400 text-xs font-mono text-center leading-relaxed" style={{ textShadow: '0 0 3px #22c55e' }}>
                                    思考の重力<br />(Gravity)に留まる
                                </span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Phase 2: Glitch Effect */}
                {phase === 'glitch' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 text-center"
                    >
                        <motion.div
                            animate={{
                                x: [0, -5, 5, -3, 3, 0],
                                filter: [
                                    'hue-rotate(0deg)',
                                    'hue-rotate(90deg)',
                                    'hue-rotate(-90deg)',
                                    'hue-rotate(45deg)',
                                    'hue-rotate(0deg)'
                                ]
                            }}
                            transition={{ duration: 0.3, repeat: 4 }}
                            className="text-6xl font-mono font-bold text-green-400"
                        >
                            SYSTEM
                        </motion.div>
                        <motion.div
                            animate={{ opacity: [1, 0, 1, 0, 1] }}
                            transition={{ duration: 0.5, repeat: 2 }}
                            className="text-2xl font-mono text-red-400 mt-4"
                        >
                            [ OVERRIDE ]
                        </motion.div>
                    </motion.div>
                )}

                {/* Phase 3: Scan Animation */}
                {phase === 'scan' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 text-center px-6"
                    >
                        <div className="font-mono text-green-400 mb-6 text-sm">
                            <span className="animate-pulse">現在の機体スペックをスキャン中...</span>
                        </div>

                        {/* Radar Chart Animation */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex justify-center mb-6"
                        >
                            <RadarChart
                                stats={chartValues}
                                size={200}
                                primaryColor="#22c55e"
                                animated={true}
                            />
                        </motion.div>

                        {/* Progress Bar */}
                        <div className="max-w-xs mx-auto">
                            <div className="h-2 bg-green-900/50 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-green-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${scanProgress}%` }}
                                />
                            </div>
                            <div className="text-green-400 font-mono text-xs mt-2">
                                {scanProgress}% COMPLETE
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Phase 4: Transmission (Typewriter) */}
                {phase === 'transmission' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 text-left px-6 max-w-lg"
                    >
                        <div className="bg-black/80 border border-green-500/30 rounded-lg p-6 font-mono">
                            <div className="text-green-400 text-xs mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                INCOMING TRANSMISSION
                            </div>

                            <pre className="text-green-300 text-sm whitespace-pre-wrap leading-relaxed">
                                {displayedText}
                                <span className="animate-pulse">▌</span>
                            </pre>

                            {displayedText.length === transmissionText.length && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    onClick={handleComplete}
                                    className="mt-6 w-full py-3 bg-green-600 hover:bg-green-500 text-black font-bold rounded-lg transition"
                                >
                                    [ ENTER ]
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Phase 5: ゲート開放完了 */}
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
                            <h2 className="text-3xl font-mono font-bold text-green-400">
                                GATE OPENED
                            </h2>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-green-300 text-xl mb-4 font-mono"
                        >
                            ようこそ、{userName}コマンダー
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-green-400/70 mb-8 font-mono text-sm"
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
