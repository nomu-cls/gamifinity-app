import React from 'react';
import { motion } from 'framer-motion';
import RadarChart from './RadarChart';

interface EgoStats {
    ego_observation: number;
    ego_control: number;
    ego_efficacy: number;
    ego_affirmation: number;
    stress_tolerance: number;
}

interface PointCardProps {
    userName: string;
    brainType: string;
    stats: EgoStats;
    totalMiles: number;
    programDay: number;
    rank?: 'passenger' | 'crew' | 'pilot' | 'commander';
    onClose?: () => void;
}

const PointCard: React.FC<PointCardProps> = ({
    userName,
    brainType,
    stats,
    totalMiles,
    programDay,
    rank = 'passenger',
    onClose
}) => {
    // Brain type display names
    const brainTypeNames: Record<string, string> = {
        left_3d: '左脳3D型',
        left_2d: '左脳2D型',
        right_3d: '右脳3D型',
        right_2d: '右脳2D型'
    };

    // Brain type colors
    const brainTypeColors: Record<string, { primary: string; gradient: string }> = {
        left_3d: { primary: '#3B82F6', gradient: 'from-blue-600 to-cyan-500' },
        left_2d: { primary: '#10B981', gradient: 'from-green-600 to-emerald-500' },
        right_3d: { primary: '#8B5CF6', gradient: 'from-purple-600 to-pink-500' },
        right_2d: { primary: '#F59E0B', gradient: 'from-orange-600 to-yellow-500' }
    };

    // Rank display
    const rankInfo: Record<string, { label: string; icon: string; color: string }> = {
        passenger: { label: 'PASSENGER', icon: '🎫', color: 'text-slate-400' },
        crew: { label: 'CREW', icon: '👨‍✈️', color: 'text-blue-400' },
        pilot: { label: 'PILOT', icon: '✈️', color: 'text-purple-400' },
        commander: { label: 'COMMANDER', icon: '🌟', color: 'text-yellow-400' }
    };

    const typeColor = brainTypeColors[brainType] || brainTypeColors.right_3d;
    const currentRank = rankInfo[rank];
    const totalStats = Object.values(stats).reduce((sum, val) => sum + val, 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm mx-auto"
        >
            {/* Card Container */}
            <div
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${typeColor.gradient} p-1`}
                style={{
                    boxShadow: `0 0 40px rgba(139, 92, 246, 0.4)`
                }}
            >
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-[22px] p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-white/60 text-xs uppercase tracking-wider">TALENTFLOW SPACELINES</p>
                            <h2 className="text-white text-xl font-bold">{userName}</h2>
                        </div>
                        <div className="text-right">
                            <p className={`text-xs font-bold ${currentRank.color}`}>
                                {currentRank.icon} {currentRank.label}
                            </p>
                            <p className="text-white/60 text-xs mt-1">Day {programDay}/21</p>
                        </div>
                    </div>

                    {/* Brain Type Badge */}
                    <div className="flex items-center justify-center mb-4">
                        <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${typeColor.gradient} text-white text-sm font-bold`}>
                            {brainTypeNames[brainType] || brainType}
                        </div>
                    </div>

                    {/* Radar Chart */}
                    <div className="flex justify-center mb-6">
                        <RadarChart
                            stats={stats}
                            size={220}
                            primaryColor={typeColor.primary}
                        />
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <p className="text-white/60 text-xs">総合スコア</p>
                            <p className="text-2xl font-bold text-white">{totalStats}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <p className="text-white/60 text-xs">マイル</p>
                            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                                {totalMiles.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative mb-4">
                        <div className="flex justify-between text-xs text-white/60 mb-1">
                            <span>進行度</span>
                            <span>{Math.round((programDay / 21) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(programDay / 21) * 100}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full bg-gradient-to-r ${typeColor.gradient}`}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-white/40">
                        <span>21日間プログラム</span>
                        <span>#{new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>

            {/* Close button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                    閉じる
                </button>
            )}
        </motion.div>
    );
};

export default PointCard;
