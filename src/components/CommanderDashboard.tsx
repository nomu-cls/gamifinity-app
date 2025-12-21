import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserStory, SiteSettings } from '../lib/supabase';
import { DailyNavigationModal } from './DailyNavigationModal';
import { Compass, Lock, Star, CheckCircle2, ChevronRight, Gift, Activity, CloudSun, Play, Pause, Headphones, Settings, Rocket, Moon, Sun, FileText, Loader2, Sparkles, Volume2, LogOut } from 'lucide-react';
import {
    FlightLog,
    getTodaysLog as getFlightLog,
    getRecentLogs,
    saveNightLog,
    getTotalPoints
} from '../lib/flightLog';

interface Props {
    story: UserStory;
    siteSettings: SiteSettings | null;
    onUpdate: (updates: Partial<UserStory>) => void;
    onViewRewards: () => void;
    onViewArchives: () => void;
    onStartCheckin: () => void;
    onViewBoardingPass: () => void;
    onRefresh?: () => Promise<void>;
    onViewSettings?: () => void;
    onViewGakka?: () => void;
    onLogout?: () => void;
}

const CommanderDashboard: React.FC<Props> = ({ story, siteSettings, onUpdate, onStartCheckin, onViewBoardingPass, onRefresh, onViewSettings, onLogout }) => {
    const [showDailyModal, setShowDailyModal] = useState(false);
    const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [isNightPlaying, setIsNightPlaying] = useState(false);
    const nightAudioRef = useRef<HTMLAudioElement>(null);
    const [audioVolume, setAudioVolume] = useState(0.7);

    // Volume change handler
    const handleVolumeChange = (value: number) => {
        setAudioVolume(value);
        if (audioRef.current) audioRef.current.volume = value;
        if (nightAudioRef.current) nightAudioRef.current.volume = value;
    };

    // ===== Flight Log States =====
    const [flightLog, setFlightLog] = useState<FlightLog | null>(null);
    const [recentLogs, setRecentLogs] = useState<FlightLog[]>([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [showNightLog, setShowNightLog] = useState(false);
    const [showMissionArchive, setShowMissionArchive] = useState<number | null>(null);
    const [gratitudeInput, setGratitudeInput] = useState('');
    const [missionCompleteCheck, setMissionCompleteCheck] = useState(false);
    const [isSavingNight, setIsSavingNight] = useState(false);
    const [pointsAnimation, setPointsAnimation] = useState<{ show: boolean; amount: number }>({ show: false, amount: 0 });

    // Fetch flight log data on mount
    useEffect(() => {
        const loadFlightData = async () => {
            if (!story.line_user_id) return;

            const [todayLog, recent, points] = await Promise.all([
                getFlightLog(story.line_user_id),
                getRecentLogs(story.line_user_id, 3),
                getTotalPoints(story.line_user_id)
            ]);

            setFlightLog(todayLog);
            setRecentLogs(recent);
            setTotalPoints(points);
        };

        loadFlightData();
    }, [story.line_user_id]);

    // Show points animation
    const showPointsEarned = (amount: number) => {
        setPointsAnimation({ show: true, amount });
        setTimeout(() => setPointsAnimation({ show: false, amount: 0 }), 2000);
    };

    // Save night log handler
    const handleSaveNightLog = async () => {
        if (!story.line_user_id || isSavingNight) return;

        setIsSavingNight(true);
        const gratitudeList = gratitudeInput.split('\n').filter(g => g.trim());
        const result = await saveNightLog(story.line_user_id, gratitudeList, missionCompleteCheck);

        if (result.success) {
            showPointsEarned(result.points);
            setTotalPoints(prev => prev + result.points);
            setShowNightLog(false);
            setGratitudeInput('');
            setMissionCompleteCheck(false);

            // Refresh flight log
            const updatedLog = await getFlightLog(story.line_user_id);
            setFlightLog(updatedLog);
        }
        setIsSavingNight(false);
    };

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                // Stop other audio if playing
                if (isNightPlaying && nightAudioRef.current) {
                    nightAudioRef.current.pause();
                    setIsNightPlaying(false);
                }
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleNightAudio = () => {
        if (nightAudioRef.current) {
            if (isNightPlaying) {
                nightAudioRef.current.pause();
            } else {
                // Stop other audio if playing
                if (isPlaying && audioRef.current) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                }
                nightAudioRef.current.play();
            }
            setIsNightPlaying(!isNightPlaying);
        }
    };

    // Analyze daily logs to determine progress
    const completedDates = useMemo(() => {
        const logs = story.daily_logs || {};
        return Object.keys(logs).filter(date => logs[date].mission_completed);
    }, [story.daily_logs]);

    const totalStamps = completedDates.length;

    // Calculate current streak (consecutive days ending today or yesterday)
    const currentStreak = useMemo(() => {
        const logs = story.daily_logs || {};
        const sortedDates = Object.keys(logs)
            .filter(date => logs[date].mission_completed)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (sortedDates.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedDates.length; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const checkDateStr = checkDate.toISOString().split('T')[0];

            if (sortedDates.includes(checkDateStr)) {
                streak++;
            } else if (i === 0) {
                // If today is not completed, check if yesterday starts a streak
                continue;
            } else {
                break;
            }
        }
        return streak;
    }, [story.daily_logs]);

    // Check if milestone just reached
    const justReachedMilestone = totalStamps === 7 || totalStamps === 14 || totalStamps === 21;
    const currentMilestone = totalStamps >= 21 ? 21 : totalStamps >= 14 ? 14 : totalStamps >= 7 ? 7 : 0;

    // Checkin is just having a log for today (regardless of mission completion)
    const today = new Date().toISOString().split('T')[0];
    const todaysLog = story.daily_logs?.[today];
    const hasCheckin = !!todaysLog;

    const handleMissionComplete = async () => {
        if (!todaysLog) return;

        try {
            const updatedLog = { ...todaysLog, mission_completed: true };
            const currentLogs = story.daily_logs || {};
            const updatedLogs = { ...currentLogs, [today]: updatedLog };

            // Optimistic update
            onUpdate({ daily_logs: updatedLogs });
        } catch (err) {
            console.error('Failed to complete mission:', err);
        }
    };

    const tabs = [
        { start: 1, end: 7, label: '1st Week: 外在化', benefit: 'マモルを安心させる音声' },
        { start: 8, end: 14, label: '2nd Week: 実験', benefit: 'ドラゴンの秘儀 PDF' },
        { start: 15, end: 21, label: '3rd Week: 至福', benefit: 'コマンダー認定証' }
    ];

    const StampGrid = ({ start, end, benefit }: { start: number; end: number; benefit: string }) => {
        const days = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        const isBenefitUnlocked = totalStamps >= end;

        return (
            <div className="p-4">
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {days.map(day => {
                        const isStamped = totalStamps >= day;
                        const isNext = totalStamps === day - 1;

                        return (
                            <div key={day} className="flex flex-col items-center gap-1">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${isStamped
                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-none shadow-[0_0_15px_rgba(250,204,21,0.6)] transform scale-105'
                                    : isNext
                                        ? 'bg-white/10 border-indigo-400/50 border-dashed animate-pulse text-indigo-300'
                                        : 'bg-white/5 border-white/10 text-gray-500'
                                    }`}>
                                    {isStamped ? (
                                        <Star size={24} className="text-white fill-white" />
                                    ) : (
                                        <span className="font-bold text-sm">{day}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {/* Benefit Slot */}
                    <div className="flex flex-col items-center gap-1">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${isBenefitUnlocked
                            ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] cursor-pointer border-indigo-400'
                            : 'bg-white/5 border-white/10 text-gray-500'
                            }`}>
                            <Gift size={24} />
                        </div>
                        <span className="text-[10px] text-gray-400 text-center leading-tight">Benefit</span>
                    </div>
                </div>

                <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-indigo-500/30 ${isBenefitUnlocked ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0 border border-indigo-500/40">
                        {isBenefitUnlocked ? <CheckCircle2 size={20} className="text-indigo-400" /> : <Lock size={20} className="text-gray-500" />}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-indigo-300">STAGE CLEAR BONUS</p>
                        <p className="text-sm font-bold text-gray-200">{benefit}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-md mx-auto min-h-screen pb-24 text-white relative overflow-hidden">
            {/* Cosmic Background - Unified Dark Theme */}
            <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-[#0F172A] to-black" />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent opacity-50" />
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white opacity-40 animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 2 + 1}px`,
                            height: `${Math.random() * 2 + 1}px`,
                            animationDuration: `${Math.random() * 5 + 3}s`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10">
                {/* --- Header --- */}
                <div className="bg-black/30 backdrop-blur-lg rounded-b-[2.5rem] shadow-lg p-4 pt-2 mb-4 border-b border-white/10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-white tracking-wide drop-shadow-md">Gamifinity</h1>
                            <p className="text-xs text-indigo-300 font-bold tracking-widest font-sans-rounded mt-1">COMMANDER DASHBOARD</p>
                        </div>

                        {/* Points Display - Prominent */}
                        <div className="relative">
                            <div className="flex flex-col items-center px-4 py-2 bg-gradient-to-br from-yellow-500/30 to-amber-600/30 backdrop-blur-md border border-yellow-400/40 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                                <div className="flex items-center gap-1.5">
                                    <Rocket size={18} className="text-yellow-300" />
                                    <span className="text-2xl font-bold text-yellow-200 font-mono">{totalPoints}</span>
                                    <span className="text-xs font-bold text-yellow-400">pt</span>
                                </div>
                                <span className="text-[9px] text-yellow-300/70 font-bold tracking-wider">FLIGHT POINTS</span>
                            </div>
                            {/* Points Animation */}
                            {pointsAnimation.show && (
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-yellow-300 animate-bounce bg-yellow-500/30 px-3 py-1 rounded-full">
                                    +{pointsAnimation.amount}pt!
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {/* Boarding Pass Replay */}
                            <button
                                onClick={onViewBoardingPass}
                                className="p-2.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 hover:bg-blue-500/30 transition-colors shadow-sm backdrop-blur-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="8" x="2" y="6" rx="1" ry="1" /><rect width="20" height="8" x="2" y="14" rx="1" ry="1" /><path d="M6 6v16" /><path d="M18 6v16" /></svg>
                            </button>
                            {/* Settings */}
                            {onViewSettings && (
                                <button onClick={onViewSettings} className="p-2.5 bg-gray-500/20 border border-gray-500/30 rounded-full text-gray-300 hover:bg-gray-500/30 transition-colors shadow-sm backdrop-blur-sm">
                                    <Settings size={22} />
                                </button>
                            )}
                            {/* Logout */}
                            {onLogout && (
                                <button
                                    onClick={onLogout}
                                    className="p-2.5 bg-gray-500/20 border border-gray-500/30 rounded-full text-gray-400 hover:bg-gray-500/30 hover:text-gray-300 transition-colors shadow-sm backdrop-blur-sm"
                                    title="ログアウト"
                                >
                                    <LogOut size={22} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Brain Type & Equation */}
                    <div className="bg-white/5 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden mb-6 group border border-white/10 backdrop-blur-md">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full transform translate-x-12 -translate-y-12 blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full transform -translate-x-10 translate-y-10 blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold backdrop-blur-md border border-white/20 tracking-wider text-indigo-200">
                                    Class: {story.brain_type || 'UNKNOWN'}
                                </span>
                            </div>

                            {/* Updated Equation Layout with Crew on Left */}
                            <div className="flex items-center gap-4">
                                {/* Crew Image - Based on brain_type */}
                                <div className="relative flex-shrink-0">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 blur-md opacity-60 animate-pulse" />
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                                        <img
                                            src={`/characters/${story.brain_type === 'left_3d' ? 'sora' : story.brain_type === 'right_3d' ? 'mamoru' : story.brain_type === 'left_2d' ? 'shin' : story.brain_type === 'right_2d' ? 'piku' : 'sora'}.png`}
                                            alt="Crew"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Equation */}
                                <div className="text-center flex-1">
                                    <p className="text-sm text-gray-400 font-bold tracking-widest mb-2 uppercase">Core Equation</p>
                                    <div className="font-serif text-lg leading-relaxed inline-block">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-100 to-yellow-200 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                                                才能フロー
                                            </span>
                                            <span className="text-white mx-1 opacity-80">=</span>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            {/* Numerator */}
                                            <div className="flex items-center gap-1.5 px-2 text-base font-medium">
                                                <span className="text-cyan-300 drop-shadow-sm">脳の偏り</span>
                                                <span className="text-white/40 text-xs">×</span>
                                                <span className="text-rose-300 drop-shadow-sm">価値観</span>
                                                <span className="text-white/40 text-xs">×</span>
                                                <span className="text-emerald-300 drop-shadow-sm">環境</span>
                                            </div>

                                            {/* Divider */}
                                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent my-1.5" />

                                            {/* Denominator */}
                                            <div className="text-purple-300 font-medium drop-shadow-sm">
                                                抵抗(ブレーキ)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ===== CREW ENCOURAGEMENT MESSAGE ===== */}
                <div className="px-4 mb-4">
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-900/40 to-purple-900/30 rounded-2xl border border-indigo-500/20">
                        <img
                            src={`/characters/${story.brain_type === 'left_3d' ? 'sora' : story.brain_type === 'right_3d' ? 'mamoru' : story.brain_type === 'left_2d' ? 'shin' : 'piku'}.png`}
                            alt="Crew"
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shrink-0"
                        />
                        <div className="flex-1">
                            <p className="text-[10px] text-indigo-300 font-bold mb-1">
                                {story.brain_type === 'left_3d' ? 'ソラ' : story.brain_type === 'right_3d' ? 'マモル' : story.brain_type === 'left_2d' ? 'シン' : 'ピク'}からのメッセージ
                            </p>
                            <p className="text-sm text-white leading-relaxed">
                                {currentStreak === 0 && totalStamps === 0 && (
                                    <>「準備ができてから飛ぶのではなく、飛ぶことで地図が描かれていく。」<br /><span className="text-indigo-300 text-xs">今日の一歩が、明日の銀河を創り出します ✨</span></>
                                )}
                                {currentStreak === 0 && totalStamps > 0 && (
                                    <>「飛ぶことで地図が描かれていく。」<br /><span className="text-indigo-300 text-xs">お帰りなさい、コマンダー。また一緒に飛びましょう 🚀</span></>
                                )}
                                {currentStreak >= 1 && currentStreak < 7 && (
                                    <>「飛ぶことで地図が描かれていく。」<br /><span className="text-indigo-300 text-xs">{currentStreak}日連続の軌道を描いています 🔥</span></>
                                )}
                                {currentStreak >= 7 && totalStamps < 21 && (
                                    <>「飛ぶことで地図が描かれていく。」<br /><span className="text-indigo-300 text-xs">{currentStreak}日連続達成！あなたの軌道は確実に拡張されています 💫</span></>
                                )}
                                {totalStamps >= 21 && (
                                    <>「準備ができてから飛ぶのではなく、飛ぶことで地図が描かれた。」<br /><span className="text-indigo-300 text-xs">自由航行軌道に到達。おめでとうございます 🚀✨</span></>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="px-4 mb-6">
                    <div className="relative bg-gradient-to-b from-slate-900/80 to-indigo-950/60 backdrop-blur-xl rounded-[2rem] border border-cyan-400/20 overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                        {/* Grid Background */}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'linear-gradient(transparent 95%, rgba(34,211,238,0.3) 95%), linear-gradient(90deg, transparent 95%, rgba(34,211,238,0.3) 95%)',
                            backgroundSize: '20px 20px'
                        }} />

                        {/* Top Edge Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

                        {/* Header */}
                        <div className="text-center py-4 border-b border-white/5 relative">
                            <h2 className="text-xl font-serif text-cyan-300 tracking-widest uppercase italic" style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>
                                HANGAR
                            </h2>
                        </div>

                        {/* Content Grid */}
                        <div className="p-4 space-y-4 relative z-10">
                            {/* Audio Resources - 2 columns */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Track 1: Morning Flight */}
                                <div className="relative rounded-2xl p-4 border transition-all duration-300 flex flex-col items-center justify-center gap-3 group bg-slate-800/50 border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-800/80">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:scale-110 transition-transform">
                                        <button
                                            onClick={toggleAudio}
                                            className="text-white w-full h-full flex items-center justify-center"
                                        >
                                            {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1" />}
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-cyan-400 font-bold tracking-wider mb-1">TRACK 1</p>
                                        <p className="text-white font-bold text-sm">朝のフライトシミュレーション</p>
                                    </div>
                                    <audio ref={audioRef} src="/audio/morning_flight.mp3" onEnded={() => setIsPlaying(false)} />
                                </div>

                                {/* Track 2: Night Flight */}
                                <div className="relative rounded-2xl p-4 border transition-all duration-300 flex flex-col items-center justify-center gap-3 group bg-slate-800/50 border-indigo-500/30 hover:border-indigo-400 hover:bg-slate-800/80">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform">
                                        <button
                                            onClick={toggleNightAudio}
                                            className="text-white w-full h-full flex items-center justify-center"
                                        >
                                            {isNightPlaying ? <Pause size={24} fill="white" /> : <Headphones size={24} />}
                                        </button>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-indigo-400 font-bold tracking-wider mb-1">TRACK 2</p>
                                        <p className="text-white font-bold text-sm">夜のフライトログ</p>
                                    </div>
                                    <audio ref={nightAudioRef} src="/audio/night_flight.mp3" onEnded={() => setIsNightPlaying(false)} />
                                </div>
                            </div>

                            {/* Volume Slider */}
                            <div className="flex items-center gap-3 px-2">
                                <Volume2 size={16} className="text-white/50" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={audioVolume}
                                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                    className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-cyan-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
                                />
                                <span className="text-[10px] text-white/50 w-8 text-right">{Math.round(audioVolume * 100)}%</span>
                            </div>

                            {/* Complete PDF - Subtle */}
                            <a
                                href="https://utagesystem.s3.ap-northeast-1.wasabisys.com/7Ix1BalijQuM/X0UkowBf3Dxo.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-2.5 px-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText size={14} className="text-amber-400" />
                                        <span className="text-xs text-white/70">クルー取扱説明書（完全版）</span>
                                    </div>
                                    <ChevronRight size={14} className="text-white/30" />
                                </div>
                            </a>

                            {/* Mission Archives - Collapsible */}
                            <div className="space-y-2">
                                {/* Mission 1 */}
                                <button
                                    onClick={() => setShowMissionArchive(showMissionArchive === 1 ? null : 1)}
                                    className="w-full py-2 px-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-cyan-500/30 flex items-center justify-center">
                                            <span className="text-[10px] text-cyan-300 font-bold">1</span>
                                        </div>
                                        <span className="text-xs text-white/70">Mission 01: 記憶の森</span>
                                    </div>
                                    <ChevronRight size={14} className={`text-white/30 transition-transform ${showMissionArchive === 1 ? 'rotate-90' : ''}`} />
                                </button>
                                {showMissionArchive === 1 && (
                                    <div className="p-3 bg-slate-900/50 rounded-xl border border-white/10 space-y-3 animate-in slide-in-from-top-2">
                                        <div className="aspect-video bg-black/50 rounded-lg overflow-hidden">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${story.day1_field1 ? 'your-mission1-video-id' : 'dQw4w9WgXcQ'}?rel=0&modestbranding=1`}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                        {story.day1_field1 && (
                                            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                                                <p className="text-[10px] text-white/40 mb-1">YOUR LOG</p>
                                                <p className="text-xs text-white/80">{story.day1_field1}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Mission 2 */}
                                <button
                                    onClick={() => setShowMissionArchive(showMissionArchive === 2 ? null : 2)}
                                    className="w-full py-2 px-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center">
                                            <span className="text-[10px] text-indigo-300 font-bold">2</span>
                                        </div>
                                        <span className="text-xs text-white/70">Mission 02: 才能の泉</span>
                                    </div>
                                    <ChevronRight size={14} className={`text-white/30 transition-transform ${showMissionArchive === 2 ? 'rotate-90' : ''}`} />
                                </button>
                                {showMissionArchive === 2 && (
                                    <div className="p-3 bg-slate-900/50 rounded-xl border border-white/10 space-y-3 animate-in slide-in-from-top-2">
                                        <div className="aspect-video bg-black/50 rounded-lg overflow-hidden">
                                            <iframe
                                                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                        {story.day2_field1 && (
                                            <div className="space-y-2">
                                                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                                                    <p className="text-[10px] text-rose-300 mb-1">抵抗ログ</p>
                                                    <p className="text-xs text-white/80">{story.day2_field1}</p>
                                                </div>
                                                {story.day2_field2 && (
                                                    <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                                                        <p className="text-[10px] text-indigo-300 mb-1">選択したクルー</p>
                                                        <p className="text-xs text-white/80">{story.day2_field2}</p>
                                                    </div>
                                                )}
                                                {story.day2_field3 && (
                                                    <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20">
                                                        <p className="text-[10px] text-emerald-300 mb-1">解析レスポンス</p>
                                                        <p className="text-xs text-white/80">{story.day2_field3}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Unlocked Rewards List - Expandable as points grow */}
                            {totalStamps >= 7 && (
                                <div className="pt-3 border-t border-white/10">
                                    <p className="text-[10px] text-amber-300 font-bold tracking-wider mb-2 uppercase">ボーナス特典</p>
                                    <div className="space-y-2">
                                        {totalStamps >= 7 && (
                                            <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                                                <Gift size={14} className="text-yellow-400 flex-shrink-0" />
                                                <span className="text-xs text-yellow-200">マモルを安心させる音声</span>
                                            </div>
                                        )}
                                        {totalStamps >= 14 && (
                                            <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded-xl border border-purple-500/30">
                                                <Gift size={14} className="text-purple-400 flex-shrink-0" />
                                                <span className="text-xs text-purple-200">ドラゴンの秘儀 PDF</span>
                                            </div>
                                        )}
                                        {totalStamps >= 21 && (
                                            <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-xl border border-amber-500/30">
                                                <Gift size={14} className="text-amber-400 flex-shrink-0" />
                                                <span className="text-xs text-amber-200">コマンダー認定証</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Weather / Check-in State */}
                <div className="px-6 mb-6">
                    {hasCheckin ? (
                        <div className="rounded-[1.5rem] p-[1px] bg-gradient-to-r from-indigo-500/50 to-purple-500/50 shadow-lg">
                            <div className="bg-slate-900/90 rounded-[1.4rem] p-4 flex items-center justify-between backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner text-yellow-400">
                                        <CloudSun size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold font-sans-rounded mb-0.5">現在の状態（天気）</p>
                                        <p className="text-sm font-bold text-gray-200 font-serif">神フロー <span className="text-indigo-400 text-xs font-sans-rounded ml-1">({todaysLog?.metrics?.hrv || '-'})</span></p>
                                    </div>
                                </div>
                                <button
                                    onClick={onStartCheckin}
                                    className="text-xs font-bold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-400/30 px-4 py-2 rounded-full hover:bg-emerald-500/30 transition-all"
                                >
                                    再計測
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={onStartCheckin}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-[1.5rem] shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 animate-pulse mb-2 hover:shadow-xl transition-all border border-emerald-400/30"
                        >
                            <Activity size={20} />
                            まずはステート・チェックイン
                        </button>
                    )}
                </div>

                {/* --- 1. 魂のコンパス・セッション CTA --- */}
                {(() => {
                    // Calculate time since boarding (created_at)
                    const createdAt = story.created_at ? new Date(story.created_at) : new Date();
                    const now = new Date();
                    const hoursSinceBoarding = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
                    const isIgnitionWindow = hoursSinceBoarding <= 48;
                    const isNormalFlight = hoursSinceBoarding > 48 && hoursSinceBoarding <= 504;

                    // Countdown for Ignition Window
                    const remainingMs = Math.max(0, createdAt.getTime() + (48 * 60 * 60 * 1000) - now.getTime());
                    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
                    const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

                    // Pricing based on phase
                    const currentPrice = isIgnitionWindow ? 5500 : isNormalFlight ? 16500 : 33000;

                    return (
                        <div className="px-4 mb-6">
                            <div className={`p-[2px] rounded-[2rem] shadow-[0_0_40px_rgba(139,92,246,0.3)] ${isIgnitionWindow ? 'bg-gradient-to-br from-amber-500/70 via-orange-500/60 to-rose-500/50' : 'bg-gradient-to-br from-violet-900/70 via-purple-900/60 to-fuchsia-900/50'}`}>
                                <div className="bg-gradient-to-br from-slate-900/98 to-slate-800/95 p-5 rounded-[1.9rem] relative overflow-hidden backdrop-blur-xl">
                                    {/* Background Effects */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-fuchsia-500/15 rounded-full blur-2xl" />

                                    {/* Ignition Countdown Badge */}
                                    {isIgnitionWindow && (
                                        <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                                            ⏰ 特典終了まで {remainingHours}:{remainingMins.toString().padStart(2, '0')}
                                        </div>
                                    )}
                                    {!isIgnitionWindow && isNormalFlight && (
                                        <div className="absolute top-3 right-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                                            50% OFF · 21日限定
                                        </div>
                                    )}

                                    <div className="relative z-10 space-y-4">
                                        {/* Header - 魂のコンパス */}
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className={`absolute inset-0 rounded-2xl blur-md opacity-60 ${isIgnitionWindow ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-violet-400 to-fuchsia-500'}`} />
                                                <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl ${isIgnitionWindow ? 'bg-gradient-to-br from-amber-500/40 to-orange-500/40 border-amber-400/50' : 'bg-gradient-to-br from-violet-500/40 to-fuchsia-500/40 border-violet-400/50'}`}>
                                                    <Compass size={32} className={isIgnitionWindow ? 'text-amber-200' : 'text-violet-200'} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Sparkles size={14} className="text-amber-400" />
                                                    <p className={`text-[11px] font-bold tracking-wider ${isIgnitionWindow ? 'text-amber-300' : 'text-violet-300'}`}>
                                                        SOUL COMPASS SESSION
                                                    </p>
                                                </div>
                                                <p className="text-base font-bold text-white font-serif">
                                                    あなた専用・魂のコンパスをセットする
                                                </p>
                                            </div>
                                        </div>

                                        {/* Message - Broken's Beautiful */}
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                                            <p className="text-sm text-white font-medium leading-relaxed">
                                                🧭 すべてが完璧にならなくても動き出せるための、<br />
                                                <span className="text-amber-300">特別な作戦会議</span>
                                            </p>
                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                「Broken's Beautiful」の精神で、今のあなたのままで最高に輝くためのルートを一緒に描きます。
                                            </p>
                                        </div>

                                        {/* Ignition Package - Bonus Items (no points) */}
                                        {isIgnitionWindow ? (
                                            <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 rounded-xl p-4 border border-amber-500/30 space-y-3">
                                                <p className="text-[10px] text-amber-300 font-bold tracking-wider text-center">
                                                    🎁 48時間限定・早期予約特典
                                                </p>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-amber-500/20">
                                                        <span className="text-lg">🎧</span>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-white font-bold">限定音声「点火の美学」</p>
                                                            <p className="text-[10px] text-gray-400">機体の本能を呼び醒ますガイド</p>
                                                        </div>
                                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                                    </div>
                                                    <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-amber-500/20">
                                                        <span className="text-lg">📄</span>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-white font-bold">専用PDF「ショートカット・マップ」</p>
                                                            <p className="text-[10px] text-gray-400">脳タイプ別・21日間効果最大化</p>
                                                        </div>
                                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-black/30 rounded-xl p-4 border border-white/10 space-y-2">
                                                <p className="text-[10px] text-gray-500 font-bold tracking-wider text-center">
                                                    🔒 48時間限定特典 - 終了
                                                </p>
                                                <div className="space-y-2 opacity-40">
                                                    <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-gray-700">
                                                        <span className="text-lg grayscale">🎧</span>
                                                        <p className="text-xs text-gray-500 line-through">限定音声「点火の美学」</p>
                                                        <Lock size={14} className="text-gray-600 ml-auto" />
                                                    </div>
                                                    <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-gray-700">
                                                        <span className="text-lg grayscale">📄</span>
                                                        <p className="text-xs text-gray-500 line-through">専用PDF「ショートカット・マップ」</p>
                                                        <Lock size={14} className="text-gray-600 ml-auto" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Price Display */}
                                        <div className="flex items-center justify-center gap-4 py-2">
                                            <div className="text-center">
                                                <p className="text-[10px] text-gray-500 mb-0.5">通常価格</p>
                                                <p className="text-lg text-gray-500 line-through">¥33,000</p>
                                            </div>
                                            <div className="text-2xl text-white/20">→</div>
                                            <div className="text-center">
                                                <p className={`text-[10px] font-bold mb-0.5 ${isIgnitionWindow ? 'text-amber-400' : 'text-violet-400'}`}>
                                                    {isIgnitionWindow ? '48時間限定 -83%' : isNormalFlight ? '21日限定 -50%' : '通常価格'}
                                                </p>
                                                <p className={`text-2xl font-bold text-transparent bg-clip-text ${isIgnitionWindow ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300' : 'bg-gradient-to-r from-violet-300 via-fuchsia-200 to-violet-300'}`}>
                                                    ¥{currentPrice.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <a
                                            href={`${siteSettings?.banner_link_url || '#'}${siteSettings?.banner_link_url?.includes('?') ? '&' : '?'}custom_id=${story.line_user_id || ''}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`group block w-full py-4 text-center rounded-xl text-white font-bold text-base shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all border relative overflow-hidden ${isIgnitionWindow ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 border-amber-400/50 shadow-amber-500/40' : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 border-violet-400/50 shadow-violet-500/40'}`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                            <span className="relative flex items-center justify-center gap-2">
                                                <Compass size={18} />
                                                {story.is_session_booked ? '予約内容を確認する' : '魂のコンパスをセットする'}
                                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </a>

                                        {story.is_session_booked && (
                                            <div className="text-center p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                                <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                                                    <CheckCircle2 size={14} />
                                                    ご予約ありがとうございます！
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* --- 2. Daily Navigation (Main Action) --- */}
                <div className="px-6 mb-6">
                    <p className="text-center text-sm text-indigo-300/80 mb-4">7日ごとに器がアップデート。愛して、学んで、自由な空へ ✨</p>
                    <button
                        onClick={() => setShowDailyModal(true)}
                        disabled={!!todaysLog} // Disabled if already navigated (checkin done)
                        className={`w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-5 rounded-[2rem] shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 relative overflow-hidden group border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed
                            ${!!todaysLog ? 'grayscale opacity-50' : ''}`}
                    >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                        {!todaysLog && <div className="absolute -right-10 -top-10 w-32 h-32 bg-white opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />}

                        {todaysLog ? <CheckCircle2 size={28} className="text-white" /> : <Compass size={28} className="animate-spin-slow text-indigo-200" />}
                        <span className="text-xl font-serif tracking-wide drop-shadow-md">
                            {todaysLog ? '本日のナビゲーション完了' : 'デイリー・ナビゲーション'}
                        </span>
                        {!todaysLog && <ChevronRight className="opacity-70 group-hover:translate-x-1 transition-transform" />}
                    </button>
                    {!todaysLog && <p className="text-center text-xs text-gray-500 mt-3 font-sans-rounded">1日1回、今日の冒険をセットしよう✨</p>}

                    {/* Today's Mission Card (Appears after Navigation) */}
                    {todaysLog && todaysLog.mission && (
                        <div className="mt-4 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 rounded-[2rem] p-5 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Star size={16} className="text-emerald-400 fill-emerald-400" />
                                </div>
                                <h3 className="text-emerald-400 font-bold text-sm tracking-wider">TODAY'S MISSION</h3>
                            </div>

                            <p className="text-white font-medium text-lg mb-4 pl-2 border-l-2 border-emerald-500/30">
                                {todaysLog.mission}
                            </p>

                            <button
                                onClick={handleMissionComplete}
                                disabled={todaysLog.mission_completed}
                                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                                    ${todaysLog.mission_completed
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-white/10 text-white hover:bg-emerald-500/20 border border-emerald-500/50'}`}
                            >
                                {todaysLog.mission_completed ? (
                                    <>
                                        <CheckCircle2 size={20} />
                                        MISSION COMPLETED
                                    </>
                                ) : (
                                    <>
                                        <div className="w-5 h-5 rounded-full border-2 border-white/50 mr-1" />
                                        ミッション完了を報告
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* ===== EVOLUTION LOG ===== */}
                <div className="px-4 mb-6">
                    {/* Header with Expansion Rate + Streak */}
                    <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/40 rounded-t-[2rem] p-4 border-t border-x border-white/10">
                        {/* Milestone Celebration Banner */}
                        {justReachedMilestone && (
                            <div className="mb-4 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30 text-center">
                                <p className="text-lg">🎉</p>
                                <p className="text-amber-300 font-bold text-sm">
                                    {currentMilestone === 7 && 'Day 7 達成！外在化フェーズクリア 🌟'}
                                    {currentMilestone === 14 && 'Day 14 達成！実験フェーズクリア 🔥'}
                                    {currentMilestone === 21 && 'Day 21 達成！コマンダー認定 🚀'}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[10px] text-indigo-300 font-bold tracking-wider">EVOLUTION LOG</p>
                                <p className="text-lg font-bold text-white">21日間で自由航行可能な軌道へ</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300">
                                    {Math.round((totalStamps / 21) * 100)}%
                                </p>
                            </div>
                        </div>

                        {/* Streak Display */}
                        {currentStreak > 0 && (
                            <div className="flex items-center justify-center gap-2 mb-3 p-2 bg-orange-500/20 rounded-xl border border-orange-500/30">
                                <span className="text-xl">🔥</span>
                                <p className="text-orange-300 font-bold text-sm">
                                    {currentStreak}日連続達成中！
                                </p>
                                {currentStreak >= 7 && <span className="text-lg">⭐</span>}
                            </div>
                        )}

                        {/* Progress Bar with Milestones */}
                        <div className="relative">
                            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                                    style={{ width: `${Math.min(100, (totalStamps / 21) * 100)}%` }}
                                />
                            </div>
                            {/* Milestone Markers */}
                            <div className="absolute top-0 left-0 w-full h-3 flex items-center">
                                <div className={`absolute left-[33.3%] -translate-x-1/2 w-1 h-5 rounded ${totalStamps >= 7 ? 'bg-amber-400' : 'bg-white/30'}`} title="Day 7" />
                                <div className={`absolute left-[66.6%] -translate-x-1/2 w-1 h-5 rounded ${totalStamps >= 14 ? 'bg-amber-400' : 'bg-white/30'}`} title="Day 14" />
                                <div className={`absolute right-0 w-1 h-5 rounded ${totalStamps >= 21 ? 'bg-amber-400' : 'bg-white/30'}`} title="Day 21" />
                            </div>
                        </div>

                        {/* Milestone Labels */}
                        <div className="flex justify-between mt-2 text-[9px]">
                            <span className={`${totalStamps >= 7 ? 'text-amber-400' : 'text-gray-500'}`}>Day 7 🌟</span>
                            <span className={`${totalStamps >= 14 ? 'text-amber-400' : 'text-gray-500'}`}>Day 14 🔥</span>
                            <span className={`${totalStamps >= 21 ? 'text-amber-400' : 'text-gray-500'}`}>Day 21 🚀</span>
                        </div>

                        {/* Navigator Copy */}
                        <p className="text-xs text-indigo-200/70 mt-3 text-center leading-relaxed">
                            {totalStamps < 7 ? (
                                <>✨ 最初の節目まであと <span className="text-amber-400 font-bold">{7 - totalStamps}</span> 日</>
                            ) : totalStamps < 14 ? (
                                <>🌟 第2の節目まであと <span className="text-amber-400 font-bold">{14 - totalStamps}</span> 日</>
                            ) : totalStamps < 21 ? (
                                <>🔥 最終進化まであと <span className="text-amber-400 font-bold">{21 - totalStamps}</span> 日</>
                            ) : (
                                <>🚀 自由航行軌道に到達しました！</>
                            )}
                        </p>
                    </div>

                    {/* Stamp Tabs */}
                    <div className="bg-black/20 backdrop-blur-md rounded-b-[2rem] shadow-xl overflow-hidden border-b border-x border-white/10">
                        <div className="flex border-b border-white/5 p-1 bg-black/20">
                            {tabs.map((tab, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTab(idx as any)}
                                    className={`flex-1 py-3 text-xs font-bold transition-all rounded-full ${activeTab === idx
                                        ? 'text-white bg-white/10 shadow-sm border border-white/10 backdrop-blur-lg'
                                        : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {tab.label.split(':')[0]}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[300px] bg-white/5">
                            <StampGrid
                                start={tabs[activeTab].start}
                                end={tabs[activeTab].end}
                                benefit={tabs[activeTab].benefit}
                            />
                        </div>
                    </div>
                </div>

                {/* Audio Section removed - now in WELCOME HANGAR above */}

                {/* ===== NIGHT FLIGHT LOG SECTION ===== */}
                {flightLog?.morning_mission && !flightLog?.night_gratitude?.length && (
                    <div className="px-4 mb-6">
                        <button
                            onClick={() => setShowNightLog(!showNightLog)}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-[2rem] shadow-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all border border-indigo-400/30"
                        >
                            <Moon size={20} />
                            <span className="text-lg font-serif">夜のフライトログ</span>
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">+2pt</span>
                        </button>
                    </div>
                )}

                {/* Night Log Input Panel */}
                {showNightLog && (
                    <div className="px-4 mb-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="bg-gradient-to-b from-indigo-900/60 to-purple-900/40 backdrop-blur-xl rounded-[2rem] border border-indigo-500/30 p-5 space-y-4">
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-white mb-1">着陸シークエンス</h3>
                                <p className="text-xs text-indigo-300">本日のフライトを振り返りましょう</p>
                            </div>

                            {/* Mission Complete Check */}
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                <button
                                    onClick={() => setMissionCompleteCheck(!missionCompleteCheck)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${missionCompleteCheck
                                        ? 'bg-emerald-500 border-emerald-400'
                                        : 'border-white/30 hover:border-white/50'
                                        }`}
                                >
                                    {missionCompleteCheck && <CheckCircle2 size={16} className="text-white" />}
                                </button>
                                <div>
                                    <p className="text-sm text-white font-medium">朝のミッションは完了しましたか？</p>
                                    <p className="text-xs text-white/50">「{flightLog?.morning_mission}」</p>
                                </div>
                            </div>

                            {/* Gratitude Input */}
                            <div>
                                <p className="text-xs text-indigo-300 font-bold mb-2 flex items-center gap-2">
                                    <FileText size={12} />
                                    今日できたこと・感謝（1〜3つ）
                                </p>
                                <textarea
                                    value={gratitudeInput}
                                    onChange={(e) => setGratitudeInput(e.target.value)}
                                    placeholder="例：美味しいコーヒーを飲めた&#10;掃除ができた&#10;夕日が綺麗だった"
                                    rows={3}
                                    className="w-full bg-black/20 rounded-xl border border-white/10 p-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-400/50 transition-all resize-none"
                                />
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSaveNightLog}
                                disabled={isSavingNight}
                                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                {isSavingNight ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Rocket size={18} />
                                )}
                                {isSavingNight ? '保存中...' : '着陸完了 (+2pt)'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== RECENT 3-DAY FLIGHT LOGS ===== */}
                {recentLogs.length > 0 && (
                    <div className="px-4 mb-6">
                        <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-4">
                            <h3 className="text-xs text-indigo-300 font-bold tracking-widest mb-3 flex items-center gap-2">
                                <Sun size={12} />
                                FLIGHT LOG ARCHIVE (直近3日)
                            </h3>
                            <div className="space-y-2">
                                {recentLogs.map(log => (
                                    <div
                                        key={log.date}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.is_mission_completed
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-white/10 text-white/40'
                                                }`}>
                                                {log.is_mission_completed ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/60">{log.date}</p>
                                                <p className="text-sm text-white font-medium truncate max-w-[180px]">
                                                    {log.morning_mission || '(ミッション未入力)'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-yellow-400">
                                                +{(log.points_earned?.morning || 0) + (log.points_earned?.night || 0) + (log.points_earned?.bonus || 0)}pt
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-white/30 text-center mt-3">
                                ※ それ以前の全記録は母艦（Dream Maker）へ転送されました
                            </p>
                        </div>
                    </div>
                )}

                {/* Archives removed - now in WELCOME HANGAR */}

                {/* Modals */}
                {showDailyModal && (
                    <DailyNavigationModal
                        story={story}
                        brainType={story.brain_type}
                        onClose={() => setShowDailyModal(false)}
                        onComplete={async () => {
                            setShowDailyModal(false);
                            if (onRefresh) await onRefresh();
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default CommanderDashboard;
