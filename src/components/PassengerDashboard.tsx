
import React, { useState, useRef, useEffect } from 'react';
import { Lock, MapPin, CheckCircle2, ChevronRight, Play, Pause, FileText, Video, Download, Sparkles, Brain, Settings, Headphones, Unlock, Rocket, Trophy, LogOut } from 'lucide-react';
import { UserStory, DaySetting } from '../lib/supabase';
import YouTubePlayer from './YouTubePlayer';
import MissionIgnition from './MissionIgnition';
import Mission2Ignition from './Mission2Ignition';

interface Props {
    story: UserStory;
    daySettings: Record<number, DaySetting>;
    onUpdate: (updates: Partial<UserStory>) => void;
    onPromotion: () => void;
    onStartDiagnosis: () => void;
    onStartTask: (day: number) => void;
    onViewSettings?: () => void;
    onLogout?: () => void;
    siteSettings?: any;
    displayName?: string | null;
}

// Brain Type Definitions with Character Images and Details
// Note: File names don't match character names - using actual file contents:
// sora.png = シン, shin.png = ピク, piku.png = ソラ, mamoru.png = マモル
const BRAIN_TYPES: Record<string, {
    name: string;
    image: string;
    color: string;
    description: string;
    title: string;
    role: string;
    personality: string;
    warningState: string;
    trigger: string;
}> = {
    left_3d: {
        name: 'シン',
        image: '/characters/sora.png',
        color: '#3B82F6',
        description: '論理×行動派',
        title: '叡智の参謀',
        role: '戦略立案、仕組み化、本質の追求',
        personality: 'クールで論理的。無駄を嫌い、常に「効率」と「本質」を考えます。感情に流されず、冷静に最短ルートを弾き出します。',
        warningState: '「冷徹な評論家」',
        trigger: '無意味な雑談、非効率なやり方、感情的な話'
    },
    left_2d: {
        name: 'マモル',
        image: '/characters/mamoru.png',
        color: '#10B981',
        description: '論理×思考派',
        title: '鉄壁の守護神',
        role: '安全管理、リスクヘッジ、ルーチンの遂行',
        personality: '真面目で勤勉。ルールや前例を何よりも大切にします。「信念」に基づいて行動する、頼れる保安官です。',
        warningState: '「石橋を叩いて壊すブレーキ」',
        trigger: '計画の変更、いい加減な態度、ルールの無視'
    },
    right_3d: {
        name: 'ソラ',
        image: '/characters/piku.png',
        color: '#FBBF24',
        description: '感覚×行動派',
        title: '超速の冒険家',
        role: 'ビジョナリー、突破口を開く、エネルギーの拡大',
        personality: '思いついたら即行動！ 好奇心の塊で、常識に囚われません。明るく、人を巻き込むカリスマ性を持っています。',
        warningState: '「ハンドルのない暴走車」',
        trigger: '地味な作業、我慢すること、細かい理屈'
    },
    right_2d: {
        name: 'ピク',
        image: '/characters/shin.png',
        color: '#EC4899',
        description: '感覚×思考派',
        title: '愛と調和の天使',
        role: 'チームビルディング、ムードメーカー、危険察知（空気）',
        personality: '感受性が豊かで、人の気持ちを瞬時に察知します。損得抜きで人に尽くし、感謝と調和をエネルギー源にしています。',
        warningState: '「他人軸の迷子」',
        trigger: '無視されること、怒りの感情、理屈だけの会話'
    },
};

const PassengerDashboard: React.FC<Props> = ({
    story,
    daySettings,
    onUpdate,
    onPromotion,
    onStartDiagnosis,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onStartTask,
    onViewSettings,
    onLogout,
    siteSettings,
    displayName
}) => {
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Night Audio State
    const [isNightPlaying, setIsNightPlaying] = useState(false);
    const nightAudioRef = useRef<HTMLAudioElement>(null);

    // Accordion & Mission State
    // Accordion & Mission State
    // Default to open if diagnosis done but mission 1 not done
    const [expandedMission, setExpandedMission] = useState<number | null>(null);
    const [showMissionForm, setShowMissionForm] = useState(false);
    const [submittedDestination, setSubmittedDestination] = useState<string | null>(null);
    // Toggle between 'video' and 'mission' content view after mission completion
    const [missionContentView, setMissionContentView] = useState<'video' | 'mission'>('mission');
    // Crew details accordion
    const [expandedCrewDetails, setExpandedCrewDetails] = useState(false);
    // Archive View State
    const [showArchives, setShowArchives] = useState(false);



    // Refs for scrolling
    const hangarRef = useRef<HTMLElement>(null);


    // Audio Point Logic (DB Persisted)
    const handleAudioPlay = async () => {
        const today = new Date().toDateString();
        const currentData = story.daily_logs?.['gamifinity'] || {};
        const lastAudioDate = currentData.last_audio_date;

        if (lastAudioDate !== today) {
            // Save to DB
            const updatedLogs = {
                ...story.daily_logs,
                gamifinity: {
                    ...currentData,
                    last_audio_date: today
                }
            };
            onUpdate({ daily_logs: updatedLogs });
        }
    };

    // Scroll to Archive
    const scrollToArchive = () => {
        setShowArchives(true);
        hangarRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Derived states
    const hasDiagnosis = !!story.brain_type;
    const hasDay1Submitted = !!story.day1_field1;
    const hasDay2Submitted = !!story.day2_field1;

    // Auto-expand Mission logic
    useEffect(() => {
        if (hasDiagnosis) {
            if (!hasDay1Submitted) {
                setExpandedMission(1);
            } else if (!hasDay2Submitted) {
                setExpandedMission(2);
            } else {
                setExpandedMission(null);
            }
        }
    }, [hasDiagnosis, hasDay1Submitted, hasDay2Submitted]);

    // User's brain type info
    const userBrainType = story.brain_type && BRAIN_TYPES[story.brain_type];


    // Audio player control
    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
                handleAudioPlay(); // Trigger point logic
                // Pause other audio if playing
                if (isNightPlaying && nightAudioRef.current) {
                    nightAudioRef.current.pause();
                    setIsNightPlaying(false);
                }
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleNightAudio = () => {
        if (nightAudioRef.current) {
            if (isNightPlaying) {
                nightAudioRef.current.pause();
            } else {
                nightAudioRef.current.play();
                handleAudioPlay(); // Trigger point logic
                // Pause other audio if playing
                if (isPlaying && audioRef.current) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                }
            }
            setIsNightPlaying(!isNightPlaying);
        }
    };

    // Auto-open promotion modal if ready
    useEffect(() => {
        if (hasDay2Submitted && story.user_phase === 'passenger' && !localStorage.getItem('promo_dismissed')) {
            const timer = setTimeout(() => setShowPromotionModal(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [hasDay2Submitted, story.user_phase]);

    // Progress steps for horizontal timeline
    const progressSteps = [
        { id: 'diagnosis', label: '診断', completed: hasDiagnosis },
        { id: 'mission1', label: 'M1', completed: hasDay1Submitted },
        { id: 'mission2', label: 'M2', completed: hasDay2Submitted },
    ];

    return (
        <div className="w-full max-w-md mx-auto min-h-screen pb-24 relative overflow-hidden">
            {/* ===== Cosmic Background with Particles ===== */}
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-indigo-950 via-blue-900 to-sky-800">
                {/* Earth glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[60%] rounded-[100%] bg-gradient-to-t from-sky-400/30 via-blue-500/20 to-transparent blur-3xl" />
                {/* Stars */}
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white animate-pulse"
                        style={{
                            top: `${Math.random() * 60}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                            opacity: Math.random() * 0.7 + 0.3,
                            animationDuration: `${Math.random() * 3 + 2}s`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                ))}
                {/* Light rays */}
                <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-white/10 via-transparent to-transparent rotate-12 blur-sm" />
                <div className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-cyan-300/20 via-transparent to-transparent -rotate-6 blur-sm" />
            </div>

            <div className="relative z-10 p-4 space-y-6">
                {/* ===== HEADER ===== */}
                <header className="text-center pt-2 pb-1 relative">
                    {/* Settings Button */}
                    <div className="absolute top-2 right-0 flex gap-2">
                        {onViewSettings && (
                            <button
                                onClick={onViewSettings}
                                className="p-2 rounded-full bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white transition-all"
                            >
                                <Settings size={18} />
                            </button>
                        )}
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="p-2 rounded-full bg-white/10 border border-white/20 text-white/50 hover:bg-white/20 hover:text-white/70 transition-all"
                                title="ログアウト"
                            >
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>



                    <h1 className="text-xl font-bold text-white tracking-wide mb-1">PASSENGER DASHBOARD</h1>
                    <p className="text-xs text-cyan-300 tracking-widest uppercase">軌道出発デッキ</p>

                    {/* Welcome Message (No Avatar - moved to Crew Badge) */}
                    <p className="text-sm text-white/70 mt-4 mb-2 font-medium">
                        ようこそ、<span className="text-white font-bold">{displayName || 'コマンダー'}</span>。<br />
                        あなたの初期装備です。
                    </p>
                </header>



                {/* ===== HORIZONTAL PROGRESS TIMELINE ===== */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                        {progressSteps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                {/* Step Circle */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step.completed
                                        ? 'bg-gradient-to-br from-cyan-400 to-blue-500 border-cyan-300 shadow-lg shadow-cyan-500/30'
                                        : 'bg-white/10 border-white/30'
                                        }`}>
                                        {step.completed ? (
                                            <CheckCircle2 size={18} className="text-white" />
                                        ) : (
                                            <span className="text-white/60 text-xs font-bold">{index + 1}</span>
                                        )}
                                    </div>
                                    <span className={`text-[10px] mt-1 font-bold ${step.completed ? 'text-cyan-300' : 'text-white/50'}`}>
                                        {step.label}
                                    </span>
                                </div>
                                {/* Connector Line */}
                                {index < progressSteps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 transition-all ${progressSteps[index + 1].completed || step.completed
                                        ? 'bg-gradient-to-r from-cyan-400 to-cyan-400/30'
                                        : 'bg-white/20'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* ===== CREW BADGE (After Diagnosis) ===== */}
                {userBrainType && (
                    <div className="mx-auto max-w-xs">
                        {/* Clickable Header */}
                        <button
                            onClick={() => setExpandedCrewDetails(!expandedCrewDetails)}
                            className="w-full flex items-center justify-between gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20 hover:bg-white/15 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 shadow-lg" style={{ borderColor: userBrainType.color }}>
                                    <img src={userBrainType.image} alt={userBrainType.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-bold">{userBrainType.name}</p>
                                    <p className="text-xs text-white/60">{userBrainType.title}</p>
                                </div>
                            </div>
                            <ChevronRight
                                size={18}
                                className={`text-white/60 transition-transform duration-300 ${expandedCrewDetails ? 'rotate-90' : ''}`}
                            />
                        </button>

                        {/* Expanded Crew Details */}
                        {expandedCrewDetails && (
                            <div className="mt-2 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                {/* Role */}
                                <div>
                                    <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">役割</p>
                                    <p className="text-white text-sm mt-1">{userBrainType.role}</p>
                                </div>

                                {/* Personality */}
                                <div>
                                    <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">性格</p>
                                    <p className="text-white/90 text-sm mt-1">{userBrainType.personality}</p>
                                </div>

                                {/* Warning Mode */}
                                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20">
                                    <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">⚠️ 暴走モード（過剰発揮）</p>
                                    <p className="text-amber-200 text-sm font-bold mt-1">{userBrainType.warningState}</p>
                                    <p className="text-white/70 text-xs mt-2">
                                        <span className="text-amber-300 font-medium">トリガー: </span>
                                        {userBrainType.trigger}
                                    </p>
                                </div>

                                {/* Link to Full PDF */}
                                <div className="pt-2 border-t border-white/10">
                                    <p className="text-white/60 text-xs text-center">
                                        他のクルーについては
                                        <a
                                            href="https://utagesystem.s3.ap-northeast-1.wasabisys.com/7Ix1BalijQuM/X0UkowBf3Dxo.pdf"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-cyan-300 underline hover:text-cyan-200 mx-1"
                                        >
                                            特典PDF
                                        </a>
                                        で全てのクルーの取扱説明書を見る
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}



                {/* ===== SECTION A: HANGAR (格納庫) - Futuristic Cockpit Style ===== */}
                <section ref={hangarRef} className="relative mb-24">
                    {/* Cockpit Frame */}
                    <div className="relative bg-gradient-to-b from-slate-900/80 to-indigo-950/60 backdrop-blur-xl rounded-[2rem] border border-cyan-400/20 overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                        {/* Holographic Grid Lines */}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'linear-gradient(transparent 95%, rgba(34,211,238,0.3) 95%), linear-gradient(90deg, transparent 95%, rgba(34,211,238,0.3) 95%)',
                            backgroundSize: '20px 20px'
                        }} />

                        {/* Top Edge Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

                        {/* Header */}
                        <div className="text-center py-4 border-b border-white/5 relative">
                            <p className="text-xs text-cyan-400 tracking-[0.3em] font-bold mb-1">HANGAR</p>
                            <h2 className="text-xl font-serif text-white tracking-widest" style={{ textShadow: '0 0 10px rgba(34,211,238,0.3)' }}>
                                {hasDay1Submitted ? 'クルー装備' : '初期装備'}
                            </h2>
                        </div>

                        {/* Content Grid */}
                        <div className="p-4 space-y-4 relative z-10">
                            {/* AFTER MISSION 1 COMPLETION: Show Audio Tracks */}
                            {hasDay1Submitted ? (
                                <>
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
                                            <audio ref={audioRef} src="/audio/morning_flight.mp3" onEnded={() => { setIsPlaying(false); handleAudioPlay(); }} />
                                        </div>

                                        {/* Track 2: Night Flight */}
                                        <div className="relative rounded-2xl p-4 border transition-all duration-300 flex flex-col items-center justify-center gap-3 group bg-slate-800/50 border-indigo-500/30 hover:border-indigo-400 hover:bg-slate-800/80">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform">
                                                <button
                                                    onClick={toggleNightAudio}
                                                    className="text-white w-full h-full flex items-center justify-center"
                                                >
                                                    {isNightPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1" />}
                                                </button>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-indigo-400 font-bold tracking-wider mb-1">TRACK 2</p>
                                                <p className="text-white font-bold text-sm">夜のフライトログ</p>
                                            </div>
                                            <audio ref={nightAudioRef} src="/audio/night_flight.mp3" onEnded={() => setIsNightPlaying(false)} />
                                        </div>
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
                                                <Download size={14} className="text-amber-400" />
                                                <span className="text-xs text-white/70">クルー取扱説明書（完全版）</span>
                                            </div>
                                            <ChevronRight size={14} className="text-white/30" />
                                        </div>
                                    </a>
                                </>
                            ) : (
                                <>
                                    {/* BEFORE MISSION 2: Original Layout */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Track 1: Morning Flight */}
                                        <div className={`relative rounded-2xl p-4 border transition-all duration-300 flex flex-col items-center justify-center gap-3 group bg-slate-800/50 border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-800/80`}>

                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:scale-110 transition-transform">
                                                <button
                                                    onClick={toggleAudio}
                                                    disabled={false}
                                                    className="text-white w-full h-full flex items-center justify-center"
                                                >
                                                    {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1" />}
                                                </button>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-cyan-400 font-bold tracking-wider mb-1">TRACK 1</p>
                                                <p className="text-white font-bold text-sm">朝のフライトシミュレーション</p>
                                            </div>
                                            <audio ref={audioRef} src="/audio/morning_flight.mp3" onEnded={() => { setIsPlaying(false); handleAudioPlay(); }} />
                                            <div className="px-2.5 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 mt-1">
                                                <span className="text-[9px] text-emerald-400 font-medium leading-none">即時使用可</span>
                                            </div>
                                        </div>

                                        {/* PDF Resource: Crew Manual */}
                                        <div className="relative rounded-2xl p-4 border transition-all duration-300 flex flex-col items-center justify-center gap-3 group bg-slate-800/50 border-orange-500/30 hover:border-orange-400 hover:bg-slate-800/80">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(251,146,60,0.4)] group-hover:scale-110 transition-transform">
                                                <a
                                                    href="https://utagesystem.s3.ap-northeast-1.wasabisys.com/7Ix1BalijQuM/X0UkowBf3Dxo.pdf"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-white w-full h-full flex items-center justify-center"
                                                >
                                                    <Download size={24} className="ml-0.5" />
                                                </a>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-orange-400 font-bold tracking-wider mb-1">PDF</p>
                                                <p className="text-white font-bold text-sm">クルー「トリセツ」簡易版</p>
                                            </div>
                                            <div className="px-2.5 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 mt-1">
                                                <span className="text-[9px] text-emerald-400 font-medium leading-none">即時使用可</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Archive Viewer (Inline) */}
                            {showArchives && (
                                <div className="space-y-4 pt-2 animate-in slide-in-from-top-4 duration-500">
                                    <p className="text-center text-xs text-white/40 font-mono mb-2">MISSION ARCHIVES</p>

                                    {/* Mission 1 Archive */}
                                    {hasDay1Submitted && (
                                        <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
                                            <div className="p-3 bg-white/5 border-b border-white/5 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                                <h4 className="text-sm font-bold text-white">Mission 01: 点火</h4>
                                            </div>
                                            <div className="p-4 space-y-4">
                                                {/* Video */}
                                                <YouTubePlayer
                                                    videoUrl={daySettings[1]?.youtube_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                                                    brainType={story.brain_type}
                                                />
                                                {/* Answer Display */}
                                                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                                    <p className="text-[10px] text-white/40 mb-1 font-bold">YOUR LOG</p>
                                                    <p className="text-sm text-white/90 whitespace-pre-wrap">{story.day1_field1}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mission 2 Archive */}
                                    {hasDay2Submitted && (
                                        <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
                                            <div className="p-3 bg-white/5 border-b border-white/5 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                                <h4 className="text-sm font-bold text-white">Mission 02: 脳内解析</h4>
                                            </div>
                                            <div className="p-4 space-y-4">
                                                {/* Video */}
                                                <YouTubePlayer
                                                    videoUrl={daySettings[2]?.youtube_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                                                    brainType={story.brain_type}
                                                />
                                                {/* Answer Display */}
                                                <div className="space-y-2">
                                                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                                        <p className="text-[10px] text-cyan-400/60 mb-1 font-bold">RESISTANCE LOG</p>
                                                        <p className="text-sm text-white/90 whitespace-pre-wrap">{story.day2_field1}</p>
                                                    </div>
                                                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                            <Brain size={16} className="text-purple-300" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-purple-400/60 font-bold">MAX OUTPUT CREW</p>
                                                            <p className="text-sm text-white font-bold">{story.day2_field2 === 'sora' ? 'ソラ（冒険家）' : story.day2_field2 === 'mamoru' ? 'マモル（守護者）' : story.day2_field2 === 'shin' ? 'シン（戦略家）' : 'ピク（癒やし手）'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                                        <p className="text-[10px] text-pink-400/60 mb-1 font-bold">ANALYSIS LOG</p>
                                                        <p className="text-sm text-white/90 whitespace-pre-wrap">{story.day2_field3}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Bottom Edge Accent */}
                        <div className="h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                    </div>
                </section>



                {/* ===== SECTION B: MISSION TIMELINE ===== */}
                <section className="space-y-4">
                    <h2 className="text-sm font-bold text-cyan-300 tracking-widest uppercase text-center">MISSION TIMELINE</h2>

                    {/* Step 0: Boarding (Diagnosis) */}
                    {!hasDiagnosis && (
                        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-4 border border-amber-400/30 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                                    <Brain size={22} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">BOARDING</p>
                                    <h3 className="text-white font-bold text-sm">搭乗手続き（脳タイプ診断）</h3>
                                </div>
                            </div>
                            <button
                                onClick={onStartDiagnosis}
                                className="w-full mt-3 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                            >
                                診断を開始する
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* MISSION 01 - Accordion Style */}
                    <div className={`${!hasDiagnosis ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
                            {/* Accordion Header - Always Visible */}
                            <button
                                onClick={() => hasDiagnosis && setExpandedMission(expandedMission === 1 ? null : 1)}
                                className="w-full p-4 flex items-center justify-between text-left"
                                disabled={!hasDiagnosis}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasDay1Submitted
                                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                                        : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                                        }`}>
                                        {hasDay1Submitted ? (
                                            <CheckCircle2 size={18} className="text-white" />
                                        ) : (
                                            <Rocket size={18} className="text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">MISSION 01</p>
                                        <h3 className="text-white font-bold text-sm">{daySettings[1]?.title || '軌道への点火シークエンス'}</h3>
                                    </div>
                                </div>
                                <div className={`transform transition-transform duration-300 ${expandedMission === 1 ? 'rotate-90' : ''}`}>
                                    <ChevronRight size={20} className="text-white/60" />
                                </div>
                            </button>

                            {/* Submitted Destination Summary - Collapsed View */}
                            {hasDay1Submitted && expandedMission !== 1 && submittedDestination && (
                                <div className="px-4 pb-4 -mt-2">
                                    <div className="flex items-start gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20">
                                        <MapPin size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] text-amber-300 font-bold uppercase">MY DESTINATION</p>
                                            <p className="text-white text-sm font-medium">{submittedDestination}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Accordion Content - Video & Mission */}
                            {expandedMission === 1 && (
                                <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    {/* Toggle Tabs - Only show after mission completed */}
                                    {hasDay1Submitted && (
                                        <div className="flex gap-2 mb-2">
                                            <button
                                                onClick={() => setMissionContentView('video')}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${missionContentView === 'video'
                                                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                                                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                                    }`}
                                            >
                                                <Video size={14} />
                                                動画
                                            </button>
                                            <button
                                                onClick={() => setMissionContentView('mission')}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${missionContentView === 'mission'
                                                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                                                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                                    }`}
                                            >
                                                <FileText size={14} />
                                                ミッション
                                            </button>
                                        </div>
                                    )}

                                    {/* Video Content - Coming Soon */}
                                    {(!hasDay1Submitted || missionContentView === 'video') && (
                                        <div className="aspect-video rounded-xl bg-gradient-to-br from-gray-900/80 to-navy-950/80 border border-white/10 flex flex-col items-center justify-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                <Lock className="w-8 h-8 text-amber-400" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-amber-400 font-bold tracking-widest text-sm uppercase mb-1">Coming Soon</p>
                                                <p className="text-white/40 text-xs">動画準備中</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mission Form - Shows after threshold (only when not yet submitted) */}
                                    {showMissionForm && !hasDay1Submitted && (
                                        <MissionIgnition
                                            onSubmit={async (answer) => {
                                                setSubmittedDestination(answer);
                                                // Save to database via onUpdate
                                                await onUpdate({ day1_field1: answer });
                                                console.log('Mission submitted and saved:', answer);
                                            }}
                                            audioUrl={siteSettings?.night_audio_url || '#'}
                                        />
                                    )}

                                    {/* Mission Content - Show after mission completed AND mission tab selected */}
                                    {hasDay1Submitted && missionContentView === 'mission' && (
                                        <div className="space-y-3">
                                            {/* Destination */}
                                            <div className="flex items-start gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20">
                                                <MapPin size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] text-amber-300 font-bold uppercase">MY DESTINATION</p>
                                                    <p className="text-white text-sm font-medium">{story.day1_field1 || submittedDestination}</p>
                                                </div>
                                            </div>

                                            {/* Unlocked Audio */}
                                            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                        <Headphones size={18} className="text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[9px] text-green-400 font-bold uppercase flex items-center gap-1">
                                                            <Unlock size={10} /> UNLOCKED
                                                        </p>
                                                        <p className="text-white text-sm font-bold">夜のフライトログ</p>
                                                    </div>
                                                    <a
                                                        href={siteSettings?.night_audio_url || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 rounded-lg bg-indigo-500/30 text-indigo-200 text-xs font-medium hover:bg-indigo-500/40 transition-colors"
                                                    >
                                                        聴く
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reward Section - Always Shows Lock Status */}
                            {expandedMission !== 1 && (
                                <div className={`mx-4 mb-4 p-2.5 rounded-xl border ${hasDay1Submitted ? 'bg-green-500/10 border-green-400/30' : 'bg-white/5 border-white/10 opacity-60'}`}>
                                    <div className="flex items-center gap-2">
                                        {hasDay1Submitted ? <Unlock size={14} className="text-green-400" /> : <Lock size={14} className="text-gray-400" />}
                                        <div>
                                            <p className="text-[9px] text-cyan-300 font-bold uppercase">REWARD</p>
                                            <p className="text-[11px] text-white font-bold">音声「夜のフライトログ」</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MISSION 02 */}
                    <div className={`${!hasDay1Submitted ? 'opacity-50 pointer-events-none' : ''}`}>
                        {/* Accordion Style Mission 2 */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
                            {/* Accordion Header */}
                            <button
                                onClick={() => hasDay1Submitted && setExpandedMission(expandedMission === 2 ? null : 2)}
                                className="w-full p-4 flex items-center justify-between text-left"
                                disabled={!hasDay1Submitted}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasDay2Submitted
                                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                                        : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                        }`}>
                                        {hasDay2Submitted ? (
                                            <CheckCircle2 size={18} className="text-white" />
                                        ) : (
                                            <Rocket size={18} className="text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">MISSION 02</p>
                                        <h3 className="text-white font-bold text-sm">{daySettings[2]?.title || '脳内クルーの解析'}</h3>
                                    </div>
                                </div>
                                <div className={`transform transition-transform duration-300 ${expandedMission === 2 ? 'rotate-90' : ''}`}>
                                    <ChevronRight size={20} className="text-white/60" />
                                </div>
                            </button>

                            {/* Accordion Content */}
                            {expandedMission === 2 && (
                                <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    {/* Toggle Tabs - Only show after mission completed */}
                                    {hasDay2Submitted && (
                                        <div className="flex gap-2 mb-2">
                                            <button
                                                onClick={() => setMissionContentView('video')}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${missionContentView === 'video'
                                                    ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                                                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                                    }`}
                                            >
                                                <Video size={14} />
                                                動画
                                            </button>
                                            <button
                                                onClick={() => setMissionContentView('mission')}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${missionContentView === 'mission'
                                                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                                                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                                    }`}
                                            >
                                                <FileText size={14} />
                                                ミッション
                                            </button>
                                        </div>
                                    )}

                                    {/* Video Content - Coming Soon */}
                                    {(!hasDay2Submitted || missionContentView === 'video') && (
                                        <div className="aspect-video rounded-xl bg-gradient-to-br from-gray-900/80 to-navy-950/80 border border-white/10 flex flex-col items-center justify-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                <Lock className="w-8 h-8 text-amber-400" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-amber-400 font-bold tracking-widest text-sm uppercase mb-1">Coming Soon</p>
                                                <p className="text-white/40 text-xs">動画準備中</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mission Form */}
                                    {showMissionForm && !hasDay2Submitted && (
                                        <Mission2Ignition
                                            onSubmit={async (data) => {
                                                // Save to database via onUpdate
                                                await onUpdate({
                                                    day2_field1: data.resistance_log,
                                                    day2_field2: data.max_output_crew,
                                                    day2_field3: data.analysis_log
                                                });
                                                console.log('Mission 2 submitted and saved:', data);
                                            }}
                                        />
                                    )}

                                    {/* Completed Mission Display - Show Submitted Content */}
                                    {hasDay2Submitted && missionContentView === 'mission' && (
                                        <div className="space-y-3">
                                            {/* Resistance Log */}
                                            {story.day2_field1 && (
                                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                                    <p className="text-[10px] text-rose-300 font-bold uppercase tracking-wider mb-2">抵抗ログ（最大出力の妨げ）</p>
                                                    <p className="text-sm text-white/90 whitespace-pre-wrap">{story.day2_field1}</p>
                                                </div>
                                            )}

                                            {/* Selected Crew */}
                                            {story.day2_field2 && (
                                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-2">選択したクルー</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                                            <span className="text-white text-xs">🧑‍🚀</span>
                                                        </div>
                                                        <span className="text-sm text-white font-medium">{story.day2_field2}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Analysis Log */}
                                            {story.day2_field3 && (
                                                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/20">
                                                    <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-2">クルーからの解析レスポンス</p>
                                                    <p className="text-sm text-white/90 whitespace-pre-wrap">{story.day2_field3}</p>
                                                </div>
                                            )}

                                            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                                                <p className="text-xs text-white/50">解析完了済み・次のミッションをお待ちください</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reward Section - Lock Status */}
                            {expandedMission !== 2 && (
                                <div className={`mx-4 mb-4 p-2.5 rounded-xl border ${hasDay2Submitted ? 'bg-green-500/10 border-green-400/30' : 'bg-white/5 border-white/10 opacity-60'}`}>
                                    <div className="flex items-center gap-2">
                                        {hasDay2Submitted ? <Unlock size={14} className="text-green-400" /> : <Lock size={14} className="text-gray-400" />}
                                        <div>
                                            <p className="text-[9px] text-cyan-300 font-bold uppercase">REWARD</p>
                                            <p className="text-[11px] text-white font-bold">PDF「クルー『トリセツ』完全版」</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ===== PROMOTION NOTIFICATION ===== */}
                {
                    hasDay2Submitted && !showPromotionModal && story.user_phase === 'passenger' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-700 fade-in">
                            <button
                                onClick={() => setShowPromotionModal(true)}
                                className="w-full relative group overflow-hidden rounded-2xl p-0.5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 animate-[shimmer_2s_infinite]" />
                                <div className="relative bg-slate-900 rounded-[14px] p-4 flex items-center justify-between border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                            <Trophy size={20} className="text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] text-amber-300 font-bold tracking-widest uppercase mb-0.5">PERMISSION GRANTED</p>
                                            <p className="text-white font-bold text-sm">昇格の準備が整いました</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-amber-400 animate-pulse" />
                                </div>
                            </button>
                        </div>
                    )
                }
            </div>


            {/* ===== PROMOTION MODAL ===== */}
            {
                showPromotionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowPromotionModal(false)} />

                        <div className="w-full max-w-sm relative z-10 animate-in zoom-in-95 duration-500">
                            {/* Glow Effect behind modal */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

                            <div className="bg-slate-900/90 rounded-3xl p-1 border border-white/10 relative overflow-hidden shadow-2xl">
                                {/* Golden Border Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 via-transparent to-indigo-500/30 pointer-events-none" />

                                <div className="relative bg-slate-950/80 rounded-[22px] p-8 text-center overflow-hidden">
                                    {/* Background Decor */}
                                    <div className="absolute top-0 left-0 w-full h-full opacity-30">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-indigo-500/20 to-transparent" />
                                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="w-24 h-24 mx-auto mb-6 relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-amber-600 rounded-full blur-lg opacity-60 animate-pulse" />
                                            <div className="relative w-full h-full bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl border-2 border-yellow-200/50">
                                                <Trophy size={40} className="text-white" />
                                            </div>
                                            <div className="absolute -top-2 -right-2">
                                                <Sparkles size={24} className="text-yellow-200 animate-bounce" />
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-md">
                                            Commander<br />Promotion
                                        </h2>
                                        <p className="text-xs text-amber-300 font-bold mb-8 tracking-[0.2em] uppercase border-y border-amber-500/30 py-2 mx-4 bg-amber-500/5">
                                            コマンダー昇格承認
                                        </p>

                                        <p className="text-white/80 mb-8 leading-loose text-sm text-left backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/5">
                                            おめでとうございます。<br />
                                            基礎訓練課程が修了しました。<br />
                                            <br />
                                            明日より21日間の<br />
                                            <span className="text-amber-300 font-bold">「操縦（実技）」</span>が始まります。<br />
                                            まずは今の「空模様」を測るだけの小さな一歩から始めましょう。
                                        </p>

                                        <button
                                            onClick={() => {
                                                setShowPromotionModal(false);
                                                localStorage.setItem('promo_dismissed', 'true');
                                                onPromotion();
                                            }}
                                            className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-white font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group border border-white/20"
                                        >
                                            <span className="drop-shadow-sm">コマンダーダッシュボードへ</span>
                                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setShowPromotionModal(false);
                                                localStorage.setItem('promo_dismissed', 'true');
                                            }}
                                            className="w-full mt-4 py-2 text-white/40 text-xs font-medium hover:text-white/80 transition-colors"
                                        >
                                            このまま特典を確認する
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default PassengerDashboard;
