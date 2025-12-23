import { useState, useRef, useEffect, useMemo } from 'react';
import { CheckCircle2, Heart, Sparkles, Play, Pause, Send, Plus, X, Trophy, Compass, Feather, Flower, Music, Cloud, Star as Stars, Lock, Unlock, BookOpen, ArrowRight, Settings, RefreshCw, Gift, Calendar, Smartphone, Cpu, HelpCircle, ExternalLink, Copy, Check, Activity, Users, MessageCircle, Trash2, Rocket } from 'lucide-react';
import { useStoryData } from './hooks/useStoryData';
import { supabase } from './lib/supabase';
import { CountdownTimer } from './components/CountdownTimer';
import { LockedDayPreview } from './components/LockedDayPreview';
import { RevivalModal } from './components/RevivalModal';
import { ZoomAccess } from './components/ZoomAccess';
import { HRVMeasurement } from './components/HRVMeasurement';
import BrainTypeDiagnosis from './components/BrainTypeDiagnosis';
import YouTubePlayer from './components/YouTubePlayer';
import { useLiff } from './hooks/useLiff';
import NiyaNiyaList from './components/NiyaNiyaList';
import ChatDashboard from './components/ChatDashboard';
import PassengerDashboard from './components/PassengerDashboard';
import CommanderDashboard from './components/CommanderDashboard';
import BoardingPass from './components/BoardingPass';
import MissionIgnition from './components/MissionIgnition';
import GateOpening from './components/GateOpening';
import PointCard from './components/PointCard';
import TrinityCodeMission from './components/TrinityCodeMission';
const StyleTag = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;700&family=Zen+Maru+Gothic:wght@400;500;700&family=Charm:wght@400;700&display=swap');

    :root {
      font-family: 'Zen Maru Gothic', sans-serif;
      background-color: #fdfaf9;
    }

    .font-serif { font-family: 'Shippori Mincho', serif; }
    .font-script { font-family: 'Charm', cursive; }

    .sakura-gradient {
      background: linear-gradient(135deg,
        #fdfaf9 0%,
        #fcf4f4 25%,
        #fdfaf9 50%,
        #f4f6fc 75%,
        #fdfaf9 100%);
      animation: gradientShift 20s ease infinite;
    }

    .space-gradient {
      background: linear-gradient(135deg,
        #0f0c29 0%,
        #302b63 50%,
        #24243e 100%);
      animation: gradientShift 20s ease infinite;
    }

    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .seigaiha {
      background-image:
        radial-gradient(circle at 0% 50%, rgba(209, 166, 166, 0.05) 25%, transparent 26%),
        radial-gradient(circle at 100% 50%, rgba(209, 166, 166, 0.05) 25%, transparent 26%);
      background-size: 60px 30px;
      background-position: 0 0, 30px 0;
    }

    .mizuhiki-line {
      position: relative;
    }
    .mizuhiki-line::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg,
        transparent 0%,
        #eaddda 15%,
        #dbcbc8 50%,
        #eaddda 85%,
        transparent 100%);
      animation: shimmer 3s ease-in-out infinite;
    }

    @keyframes shimmer {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    .paper-texture {
      background-color: #fdfaf9;
      background-image:
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.01) 2px, rgba(0,0,0,0.01) 4px),
        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.01) 2px, rgba(0,0,0,0.01) 4px);
    }

    .wave {
      position: absolute;
      width: 200%;
      height: 100%;
      animation: wave 15s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
      transform: translate3d(0, 0, 0);
    }

    .wave:nth-of-type(2) {
      animation: wave 20s cubic-bezier(0.36, 0.45, 0.63, 0.53) -.125s infinite;
      opacity: 0.5;
    }

    @keyframes wave {
      0% { transform: translateX(0) translateY(0); }
      50% { transform: translateX(-25%) translateY(-10px); }
      100% { transform: translateX(-50%) translateY(0); }
    }

    .floating {
      animation: floating 6s ease-in-out infinite;
    }
    @keyframes floating {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(3deg); }
    }

    .sparkle-slow {
      animation: sparkle 4s linear infinite;
    }
    @keyframes sparkle {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    .sakura-petal {
      animation: fall 15s linear infinite;
    }
    @keyframes fall {
      0% {
        transform: translateY(-100px) translateX(0) rotate(0deg);
        opacity: 0;
      }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% {
        transform: translateY(100vh) translateX(100px) rotate(360deg);
        opacity: 0;
      }
    }

    .page-turn-in {
      animation: pageTurnIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes pageTurnIn {
      0% {
        opacity: 0;
        transform: translateX(100px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(12px) saturate(180%);
      box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
      border: none;
    }

    .shimmer-border {
      position: relative;
      overflow: hidden;
    }
    .shimmer-border::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(255, 255, 255, 0.6) 50%,
        transparent 70%
      );
      animation: shimmerRotate 3s linear infinite;
    }

    @keyframes shimmerRotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .btn-bounce:hover {
      animation: bounce 0.6s;
    }

    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #eaddda, #dbcbc8);
      border-radius: 10px;
    }

    .story-map {
      perspective: 1500px;
    }

    .map-location {
      transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .map-location:hover {
      transform: translateY(-10px) scale(1.1);
      filter: drop-shadow(0 20px 40px rgba(220, 200, 200, 0.3));
    }

    @keyframes stampPress {
      0% { transform: scale(0.3) rotate(-15deg); opacity: 0; }
      50% { transform: scale(1.3) rotate(5deg); opacity: 1; }
      70% { transform: scale(0.9) rotate(-2deg); }
      100% { transform: scale(1) rotate(0deg); }
    }

    @keyframes stampBurst {
      0% { box-shadow: 0 0 0 0 rgba(184, 155, 102, 0.8); }
      50% { box-shadow: 0 0 20px 10px rgba(184, 155, 102, 0.4); }
      100% { box-shadow: 0 0 30px 20px rgba(184, 155, 102, 0); }
    }

    @keyframes stampIcon {
      0% { transform: scale(0) rotate(-180deg); }
      60% { transform: scale(1.4) rotate(10deg); }
      80% { transform: scale(0.9) rotate(-5deg); }
      100% { transform: scale(1) rotate(0deg); }
    }

    @keyframes stampCheck {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.5); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }

    @keyframes confettiPop {
      0% { opacity: 1; transform: scale(0); }
      50% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.5); }
    }

    .stamp-claimed {
      animation: stampPress 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    .stamp-icon {
      animation: stampIcon 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    .stamp-check {
      animation: stampCheck 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
    }

    .stamp-burst {
      animation: stampBurst 0.8s ease-out forwards;
      pointer-events: none;
    }
  `}</style>
);

const colors = {
  sakura: '#fdfaf9',
  cream: '#fdfaf9',
  rose: '#eaddda',
  gold: '#B89B66',
  deepBrown: '#5D4E4E',
  sage: '#A6BBA6',
  sky: '#f4f6fc',
  berry: '#831843',
  primaryLight: '#FCD4E5',
  primaryDeep: '#E0D4FC'
};

// Video Modal Component defined outside to avoid re-creation
const VideoModal = ({ url, onClose }: { url: string | null; onClose: () => void }) => {
  if (!url) return null;

  // Helper to converting common YouTube URLs to embed format
  const getEmbedUrl = (url: string) => {
    try {
      const u = new URL(url);
      // Handle shorttu.be/ID
      if (u.hostname === 'youtu.be') {
        return `https://www.youtube.com/embed/${u.pathname.slice(1)}?autoplay=1`;
      }
      // Handle youtube.com/watch?v=ID
      if (u.hostname.includes('youtube.com') && u.searchParams.has('v')) {
        return `https://www.youtube.com/embed/${u.searchParams.get('v')}?autoplay=1`;
      }
      return url; // Return original if not recognized or already embeddable
    } catch (e) {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-black rounded-3xl overflow-hidden relative shadow-2xl animate-in zoom-in duration-300">
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title="Video Content"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const { userData, refreshUserData, isLoggedIn, isLoading: liffLoading, login, logout, isInitialized, error: liffError } = useLiff();
  const { story, visionImages, giftContent, dayRewards, siteSettings, daySettings, lineSettings, lineTemplates, loading, updateStory, updateGiftContent, updateDayReward, updateSiteSettings, updateDaySetting, updateLineSettings, updateLineTemplate, addVisionImage, removeVisionImage, submitToGoogleSheets, reloadStoryData, reloadDaySettings, reloadLineSettings, reloadLineTemplates } = useStoryData(userData?.line_user_id, userData?.display_name);
  const [view, setView] = useState('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyClaimedReward, setNewlyClaimedReward] = useState<number | 'perfect' | null>(null);
  const [sendingToLine, setSendingToLine] = useState(false);
  const [lineMessage, setLineMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null); // Worldview State
  const [showBoardingPass, setShowBoardingPass] = useState(false);

  useEffect(() => {
    // Wait for story to be loaded
    if (!story || !story.id) return;

    const hasSeenPass = localStorage.getItem('hasSeenBoardingPass');
    const lastSeenBrainType = localStorage.getItem('lastSeenBrainType');

    console.log('[BoardingPass] Check:', {
      hasSeenPass,
      lastSeenBrainType,
      storyBrainType: story.brain_type,
      storyName: story.name
    });

    // Condition 1: First time sighting (never seen boarding pass)
    if (!hasSeenPass) {
      console.log('[BoardingPass] First time - showing pass');
      setTimeout(() => setShowBoardingPass(true), 1500);
      return;
    }

    // Condition 2: Brain Type Diagnosis recently completed (and not yet seen on pass)
    if (story.brain_type && lastSeenBrainType !== story.brain_type) {
      console.log('[BoardingPass] New brain type - showing pass');
      setTimeout(() => setShowBoardingPass(true), 1000);
    }

  }, [story?.id, story?.brain_type]);

  const handleCloseBoardingPass = () => {
    setShowBoardingPass(false);
    localStorage.setItem('hasSeenBoardingPass', 'true');
    if (story?.brain_type) {
      localStorage.setItem('lastSeenBrainType', story.brain_type);
    }
  };
  const [showRevivalModal, setShowRevivalModal] = useState(false);
  const [revivalDay, setRevivalDay] = useState<number | null>(null);
  const [showHRVMeasurement, setShowHRVMeasurement] = useState(false);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [showGateOpening, setShowGateOpening] = useState(false);
  const [pendingBrainType, setPendingBrainType] = useState<string | null>(null);
  const [showPointCard, setShowPointCard] = useState(false);
  const [showTrinityCode, setShowTrinityCode] = useState(false);
  const [localBrainType, setLocalBrainType] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('brainType');
    }
    return null;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submittingTaskRef = useRef(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Configuration: 'PROGRESS' (Sequential) or 'DATE' (Time-based for challenges)
  const UNLOCK_MODE = 'PROGRESS' as 'PROGRESS' | 'DATE';

  const unlockedDays = useMemo(() => {
    if (!story) return [];

    // 管理画面で設定されたunlocked_daysが存在する場合はそれを優先
    if (story.unlocked_days && Array.isArray(story.unlocked_days) && story.unlocked_days.length > 0) {
      return story.unlocked_days as number[];
    }

    // デフォルト判定
    const now = new Date();
    const unlocked: number[] = [];

    const day1UnlockTime = new Date('2026-01-17T21:30:00');
    const day2UnlockTime = new Date('2026-01-20T21:30:00');
    const day3UnlockTime = new Date('2026-01-22T21:30:00');

    if (UNLOCK_MODE === 'DATE') {
      // --- DATE Mode: 完了状況に関わらず、日付だけで解禁 ---
      if (now >= day1UnlockTime) unlocked.push(1);
      if (now >= day2UnlockTime) unlocked.push(2);
      if (now >= day3UnlockTime) unlocked.push(3);

    } else {
      // --- PROGRESS Mode: 前の課題完了で次が解禁 (現在の日付条件もFallbackとして維持) ---

      // Day 1: 診断完了 or 時間経過
      if (!!story.brain_type || now >= day1UnlockTime) {
        unlocked.push(1);
      }

      // Day 2: Day 1完了
      if ((!!story.day1_field1) || (now >= day2UnlockTime && story.day1_field1)) {
        unlocked.push(2);
      }

      // Day 3: Day 2完了
      if ((!!story.day2_field1) || (now >= day3UnlockTime && story.day2_field1)) {
        unlocked.push(3);
      }
    }

    return unlocked;
  }, [story?.day1_field1, story?.day2_field1, story?.unlocked_days]);

  const isAdmin = useMemo(() => {
    // Allow admin access in demo mode for testing
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') return true;

    if (!userData?.line_user_id) return false;

    // Check siteSettings
    const adminUsers = siteSettings?.admin_users;
    if (typeof adminUsers === 'string') {
      if (adminUsers.split(',').map((s: string) => s.trim()).includes(userData.line_user_id)) return true;
    } else if (Array.isArray(adminUsers)) {
      if (adminUsers.includes(userData.line_user_id)) return true;
    }

    // Check custom story flag if exists
    if ((story as any)?.is_admin) return true;

    return false;
  }, [userData?.line_user_id, siteSettings?.admin_users, story]);

  if (liffLoading || (isLoggedIn && (loading || !story))) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.sakura }}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin mx-auto"
            style={{ borderColor: colors.rose, borderTopColor: 'transparent' }} />
          <p className="font-serif text-sm" style={{ color: colors.deepBrown }}>物語を準備中...</p>
        </div>
      </div>
    );
  }

  const sendRewardToLine = async (rewardType: number | 'perfect', title: string, message: string, imageUrl?: string, rewardUrl?: string) => {
    if (!story.email) {
      setLineMessage({ type: 'error', text: 'メールアドレスが登録されていません' });
      setTimeout(() => setLineMessage(null), 3000);
      return;
    }

    setSendingToLine(true);
    setLineMessage(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reward-to-line`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: story.email,
          rewardType,
          rewardTitle: title,
          rewardMessage: message,
          imageUrl,
          rewardUrl,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setLineMessage({ type: 'success', text: 'LINEに送信しました' });
      } else {
        setLineMessage({ type: 'error', text: result.message || 'LINEへの送信に失敗しました' });
      }
    } catch (error) {
      console.error('Error sending to LINE:', error);
      setLineMessage({ type: 'error', text: 'LINEへの送信に失敗しました' });
    } finally {
      setSendingToLine(false);
      setTimeout(() => setLineMessage(null), 3000);
    }
  };

  const handleTaskSubmit = async (day: number, fields: Record<string, string>, email: string) => {
    if (submittingTaskRef.current) {
      console.log('Already submitting, ignoring duplicate request');
      return;
    }

    submittingTaskRef.current = true;

    try {
      const updates: any = { email };

      Object.entries(fields).forEach(([key, value]) => {
        updates[`day${day}_${key}`] = value;
      });

      const completed = [
        story.day1_field1 || (day === 1 && fields.field1),
        story.day2_field1 || (day === 2 && fields.field1),
        story.day3_field1 || (day === 3 && fields.field1),
        visionImages.length > 0,
        story.is_gift_sent
      ].filter(Boolean).length;

      updates.progress = Math.floor((completed / 5) * 100);

      await supabase
        .from('user_stories')
        .update(updates)
        .eq('id', story.id);

      const googleSheetsUrl = story.google_sheets_url || import.meta.env.VITE_GOOGLE_SHEETS_URL;
      if (googleSheetsUrl && googleSheetsUrl.trim()) {
        try {
          const submissionData = {
            email,
            timestamp: new Date().toISOString(),
            day,
            ...fields
          };

          console.log('Submitting task data to Google Sheets:', { googleSheetsUrl, data: submissionData });

          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-to-sheets`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              googleSheetsUrl: googleSheetsUrl,
              data: submissionData
            })
          });

          const responseText = await response.text();
          console.log('Response status:', response.status);
          console.log('Response text:', responseText);

          if (response.ok) {
            console.log('Successfully submitted to Google Sheets');
            await supabase
              .from('user_stories')
              .update({ submitted_at: new Date().toISOString() })
              .eq('id', story.id);
          } else {
            console.error('Failed to submit to Google Sheets:', responseText);
          }
        } catch (error) {
          console.error('Error submitting to Google Sheets:', error);
        }
      }
    } finally {
      submittingTaskRef.current = false;
    }
  };

  const SakuraPetals = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="sakura-petal absolute text-pink-200 opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 100}px`,
            animationDelay: `${i * 2}s`,
            fontSize: `${12 + Math.random() * 8}px`
          }}
        >
          ❀
        </div>
      ))}
    </div>
  );

  const WaveBackground = () => (
    <div className="fixed bottom-0 left-0 right-0 h-64 overflow-hidden opacity-20 pointer-events-none z-0">
      <svg className="wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,60 C150,80 350,40 600,60 C850,80 1050,40 1200,60 L1200,120 L0,120 Z"
          fill={colors.rose} fillOpacity="0.3" />
      </svg>
      <svg className="wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,80 C150,60 350,100 600,80 C850,60 1050,100 1200,80 L1200,120 L0,120 Z"
          fill={colors.gold} fillOpacity="0.2" />
      </svg>
    </div>
  );

  const ReservationStatus = () => {
    // UTAGE format: "2025/12/25(木) 17:30〜19:00" or standard ISO
    let scheduleDate: Date | null = null;
    let timeStr = "";

    if (story?.event_schedule) {
      // Try parsing UTAGE Japanese format
      const utageMatch = story.event_schedule.match(/(\d{4})\/(\d{1,2})\/(\d{1,2}).*?(\d{1,2}:\d{2})/);
      if (utageMatch) {
        const [_, year, month, day, time] = utageMatch;
        scheduleDate = new Date(Number(year), Number(month) - 1, Number(day));
        timeStr = time;
      } else {
        // Fallback to standard parse
        const d = new Date(story.event_schedule);
        if (!isNaN(d.getTime())) {
          scheduleDate = d;
          timeStr = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
      }
    }

    // EMPTY STATE (No Reservation) - Requested by User
    if (!scheduleDate) {
      return (
        <div className="mx-4 mb-4">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <Calendar size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold">次回セッション予約</p>
                <p className="font-bold text-gray-400 text-xs">未予約</p>
              </div>
            </div>
            <a
              href="https://smart.reservestock.jp/reserve_form/index/30784"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-lg hover:bg-gray-700 transition"
            >
              予約する
            </a>
          </div>
        </div>
      );
    }

    // BOOKED STATE
    const dateStr = `${scheduleDate.getMonth() + 1}/${scheduleDate.getDate()}`;
    const weekDay = ['日', '月', '火', '水', '木', '金', '土'][scheduleDate.getDay()];

    return (
      <div className="mx-4 mb-4">
        {/* Greeting removed as per design request */}
        <div className="bg-white p-3 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center">
              <Calendar size={20} className="text-pink-500" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold">次回セッション予約</p>
              <p className="font-bold text-gray-800 text-sm">
                {dateStr}({weekDay}) {timeStr}
              </p>
            </div>
          </div>
          {story.event_url && (
            <a
              href={story.event_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#2D8CFF] text-white text-xs font-bold rounded-lg hover:bg-[#1E75E2] transition shadow-sm"
            >
              Zoomへ
            </a>
          )}
        </div>
      </div>
    );
  };


  const WeatherScoreBar = () => {
    // Get latest checkin score from database (daily_logs)
    const [score, setScore] = useState<number | null>(null);

    useEffect(() => {
      // 1. Try to get from daily_logs first (Server Source of Truth)
      if (story?.daily_logs) {
        const today = new Date().toISOString().split('T')[0];
        const log = story.daily_logs[today];
        if (log && typeof log.score === 'number') {
          setScore(log.score);
          return;
        }
      }

      // 2. Fallback to localStorage (Legacy/Offline support)
      const saved = localStorage.getItem('last_checkin_score');
      if (saved) {
        setScore(parseInt(saved));
      } else {
        setScore(null);
      }
    }, [story?.daily_logs]);

    if (score === null) return null; // Don't show if no score yet? Or show default?

    let weatherIcon = '☁️';
    let label = 'メンテナンス期';
    let gradient = 'from-gray-100 to-gray-200';
    let textColor = 'text-gray-600';

    if (score >= 80) {
      weatherIcon = '🌈';
      label = '神フロー';
      gradient = 'from-indigo-100 via-purple-100 to-pink-100';
      textColor = 'text-purple-600';
    } else if (score >= 60) {
      weatherIcon = '☀️';
      label = 'クリエイティブ';
      gradient = 'from-orange-100 to-yellow-100';
      textColor = 'text-orange-600';
    } else if (score <= 40) {
      weatherIcon = '☔️';
      label = 'リセット推奨';
      gradient = 'from-blue-50 to-slate-100';
      textColor = 'text-slate-600';
    }

    return (
      <div className="mx-4 mb-6">
        <div
          className={`relative overflow-hidden rounded-xl p-3 flex items-center justify-between shadow-sm border border-white/50 bg-gradient-to-r ${gradient}`}
        >
          <div className="flex items-center gap-3 relative z-10">
            <span className="text-2xl filter drop-shadow-sm">{weatherIcon}</span>
            <div>
              <p className="text-[10px] opacity-60 font-bold">現在の状態（天気）</p>
              <p className={`font-bold text-sm ${textColor}`}>{label} <span className="text-xs opacity-70">({score})</span></p>
            </div>
          </div>

          {/* Animated Background Effect */}
          <div className="absolute inset-0 bg-white/10 opacity-50 animate-pulse"></div>
        </div>
      </div>
    );
  };

  const AdminView = () => {
    const [archiveSheetUrl, setArchiveSheetUrl] = useState(story?.google_sheets_url || '');
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');
    const [day1ArchiveUrl, setDay1ArchiveUrl] = useState(story?.day1_archive_url || '');
    const [day2ArchiveUrl, setDay2ArchiveUrl] = useState(story?.day2_archive_url || '');
    const [day3ArchiveUrl, setDay3ArchiveUrl] = useState(story?.day3_archive_url || '');
    const [isSavingUrls, setIsSavingUrls] = useState(false);
    const [urlSaveMessage, setUrlSaveMessage] = useState('');
    const [day1RewardUrl, setDay1RewardUrl] = useState(dayRewards[1]?.reward_url || '');
    const [day2RewardUrl, setDay2RewardUrl] = useState(dayRewards[2]?.reward_url || '');
    const [day3RewardUrl, setDay3RewardUrl] = useState(dayRewards[3]?.reward_url || '');
    const [perfectRewardUrl, setPerfectRewardUrl] = useState(giftContent?.reward_url || '');
    const [isSavingRewards, setIsSavingRewards] = useState(false);
    const [rewardSaveMessage, setRewardSaveMessage] = useState('');
    const formatDateTimeLocal = (isoString?: string) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    const [day1ArchiveDeadline, setDay1ArchiveDeadline] = useState(formatDateTimeLocal(siteSettings?.day1_archive_deadline));
    const [day2ArchiveDeadline, setDay2ArchiveDeadline] = useState(formatDateTimeLocal(siteSettings?.day2_archive_deadline));
    const [day3ArchiveDeadline, setDay3ArchiveDeadline] = useState(formatDateTimeLocal(siteSettings?.day3_archive_deadline));
    const [day1AssignmentDeadline, setDay1AssignmentDeadline] = useState(formatDateTimeLocal(siteSettings?.day1_assignment_deadline));
    const [day2AssignmentDeadline, setDay2AssignmentDeadline] = useState(formatDateTimeLocal(siteSettings?.day2_assignment_deadline));
    const [day3AssignmentDeadline, setDay3AssignmentDeadline] = useState(formatDateTimeLocal(siteSettings?.day3_assignment_deadline));
    const [isSavingDeadlines, setIsSavingDeadlines] = useState(false);
    const [deadlineSaveMessage, setDeadlineSaveMessage] = useState('');
    const [appTitle, setAppTitle] = useState(siteSettings?.app_title || '絵本で「未来を設定する」ノート');
    const [siteTitle, setSiteTitle] = useState(siteSettings?.site_title || '絵本で「未来を設定する」ノート');
    const [siteSubtitle, setSiteSubtitle] = useState(siteSettings?.site_subtitle || '2026年、最高の物語をここから。');
    const [footerLine1, setFooterLine1] = useState(siteSettings?.footer_line1 || '');
    const [footerLine2, setFooterLine2] = useState(siteSettings?.footer_line2 || '');
    const [bannerText, setBannerText] = useState(siteSettings?.banner_text || '個別セッションでは、この物語を一緒に読み解き、');
    const [bannerSubtext, setBannerSubtext] = useState(siteSettings?.banner_subtext || 'あなたの魂を癒す「魔法のアファメーション」を贈ります。');
    const [bannerButtonText, setBannerButtonText] = useState(siteSettings?.banner_button_text || '物語の続きをセッションで描く');
    const [bannerImageUrl, setBannerImageUrl] = useState(siteSettings?.banner_image_url || '');
    const [bannerLinkUrl, setBannerLinkUrl] = useState(siteSettings?.banner_link_url || '');
    const [isSavingBanner, setIsSavingBanner] = useState(false);
    const [bannerSaveMessage, setBannerSaveMessage] = useState('');
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const [uploadBannerMessage, setUploadBannerMessage] = useState('');

    const toggleDayUnlock = (day: number) => {
      if (!story) return;

      const currentUnlocked = story.unlocked_days as number[] || [1];
      const isUnlocked = currentUnlocked.includes(day);

      let newUnlocked: number[];
      if (isUnlocked) {
        newUnlocked = currentUnlocked.filter(d => d !== day);
      } else {
        newUnlocked = [...currentUnlocked, day].sort();
      }

      updateStory({ unlocked_days: newUnlocked as any });
    };

    const syncArchiveData = async () => {
      if (!archiveSheetUrl || !archiveSheetUrl.trim()) {
        setSyncMessage('アーカイブシートURLを入力してください');
        return;
      }

      setIsSyncing(true);
      setSyncMessage('');

      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-archive-data`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            archiveSheetUrl
          })
        });

        const result = await response.json();

        if (result.success) {
          setSyncMessage('動画データを同期しました');
          await updateStory({ google_sheets_url: archiveSheetUrl });
          window.location.reload();
        } else {
          setSyncMessage(`エラー: ${result.error}`);
        }
      } catch (error) {
        console.error('Error syncing archive data:', error);
        setSyncMessage('同期中にエラーが発生しました');
      } finally {
        setIsSyncing(false);
      }
    };

    const saveArchiveUrls = async () => {
      setIsSavingUrls(true);
      setUrlSaveMessage('');

      try {
        const toISODate = (dateTimeStr: string) => dateTimeStr ? new Date(dateTimeStr).toISOString() : null;

        await updateStory({
          day1_archive_url: day1ArchiveUrl || null,
          day2_archive_url: day2ArchiveUrl || null,
          day3_archive_url: day3ArchiveUrl || null,
        } as any);

        await updateSiteSettings({
          day1_archive_deadline: toISODate(day1ArchiveDeadline) as string | undefined,
          day2_archive_deadline: toISODate(day2ArchiveDeadline) as string | undefined,
          day3_archive_deadline: toISODate(day3ArchiveDeadline) as string | undefined,
        });

        setUrlSaveMessage('URLと期限を保存しました');
      } catch (error) {
        console.error('Error saving URLs:', error);
        setUrlSaveMessage('保存中にエラーが発生しました');
      } finally {
        setIsSavingUrls(false);
      }
    };

    const saveRewardUrls = async () => {
      setIsSavingRewards(true);
      setRewardSaveMessage('');

      try {
        const toISODate = (dateTimeStr: string) => dateTimeStr ? new Date(dateTimeStr).toISOString() : null;

        const rewards = [
          { day: 1, url: day1RewardUrl },
          { day: 2, url: day2RewardUrl },
          { day: 3, url: day3RewardUrl }
        ];

        for (const { day, url } of rewards) {
          if (url) {
            await updateDayReward(day, url);
          }
        }

        if (perfectRewardUrl) {
          await updateGiftContent(perfectRewardUrl);
        }

        await updateSiteSettings({
          day1_assignment_deadline: toISODate(day1AssignmentDeadline) as string | undefined,
          day2_assignment_deadline: toISODate(day2AssignmentDeadline) as string | undefined,
          day3_assignment_deadline: toISODate(day3AssignmentDeadline) as string | undefined,
        });

        setRewardSaveMessage('プレゼントURLと期限を保存しました');
      } catch (error) {
        console.error('Error saving reward URLs:', error);
        setRewardSaveMessage('保存中にエラーが発生しました');
      } finally {
        setIsSavingRewards(false);
      }
    };

    const saveDeadlines = async () => {
      setIsSavingDeadlines(true);
      setDeadlineSaveMessage('');

      try {
        const toISODate = (dateStr: string) => dateStr ? new Date(dateStr + 'T23:59:59').toISOString() : null;

        await updateSiteSettings({
          day1_archive_deadline: toISODate(day1ArchiveDeadline) as string | undefined,
          day2_archive_deadline: toISODate(day2ArchiveDeadline) as string | undefined,
          day3_archive_deadline: toISODate(day3ArchiveDeadline) as string | undefined,
          day1_assignment_deadline: toISODate(day1AssignmentDeadline) as string | undefined,
          day2_assignment_deadline: toISODate(day2AssignmentDeadline) as string | undefined,
          day3_assignment_deadline: toISODate(day3AssignmentDeadline) as string | undefined,
        });

        setDeadlineSaveMessage('期限設定を保存しました');
      } catch (error) {
        console.error('Error saving deadlines:', error);
        setDeadlineSaveMessage('保存中にエラーが発生しました');
      } finally {
        setIsSavingDeadlines(false);
      }
    };

    const uploadBannerImage = async (file: File) => {
      setIsUploadingBanner(true);
      setUploadBannerMessage('');

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `banner-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('banner-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('banner-images')
          .getPublicUrl(filePath);

        setBannerImageUrl(publicUrl);
        setUploadBannerMessage('画像をアップロードしました。「バナー設定を保存」ボタンを押してください。');
      } catch (error) {
        console.error('Error uploading banner image:', error);
        setUploadBannerMessage('アップロード中にエラーが発生しました');
      } finally {
        setIsUploadingBanner(false);
      }
    };

    const saveBannerSettings = async () => {
      setIsSavingBanner(true);
      setBannerSaveMessage('');

      try {
        await updateSiteSettings({
          site_title: siteTitle,
          site_subtitle: siteSubtitle,
          app_title: appTitle,
          banner_text: bannerText,
          banner_subtext: bannerSubtext,
          banner_button_text: bannerButtonText,
          banner_image_url: bannerImageUrl,
          banner_link_url: bannerLinkUrl,
          footer_line1: footerLine1,
          footer_line2: footerLine2,
        });

        setBannerSaveMessage('設定を保存しました');
      } catch (error) {
        console.error('Error saving banner settings:', error);
        setBannerSaveMessage('保存中にエラーが発生しました');
      } finally {
        setIsSavingBanner(false);
      }
    };

    const activeDaysArray = siteSettings?.active_days || [1, 2, 3];
    const dayData = activeDaysArray.map(day => ({
      day,
      title: daySettings[day]?.title || `Day ${day}`
    }));

    const [activeSection, setActiveSection] = useState('niyaniya');
    const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);

    const handleUserChatClick = (lineUserId: string) => {
      setSelectedChatUserId(lineUserId);
      setActiveSection('chat');
    };

    const navItems = [
      { id: 'niyaniya', label: 'ユーザー一覧', icon: Users },
      { id: 'banner', label: '基本設定', icon: Settings },
      { id: 'chat', label: 'チャット', icon: MessageCircle },
      { id: 'unlock', label: 'ロック解除', icon: Unlock },
      { id: 'archive', label: 'アーカイブ', icon: Play },
      { id: 'reward', label: 'プレゼント', icon: Gift },
      { id: 'day', label: 'Day設定', icon: Calendar },
      { id: 'diagnosis', label: '脳タイプ診断', icon: Compass },
      { id: 'ai', label: 'AI接続', icon: Cpu },
      { id: 'line', label: 'LINE連携', icon: Send },
      { id: 'templates', label: 'メッセージ', icon: BookOpen },
      { id: 'debug', label: 'デバッグ', icon: Activity },
    ];

    return (
      <div className="page-turn-in relative z-10 min-h-screen">
        <div className="flex gap-6">
          <div className="w-56 flex-shrink-0">
            <div className="glass-card p-4 rounded-2xl sticky top-4">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/30">
                <Settings size={24} style={{ color: colors.berry }} />
                <h2 className="font-serif font-bold text-lg" style={{ color: colors.primaryDeep }}>
                  管理画面
                </h2>
              </div>

              <nav className="space-y-1">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${activeSection === id
                      ? 'bg-white/60 shadow-sm'
                      : 'hover:bg-white/30'
                      }`}
                    style={{ color: activeSection === id ? colors.berry : colors.deepBrown }}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </nav>

              <button
                onClick={() => setView('home')}
                className="w-full mt-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${colors.sakura}, ${colors.cream})`,
                  color: colors.rose
                }}
              >
                ホームに戻る
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {activeSection === 'niyaniya' && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-serif font-bold text-xl mb-6 flex items-center gap-3" style={{ color: colors.deepBrown }}>
                  <Users size={24} style={{ color: colors.berry }} />
                  ユーザー一覧
                </h3>
                <NiyaNiyaList onUserChatClick={handleUserChatClick} />
              </div>
            )}

            {activeSection === 'debug' && (
              <div className="glass-card p-8 rounded-2xl space-y-8">
                <h3 className="font-serif font-bold text-xl mb-6 flex items-center gap-3" style={{ color: colors.deepBrown }}>
                  <Activity size={24} style={{ color: colors.berry }} />
                  デバッグツール
                </h3>

                <div className="space-y-4">
                  <div className="p-6 bg-white/50 rounded-2xl border border-white/50">
                    <h4 className="font-bold mb-2 text-gray-700">お天気データのリセット</h4>
                    <p className="text-xs text-gray-500 mb-4">
                      自分自身の「お天気チェック（HRV計測）」の履歴を全て消去し、未実施の状態に戻します。<br />
                      ※ データベース上のログもクリアされます。
                    </p>
                    <button
                      onClick={async () => {
                        if (!confirm('本当にリセットしますか？（この操作は取り消せません）')) return;
                        try {
                          // Clear localStorage
                          localStorage.removeItem('last_checkin_score');

                          // Clear Story daily_logs and session booking
                          await updateStory({ daily_logs: {}, is_session_booked: false } as any);

                          alert('リセットしました。画面を再読み込みします。');
                          window.location.reload();
                        } catch (e) {
                          alert('エラーが発生しました: ' + e);
                        }
                      }}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      お天気リセット実行
                    </button>
                  </div>

                  {/* 21日間テスト用：日付シミュレーション */}
                  <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                    <h4 className="font-bold mb-2 text-indigo-700">🗓️ 21日間テスト：日付シミュレーション</h4>
                    <p className="text-xs text-gray-600 mb-4">
                      21日間の流れをテストするため、擬似的なログエントリを作成します。<br />
                      本番環境での使用は推奨されません。
                    </p>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[...Array(21)].map((_, i) => {
                        const dayNum = i + 1;
                        const testDate = new Date();
                        testDate.setDate(testDate.getDate() - (21 - dayNum));
                        const dateStr = testDate.toISOString().split('T')[0];
                        const hasLog = story?.daily_logs?.[dateStr];

                        return (
                          <button
                            key={dayNum}
                            onClick={async () => {
                              const currentLogs = story?.daily_logs || {};
                              const newLog = {
                                date: dateStr,
                                score: 60 + Math.floor(Math.random() * 30),
                                mission: `Day ${dayNum}のテストミッション`,
                                mission_completed: true,
                                completed_at: new Date().toISOString()
                              };
                              await updateStory({
                                daily_logs: { ...currentLogs, [dateStr]: newLog }
                              } as any);
                              alert(`Day ${dayNum} (${dateStr}) のログを作成しました`);
                            }}
                            className={`p-2 rounded-lg text-xs font-bold transition-all ${hasLog
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-400'
                              }`}
                          >
                            Day {dayNum}
                            {dayNum === 7 && ' 🎁'}
                            {dayNum === 14 && ' 🎁'}
                            {dayNum === 21 && ' 🏆'}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          if (!confirm('1〜21日目すべてのログを一括作成しますか？')) return;
                          const currentLogs = story?.daily_logs || {};
                          const allLogs = { ...currentLogs };

                          for (let i = 1; i <= 21; i++) {
                            const testDate = new Date();
                            testDate.setDate(testDate.getDate() - (21 - i));
                            const dateStr = testDate.toISOString().split('T')[0];
                            allLogs[dateStr] = {
                              date: dateStr,
                              score: 60 + Math.floor(Math.random() * 30),
                              mission: `Day ${i}のテストミッション`,
                              mission_completed: true,
                              completed_at: new Date().toISOString()
                            };
                          }

                          await updateStory({ daily_logs: allLogs } as any);
                          alert('21日分のログを一括作成しました！');
                          window.location.reload();
                        }}
                        className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg font-bold text-sm hover:bg-indigo-600 transition-colors"
                      >
                        ✨ 21日分一括作成
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('今日のログのみリセットしますか？（デイリーナビを再テスト可能に）')) return;
                          const today = new Date().toISOString().split('T')[0];
                          const currentLogs = { ...story?.daily_logs } || {};
                          delete currentLogs[today];
                          await updateStory({ daily_logs: currentLogs } as any);
                          alert('今日のログをリセットしました');
                          window.location.reload();
                        }}
                        className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-bold text-sm hover:bg-amber-600 transition-colors"
                      >
                        🔄 今日のみリセット
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'chat' && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-serif font-bold text-xl mb-6 flex items-center gap-3" style={{ color: colors.deepBrown }}>
                  <MessageCircle size={24} style={{ color: colors.berry }} />
                  個別チャット
                </h3>
                <ChatDashboard initialUserId={selectedChatUserId} />
              </div>
            )}

            {activeSection === 'unlock' && (
              <div className="glass-card p-8 rounded-2xl">
                <h3 className="font-serif font-bold text-xl mb-6" style={{ color: colors.deepBrown }}>
                  Day ロック解除
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {dayData.map(({ day, title }) => {
                    const isUnlocked = unlockedDays.includes(day);
                    return (
                      <div
                        key={day}
                        className="p-6 rounded-xl bg-white/40 flex flex-col items-center text-center"
                      >
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
                          style={{ background: isUnlocked ? `linear-gradient(135deg, ${colors.sakura}, ${colors.cream})` : '#e5e5e5' }}>
                          {isUnlocked ?
                            <Unlock size={24} style={{ color: colors.berry }} /> :
                            <Lock size={24} className="text-gray-400" />
                          }
                        </div>
                        <h4 className="font-serif font-bold text-lg" style={{ color: colors.deepBrown }}>
                          Day {day}
                        </h4>
                        <p className="text-xs opacity-70 mb-4" style={{ color: colors.deepBrown }}>
                          {title}
                        </p>
                        <button
                          onClick={() => toggleDayUnlock(day)}
                          className={`px-6 py-2 rounded-full font-bold text-sm transition-all hover:scale-105 ${isUnlocked ? 'bg-gray-200 text-gray-600' : 'shadow-lg text-white'
                            }`}
                          style={!isUnlocked ? {
                            background: `linear-gradient(135deg, ${colors.rose}, ${colors.primaryDeep})`
                          } : {}}
                        >
                          {isUnlocked ? 'ロック' : '解除'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSection === 'archive' && (
              <div className="glass-card p-8 rounded-2xl space-y-6">
                <h3 className="font-serif font-bold text-xl" style={{ color: colors.deepBrown }}>
                  アーカイブ動画設定
                </h3>

                <div className="p-6 rounded-xl bg-white/40 space-y-4">
                  <h4 className="font-bold text-sm" style={{ color: colors.deepBrown }}>
                    Google Sheets連携
                  </h4>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={archiveSheetUrl}
                      onChange={(e) => setArchiveSheetUrl(e.target.value)}
                      className="flex-1 p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      style={{ color: colors.deepBrown }}
                    />
                    <button
                      onClick={syncArchiveData}
                      disabled={isSyncing}
                      className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2 text-white"
                      style={{ background: `linear-gradient(135deg, ${colors.berry}, ${colors.deepBrown})` }}
                    >
                      {isSyncing ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                      同期
                    </button>
                  </div>
                  {syncMessage && (
                    <div className={`p-3 rounded-xl text-sm ${syncMessage.includes('エラー') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {syncMessage}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-sm" style={{ color: colors.deepBrown }}>
                    アーカイブURL / 視聴期限
                  </h4>
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-left opacity-60" style={{ color: colors.deepBrown }}>
                        <th className="pb-2 w-20">Day</th>
                        <th className="pb-2">URL</th>
                        <th className="pb-2 w-52">視聴期限</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {(siteSettings?.active_days || [1, 2, 3]).map((day: number) => {
                        const archiveUrls = [day1ArchiveUrl, day2ArchiveUrl, day3ArchiveUrl];
                        const archiveSetters = [setDay1ArchiveUrl, setDay2ArchiveUrl, setDay3ArchiveUrl];
                        const archiveDeadlines = [day1ArchiveDeadline, day2ArchiveDeadline, day3ArchiveDeadline];
                        const archiveDeadlineSetters = [setDay1ArchiveDeadline, setDay2ArchiveDeadline, setDay3ArchiveDeadline];
                        return { day, value: archiveUrls[day - 1], setter: archiveSetters[day - 1], deadline: archiveDeadlines[day - 1], deadlineSetter: archiveDeadlineSetters[day - 1] };
                      }).map(({ day, value, setter, deadline, deadlineSetter }) => (
                        <tr key={day}>
                          <td className="py-2 font-bold" style={{ color: colors.deepBrown }}>Day {day}</td>
                          <td className="py-2 pr-3">
                            <input
                              type="url"
                              value={value}
                              onChange={(e) => setter(e.target.value)}
                              className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                              placeholder="https://..."
                              style={{ color: colors.deepBrown }}
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="datetime-local"
                              value={deadline}
                              onChange={(e) => deadlineSetter(e.target.value)}
                              className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                              style={{ color: colors.deepBrown }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    onClick={saveArchiveUrls}
                    disabled={isSavingUrls}
                    className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 text-white"
                    style={{ background: `linear-gradient(135deg, ${colors.gold}, #FFD700)` }}
                  >
                    {isSavingUrls ? '保存中...' : '保存'}
                  </button>

                  {urlSaveMessage && (
                    <div className={`p-3 rounded-xl text-sm ${urlSaveMessage.includes('エラー') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {urlSaveMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-6 rounded-xl bg-white/40 space-y-4">
              <h4 className="font-bold text-sm" style={{ color: colors.deepBrown }}>
                【管理者用/デバッグ】ユーザー状態リセット
              </h4>
              <p className="text-xs text-red-500 font-bold">
                ※注意: 診断結果、課題（Day 1/2）、進行状況を全てリセットし、オープニング前に戻します。
              </p>
              <button
                onClick={async () => {
                  if (!confirm('本当にユーザー状態をリセットしますか？この操作は取り消せません。')) return;

                  try {
                    setIsSyncing(true); // Reuse syncing loader
                    setSyncMessage('リセット中...');

                    await updateStory({
                      brain_type: null,
                      user_phase: 'passenger', // Force back to passenger
                      intro_progress: 0,
                      day1_field1: null, // Clear assignments
                      day1_field2: null,
                      day1_field3: null,
                      day2_field1: null,
                      day2_field2: null,
                      day2_field3: null,
                      day3_field1: null,
                      day3_field2: null,
                      day3_field3: null,
                      is_gift_sent: false,
                      is_locked: false, // Ensure not locked out
                      unlocked_days: [], // Reset unlocks
                      progress: 0,
                      daily_logs: {},
                    });

                    // Clear ALL local storage for complete reset
                    localStorage.clear();

                    setSyncMessage('✅ 完全リセット完了！リロードします。');
                    setTimeout(() => window.location.reload(), 1000);

                  } catch (e) {
                    console.error(e);
                    setSyncMessage('リセット失敗: ' + (e as Error).message);
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                disabled={isSyncing}
                className="w-full px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 text-white bg-red-500"
              >
                ユーザー状態を完全リセット (Passenger初期化)
              </button>

              {/* Phase toggle solely for testing */}
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await updateStory({ user_phase: 'passenger' });
                    alert('Switched to Passenger Phase');
                    window.location.reload();
                  }}
                  className="flex-1 py-2 text-xs bg-gray-200 rounded"
                >
                  Force Passenger
                </button>
                <button
                  onClick={async () => {
                    await updateStory({ user_phase: 'commander' });
                    setShowGateOpening(true);
                  }}
                  className="flex-1 py-2 text-xs bg-indigo-200 text-indigo-800 rounded font-bold"
                >
                  Force Commander
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('天気（HRVログ）をリセットしますか？')) return;
                    const today = new Date().toISOString().split('T')[0];
                    const logs = { ...(story.daily_logs || {}) };
                    delete logs[today];
                    await updateStory({ daily_logs: logs });
                    alert('Reset Weather Logs');
                    window.location.reload();
                  }}
                  className="flex-1 py-2 text-xs bg-cyan-200 text-cyan-800 rounded font-bold"
                >
                  Reset Weather
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('個人セッション予約をリセットしますか？')) return;
                    await updateStory({ event_schedule: null, event_url: null } as any);
                    alert('予約をリセットしました');
                    window.location.reload();
                  }}
                  className="flex-1 py-2 text-xs bg-orange-200 text-orange-800 rounded font-bold"
                >
                  Reset Reservation
                </button>
              </div>

              {/* 21 Day Program Debug */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPointCard(true)}
                  className="flex-1 py-2 text-xs bg-purple-200 text-purple-800 rounded font-bold"
                >
                  📊 Point Card
                </button>
                <button
                  onClick={() => setShowGateOpening(true)}
                  className="flex-1 py-2 text-xs bg-pink-200 text-pink-800 rounded font-bold"
                >
                  🚀 Gate Opening
                </button>
                <button
                  onClick={() => setShowTrinityCode(true)}
                  className="flex-1 py-2 text-xs bg-cyan-200 text-cyan-800 rounded font-bold"
                >
                  🛰️ Trinity Code
                </button>
              </div>

              {/* State Machine Debug */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={async () => {
                    if (!confirm('全ての進捗をリセットして PASSENGER に戻しますか？\n（localStorage も完全クリアされます）')) return;
                    await updateStory({
                      brain_type: null,
                      user_phase: 'passenger',
                      day1_field1: null,
                      day1_field2: null,
                      day1_field3: null,
                      day2_field1: null,
                      day2_field2: null,
                      day2_field3: null,
                      day3_field1: null,
                      day3_field2: null,
                      day3_field3: null,
                      day1_reward_viewed: false,
                      day2_reward_viewed: false,
                      day3_reward_viewed: false,
                      daily_logs: {},
                      unlocked_days: null,
                      progress: 0,
                    } as any);
                    // Clear ALL localStorage
                    localStorage.clear();
                    alert('✅ 完全リセット完了！\nPassengerとして再スタートします。');
                    window.location.reload();
                  }}
                  className="flex-1 py-2 text-xs bg-red-200 text-red-800 rounded font-bold"
                >
                  🔄 完全リセット
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('全課題完了扱いにして COMMANDER へ昇格しますか？')) return;
                    await updateStory({
                      brain_type: 'left_2d',
                      user_phase: 'commander',
                      day1_field1: 'Fast Forward',
                      day2_field1: 'Fast Forward',
                      day3_field1: 'Fast Forward',
                      day1_reward_viewed: true,
                      day2_reward_viewed: true,
                      day3_reward_viewed: true,
                    } as any);
                    localStorage.setItem('hasSeenBoardingPass', 'true');
                    localStorage.setItem('promo_dismissed', 'true');
                    alert('Fast Forward to COMMANDER');
                    window.location.reload();
                  }}
                  className="flex-1 py-2 text-xs bg-green-200 text-green-800 rounded font-bold"
                >
                  ⏩ Fast Forward
                </button>
              </div>

            </div>

            {activeSection === 'reward' && (
              <div className="glass-card p-8 rounded-2xl space-y-6">
                <h3 className="font-serif font-bold text-xl" style={{ color: colors.deepBrown }}>
                  プレゼントURL設定
                </h3>

                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-left opacity-60" style={{ color: colors.deepBrown }}>
                      <th className="pb-2 w-32">種別</th>
                      <th className="pb-2">URL</th>
                      <th className="pb-2 w-52">課題提出期限</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ...(siteSettings?.active_days || [1, 2, 3]).map((day: number) => {
                        const rewardUrls = [day1RewardUrl, day2RewardUrl, day3RewardUrl];
                        const rewardSetters = [setDay1RewardUrl, setDay2RewardUrl, setDay3RewardUrl];
                        const assignmentDeadlines = [day1AssignmentDeadline, day2AssignmentDeadline, day3AssignmentDeadline];
                        const assignmentDeadlineSetters = [setDay1AssignmentDeadline, setDay2AssignmentDeadline, setDay3AssignmentDeadline];
                        return { key: `day${day}`, label: `Day${day}`, value: rewardUrls[day - 1], setter: rewardSetters[day - 1], deadline: assignmentDeadlines[day - 1], deadlineSetter: assignmentDeadlineSetters[day - 1], hasDeadline: true };
                      }),
                      { key: 'perfect', label: 'Perfect', value: perfectRewardUrl, setter: setPerfectRewardUrl, deadline: '', deadlineSetter: () => { }, hasDeadline: false },
                    ].map(({ key, label, value, setter, deadline, deadlineSetter, hasDeadline }) => (
                      <tr key={key}>
                        <td className="py-2 font-bold" style={{ color: colors.deepBrown }}>{label}</td>
                        <td className="py-2 pr-3">
                          <input
                            type="url"
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                            placeholder="https://..."
                            style={{ color: colors.deepBrown }}
                          />
                        </td>
                        <td className="py-2">
                          {hasDeadline ? (
                            <input
                              type="datetime-local"
                              value={deadline}
                              onChange={(e) => deadlineSetter(e.target.value)}
                              className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                              style={{ color: colors.deepBrown }}
                            />
                          ) : (
                            <span className="text-xs opacity-50" style={{ color: colors.deepBrown }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  onClick={saveRewardUrls}
                  disabled={isSavingRewards}
                  className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 text-white"
                  style={{ background: `linear-gradient(135deg, ${colors.rose}, ${colors.primaryDeep})` }}
                >
                  {isSavingRewards ? '保存中...' : '保存'}
                </button>

                {rewardSaveMessage && (
                  <div className={`p-3 rounded-xl text-sm ${rewardSaveMessage.includes('エラー') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {rewardSaveMessage}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'banner' && (
              <div className="glass-card p-8 rounded-2xl space-y-6">
                <h3 className="font-serif font-bold text-xl" style={{ color: colors.deepBrown }}>
                  基本設定
                </h3>

                <div className="p-6 rounded-xl bg-white/40 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                        サイトタイトル
                      </label>
                      <input
                        type="text"
                        value={siteTitle}
                        onChange={(e) => setSiteTitle(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                        placeholder="絵本で「未来を設定する」ノート"
                        style={{ color: colors.deepBrown }}
                      />
                      <p className="text-xs mt-1 opacity-60" style={{ color: colors.deepBrown }}>
                        アプリのメインタイトルです。ログイン画面とヘッダーに表示されます。
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                        サイトサブタイトル
                      </label>
                      <input
                        type="text"
                        value={siteSubtitle}
                        onChange={(e) => setSiteSubtitle(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                        placeholder="2026年、最高の物語をここから。"
                        style={{ color: colors.deepBrown }}
                      />
                      <p className="text-xs mt-1 opacity-60" style={{ color: colors.deepBrown }}>
                        タイトルの下に表示されるサブタイトルです。
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                        アプリタイトル
                      </label>
                      <input
                        type="text"
                        value={appTitle}
                        onChange={(e) => setAppTitle(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                        placeholder="絵本で「未来を設定する」ノート"
                        style={{ color: colors.deepBrown }}
                      />
                      <p className="text-xs mt-1 opacity-60" style={{ color: colors.deepBrown }}>
                        LINEメッセージの
                        <code className="bg-white/50 px-1 rounded mx-1">{'{{app_title}}'}</code>
                        で使用されます
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                        フッター1行目
                      </label>
                      <input
                        type="text"
                        value={footerLine1}
                        onChange={(e) => setFooterLine1(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                        placeholder="Produced by 絵本未来創造機構"
                        style={{ color: colors.deepBrown }}
                      />
                      <p className="text-xs mt-1 opacity-60" style={{ color: colors.deepBrown }}>
                        ページ下部に表示される1行目のテキストです
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                        フッター2行目
                      </label>
                      <input
                        type="text"
                        value={footerLine2}
                        onChange={(e) => setFooterLine2(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                        placeholder="© 2026 EQ E-HON COACHING"
                        style={{ color: colors.deepBrown }}
                      />
                      <p className="text-xs mt-1 opacity-60" style={{ color: colors.deepBrown }}>
                        ページ下部に表示される2行目のテキストです
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                        バナー画像のアップロード
                      </label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                setUploadBannerMessage('ファイルサイズは5MB以下にしてください');
                                return;
                              }
                              uploadBannerImage(file);
                            }
                          }}
                          disabled={isUploadingBanner}
                          className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:text-white disabled:opacity-50"
                          style={{
                            color: colors.deepBrown,
                          }}
                        />
                        {uploadBannerMessage && (
                          <div className={`p-3 rounded-xl text-sm ${uploadBannerMessage.includes('エラー') || uploadBannerMessage.includes('サイズ') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {uploadBannerMessage}
                          </div>
                        )}
                        {isUploadingBanner && (
                          <div className="text-sm" style={{ color: colors.deepBrown }}>
                            アップロード中...
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                        バナー画像URL（直接入力も可能）
                      </label>
                      <input
                        type="url"
                        value={bannerImageUrl}
                        onChange={(e) => setBannerImageUrl(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                        placeholder="https://example.com/image.png (空欄の場合はハートアイコンを表示)"
                        style={{ color: colors.deepBrown }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                        メインテキスト（1行目）
                      </label>
                      <input
                        type="text"
                        value={bannerText}
                        onChange={(e) => setBannerText(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                        placeholder="個別セッションでは、この物語を一緒に読み解き、"
                        style={{ color: colors.deepBrown }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                        サブテキスト（2行目）
                      </label>
                      <input
                        type="text"
                        value={bannerSubtext}
                        onChange={(e) => setBannerSubtext(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                        placeholder="あなたの魂を癒す「魔法のアファメーション」を贈ります。"
                        style={{ color: colors.deepBrown }}
                      />
                    </div>



                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                        ボタンテキスト
                      </label>
                      <input
                        type="text"
                        value={bannerButtonText}
                        onChange={(e) => setBannerButtonText(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                        placeholder="物語の続きをセッションで描く"
                        style={{ color: colors.deepBrown }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                        個別セッションお申し込みURL
                      </label>
                      <input
                        type="url"
                        value={bannerLinkUrl}
                        onChange={(e) => setBannerLinkUrl(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                        placeholder="https://utage-system.com/..."
                        style={{ color: colors.deepBrown }}
                      />
                      <p className="text-xs mt-1 opacity-60" style={{ color: colors.deepBrown }}>
                        ユーザーID（?custom_id=...）は自動で付与されます
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={saveBannerSettings}
                    disabled={isSavingBanner}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 text-white"
                    style={{ background: `linear-gradient(135deg, ${colors.rose}, ${colors.berry})` }}
                  >
                    {isSavingBanner ? '保存中...' : '設定を保存'}
                  </button>

                  {bannerSaveMessage && (
                    <div className={`p-3 rounded-xl text-sm ${bannerSaveMessage.includes('エラー') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {bannerSaveMessage}
                    </div>
                  )}

                  <div className="pt-6 border-t border-white/30">
                    <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: colors.deepBrown }}>
                      <Smartphone size={16} />
                      バナープレビュー（スマホ横幅: 360px）
                    </p>
                    <div className="flex justify-center">
                      <div className="w-[360px] rounded-2xl border-4 border-gray-800 overflow-hidden shadow-2xl" style={{ background: '#f5f5f5' }}>
                        <div className="bg-gray-800 h-6 flex items-center justify-center">
                          <div className="w-16 h-3 bg-gray-900 rounded-full"></div>
                        </div>
                        <div className="p-4" style={{ background: 'linear-gradient(to bottom, #FFF5F7, #FFE8E8)' }}>
                          <div className="text-center space-y-4">
                            {bannerImageUrl ? (
                              <div className="w-full rounded-xl overflow-hidden shadow-lg">
                                <img src={bannerImageUrl} alt="バナー画像" className="w-full h-auto object-contain" />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                                style={{ background: colors.sakura }}>
                                <Heart style={{ color: colors.rose }} size={32} />
                              </div>
                            )}
                            <p className="text-xs leading-relaxed opacity-70" style={{ color: colors.deepBrown }}>
                              {bannerText}<br />
                              {bannerSubtext}
                            </p>
                            <div className="w-full py-4 rounded-full text-white font-bold text-sm shadow-xl text-center"
                              style={{ background: `linear-gradient(to right, ${colors.rose}, ${colors.berry})` }}>
                              {bannerButtonText}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'day' && (
              <DaySettingsEditor />
            )}

            {activeSection === 'diagnosis' && (
              <DiagnosisSettingsEditor />
            )}

            {activeSection === 'ai' && (
              <AISettingsEditor />
            )}

            {activeSection === 'line' && (
              <LineSettingsEditor />
            )}

            {activeSection === 'templates' && (
              <LineTemplatesEditor />
            )}
          </div>
        </div>
      </div >
    );
  };

  const DaySettingsEditor = () => {
    const [editingDay, setEditingDay] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
      subtitle: '',
      title: '',
      date: '',
      description: '',
      questions: [] as Array<{ fieldName: string; label: string; placeholder: string; type?: string; options?: string[] }>,
      zoom_link: '',
      zoom_passcode: '',
      zoom_meeting_time: '',
      youtube_url: '',
      preview_text: '',
      preview_image_url: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [activeDays, setActiveDays] = useState<number[]>(siteSettings?.active_days || [1, 2, 3]);
    const [isManagingDays, setIsManagingDays] = useState(false);
    const [isSavingActiveDays, setIsSavingActiveDays] = useState(false);
    const [activeDaysMessage, setActiveDaysMessage] = useState('');
    const [isUploadingPreviewImage, setIsUploadingPreviewImage] = useState(false);
    const previewImageInputRef = useRef<HTMLInputElement>(null);

    const startEditing = (day: number) => {
      const setting = daySettings[day];
      if (setting) {
        setEditForm({
          subtitle: setting.subtitle,
          title: setting.title,
          date: setting.date,
          description: setting.description,
          questions: setting.questions || [],
          zoom_link: setting.zoom_link || '',
          zoom_passcode: setting.zoom_passcode || '',
          zoom_meeting_time: setting.zoom_meeting_time || '',
          youtube_url: setting.youtube_url || '',
          preview_text: setting.preview_text || '',
          preview_image_url: setting.preview_image_url || ''
        });
        setEditingDay(day);
      }
    };

    const cancelEditing = () => {
      setEditingDay(null);
      setEditForm({ subtitle: '', title: '', date: '', description: '', questions: [], zoom_link: '', zoom_passcode: '', zoom_meeting_time: '', youtube_url: '', preview_text: '', preview_image_url: '' });
      setSaveMessage('');
    };

    const saveSettings = async () => {
      if (!editingDay) return;

      setIsSaving(true);
      setSaveMessage('');

      try {
        const success = await updateDaySetting(editingDay, {
          subtitle: editForm.subtitle,
          title: editForm.title,
          date: editForm.date,
          description: editForm.description,
          questions: editForm.questions,
          zoom_link: editForm.zoom_link || undefined,
          zoom_passcode: editForm.zoom_passcode || undefined,
          zoom_meeting_time: editForm.zoom_meeting_time || undefined,
          youtube_url: editForm.youtube_url || undefined,
          preview_text: editForm.preview_text || undefined,
          preview_image_url: editForm.preview_image_url || undefined
        });

        if (success) {
          setSaveMessage('設定を保存しました');
          await reloadDaySettings();
          setTimeout(() => {
            setEditingDay(null);
            setSaveMessage('');
          }, 1500);
        } else {
          setSaveMessage('保存に失敗しました');
        }
      } catch (error) {
        console.error('Error saving day settings:', error);
        setSaveMessage('保存中にエラーが発生しました');
      } finally {
        setIsSaving(false);
      }
    };

    const updateQuestion = (index: number, field: string, value: string) => {
      const newQuestions = [...editForm.questions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      setEditForm({ ...editForm, questions: newQuestions });
    };

    const addQuestion = () => {
      const newFieldName = `field${editForm.questions.length + 1}`;
      setEditForm({
        ...editForm,
        questions: [...editForm.questions, { fieldName: newFieldName, label: '', placeholder: '', type: 'textarea' }]
      });
    };

    const removeQuestion = (index: number) => {
      const newQuestions = editForm.questions.filter((_, i) => i !== index);
      setEditForm({ ...editForm, questions: newQuestions });
    };

    const toggleDayInActiveDays = (day: number) => {
      if (activeDays.includes(day)) {
        setActiveDays(activeDays.filter(d => d !== day));
      } else {
        setActiveDays([...activeDays, day].sort((a, b) => a - b));
      }
    };

    const saveActiveDays = async () => {
      setIsSavingActiveDays(true);
      setActiveDaysMessage('');

      try {
        await updateSiteSettings({ active_days: activeDays as any });
        setActiveDaysMessage('有効な日数を保存しました');
        setIsManagingDays(false);
      } catch (error) {
        console.error('Error saving active days:', error);
        setActiveDaysMessage('保存中にエラーが発生しました');
      } finally {
        setIsSavingActiveDays(false);
      }
    };

    const createNewDaySetting = async (day: number) => {
      try {
        const { error } = await supabase
          .from('day_settings')
          .insert([{
            day,
            subtitle: `Chapter ${['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][day - 1] || day}`,
            title: `Day ${day}`,
            date: '',
            description: '',
            questions: [],
            bg_color: ['sage', 'sky', 'sakura'][day % 3],
            is_active: true
          }]);

        if (!error) {
          await reloadDaySettings();
          setTimeout(() => {
            startEditing(day);
          }, 300);
        } else {
          console.error('Error creating day setting:', error);
          alert('Day設定の作成に失敗しました');
        }
      } catch (error) {
        console.error('Error creating day setting:', error);
        alert('Day設定の作成中にエラーが発生しました');
      }
    };

    const handlePreviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editingDay) return;

      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
      }

      setIsUploadingPreviewImage(true);

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `day${editingDay}-preview-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('preview-images')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert('画像のアップロードに失敗しました');
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('preview-images')
          .getPublicUrl(filePath);

        setEditForm({ ...editForm, preview_image_url: publicUrl });
        alert('画像をアップロードしました');
      } catch (error) {
        console.error('Error uploading preview image:', error);
        alert('画像のアップロード中にエラーが発生しました');
      } finally {
        setIsUploadingPreviewImage(false);
        if (previewImageInputRef.current) {
          previewImageInputRef.current.value = '';
        }
      }
    };

    return (
      <div className="glass-card p-8 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-xl" style={{ color: colors.deepBrown }}>
            課題内容設定
          </h3>
          <button
            onClick={() => setIsManagingDays(!isManagingDays)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 text-white"
            style={{ background: `linear-gradient(135deg, ${colors.rose}, ${colors.berry})` }}
          >
            {isManagingDays ? 'キャンセル' : '有効な日数を設定'}
          </button>
        </div>

        {isManagingDays && (
          <div className="p-6 rounded-xl bg-white/40 space-y-4">
            <div className="text-sm font-bold" style={{ color: colors.deepBrown }}>
              有効な日数を選択（例：Day1, Day3, Day5, Day7など）
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => (
                <button
                  key={day}
                  onClick={() => toggleDayInActiveDays(day)}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${activeDays.includes(day)
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-white/50 opacity-50 hover:opacity-75'
                    }`}
                  style={activeDays.includes(day) ? {
                    background: `linear-gradient(135deg, ${colors.sage}, ${colors.sky})`
                  } : { color: colors.deepBrown }}
                >
                  Day {day}
                </button>
              ))}
            </div>
            <button
              onClick={saveActiveDays}
              disabled={isSavingActiveDays || activeDays.length === 0}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 text-white"
              style={{ background: `linear-gradient(135deg, ${colors.rose}, ${colors.berry})` }}
            >
              {isSavingActiveDays ? '保存中...' : '有効な日数を保存'}
            </button>
            {activeDaysMessage && (
              <div className={`p-3 rounded-xl text-sm ${activeDaysMessage.includes('エラー') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {activeDaysMessage}
              </div>
            )}
          </div>
        )}

        {!editingDay && !isManagingDays ? (
          <div className="grid grid-cols-3 gap-4">
            {activeDays.map(day => {
              const setting = daySettings[day];
              return (
                <div
                  key={day}
                  className="p-6 rounded-xl bg-white/40 flex flex-col"
                >
                  <div className="flex-1">
                    <div className="font-bold text-base mb-1" style={{ color: colors.deepBrown }}>
                      Day {day}
                    </div>
                    <div className="text-sm mb-1" style={{ color: colors.deepBrown }}>
                      {setting?.title || '未設定'}
                    </div>
                    <div className="text-xs opacity-60" style={{ color: colors.deepBrown }}>
                      {setting?.questions?.length || 0}個の質問
                    </div>
                  </div>
                  {setting ? (
                    <button
                      onClick={() => startEditing(day)}
                      className="mt-4 w-full py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 text-white"
                      style={{ background: `linear-gradient(135deg, ${colors.sage}, ${colors.sky})` }}
                    >
                      編集
                    </button>
                  ) : (
                    <button
                      onClick={() => createNewDaySetting(day)}
                      className="mt-4 w-full py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 text-white"
                      style={{ background: `linear-gradient(135deg, ${colors.rose}, ${colors.berry})` }}
                    >
                      作成
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg" style={{ color: colors.deepBrown }}>
                Day {editingDay} の設定
              </h4>
              <button
                onClick={cancelEditing}
                className="text-xs opacity-60 hover:opacity-100"
                style={{ color: colors.deepBrown }}
              >
                キャンセル
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs opacity-70" style={{ color: colors.deepBrown }}>サブタイトル</label>
                <input
                  type="text"
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-white/50 text-sm paper-texture outline-none"
                  placeholder="例: Chapter One"
                  style={{ color: colors.deepBrown }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs opacity-70" style={{ color: colors.deepBrown }}>タイトル</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-3 rounded-xl border-2 border-white/50 text-sm paper-texture outline-none"
                  placeholder="例: 記憶の森"
                  style={{ color: colors.deepBrown }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs opacity-70" style={{ color: colors.deepBrown }}>日付表示</label>
              <input
                type="text"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-white/50 text-sm paper-texture outline-none"
                placeholder="例: 1/17(土)"
                style={{ color: colors.deepBrown }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs opacity-70" style={{ color: colors.deepBrown }}>説明文</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-white/50 text-sm paper-texture outline-none resize-none"
                rows={3}
                placeholder="このDayの説明"
                style={{ color: colors.deepBrown }}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs opacity-70 font-bold" style={{ color: colors.deepBrown }}>
                  質問項目
                </label>
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: colors.sage + '40', color: colors.deepBrown }}
                >
                  <Plus size={12} /> 追加
                </button>
              </div>

              {editForm.questions.map((q, index) => (
                <div key={index} className="p-3 rounded-xl bg-white/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold opacity-60" style={{ color: colors.deepBrown }}>
                      質問 {index + 1}
                    </span>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={q.label}
                    onChange={(e) => updateQuestion(index, 'label', e.target.value)}
                    className="w-full p-2 rounded-lg border border-white/50 text-xs paper-texture outline-none"
                    placeholder="質問文"
                    style={{ color: colors.deepBrown }}
                  />
                  <input
                    type="text"
                    value={q.placeholder}
                    onChange={(e) => updateQuestion(index, 'placeholder', e.target.value)}
                    className="w-full p-2 rounded-lg border border-white/50 text-xs paper-texture outline-none"
                    placeholder="プレースホルダー（例: ...）"
                    style={{ color: colors.deepBrown }}
                  />
                  <select
                    value={q.type || 'textarea'}
                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                    className="w-full p-2 rounded-lg border border-white/50 text-xs paper-texture outline-none"
                    style={{ color: colors.deepBrown }}
                  >
                    <option value="textarea">テキストエリア</option>
                    <option value="radio">ラジオボタン（はい/いいえ）</option>
                    <option value="rating">評価（10段階）</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-xs opacity-70 font-bold" style={{ color: colors.deepBrown }}>
                Zoom参加リンク
              </label>
              <input
                type="url"
                value={editForm.zoom_link}
                onChange={(e) => setEditForm({ ...editForm, zoom_link: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-white/50 text-sm paper-texture outline-none"
                placeholder="https://zoom.us/j/..."
                style={{ color: colors.deepBrown }}
              />
              <p className="text-xs opacity-50" style={{ color: colors.deepBrown }}>
                前日の課題提出完了者のみに表示されます
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs opacity-70 font-bold" style={{ color: colors.deepBrown }}>
                Zoomパスコード
              </label>
              <input
                type="text"
                value={editForm.zoom_passcode}
                onChange={(e) => setEditForm({ ...editForm, zoom_passcode: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-white/50 text-sm paper-texture outline-none"
                placeholder="123456"
                style={{ color: colors.deepBrown }}
              />
              <p className="text-xs opacity-50" style={{ color: colors.deepBrown }}>
                パスコードが必要な場合のみ入力してください
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs opacity-70 font-bold" style={{ color: colors.deepBrown }}>
                Zoom開催日時
              </label>
              <input
                type="datetime-local"
                value={editForm.zoom_meeting_time}
                onChange={(e) => setEditForm({ ...editForm, zoom_meeting_time: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-white/50 text-sm paper-texture outline-none"
                style={{ color: colors.deepBrown }}
              />
              <p className="text-xs opacity-50" style={{ color: colors.deepBrown }}>
                Googleカレンダー追加機能で使用されます
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs opacity-70 font-bold" style={{ color: colors.deepBrown }}>
                YouTube動画URL
              </label>
              <input
                type="url"
                value={editForm.youtube_url}
                onChange={(e) => setEditForm({ ...editForm, youtube_url: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-white/50 text-sm paper-texture outline-none"
                placeholder="https://www.youtube.com/watch?v=... または https://youtu.be/..."
                style={{ color: colors.deepBrown }}
              />
              <p className="text-xs opacity-50" style={{ color: colors.deepBrown }}>
                課題ページに埋め込み表示されます。90%視聴で完了検知します。
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs opacity-70 font-bold" style={{ color: colors.deepBrown }}>
                未開放時のプレビューテキスト
              </label>
              <textarea
                value={editForm.preview_text}
                onChange={(e) => setEditForm({ ...editForm, preview_text: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-white/50 text-sm paper-texture outline-none resize-none"
                rows={2}
                placeholder="例: 次の動画：才能フローの秘密"
                style={{ color: colors.deepBrown }}
              />
              <p className="text-xs opacity-50" style={{ color: colors.deepBrown }}>
                未開放時のロック画面に表示され、期待感を高めます
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs opacity-70 font-bold" style={{ color: colors.deepBrown }}>
                プレビュー画像URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={editForm.preview_image_url}
                  onChange={(e) => setEditForm({ ...editForm, preview_image_url: e.target.value })}
                  className="flex-1 p-3 rounded-xl border-2 border-white/50 text-sm paper-texture outline-none"
                  placeholder="https://example.com/image.jpg"
                  style={{ color: colors.deepBrown }}
                />
                <input
                  ref={previewImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePreviewImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => previewImageInputRef.current?.click()}
                  disabled={isUploadingPreviewImage}
                  className="px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50 text-white whitespace-nowrap"
                  style={{ background: `linear-gradient(135deg, ${colors.berry}, ${colors.rose})` }}
                >
                  {isUploadingPreviewImage ? 'アップロード中...' : '画像選択'}
                </button>
              </div>
              <p className="text-xs opacity-50" style={{ color: colors.deepBrown }}>
                ロック画面の背景にぼかして表示されます
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 text-white"
                style={{ background: `linear-gradient(135deg, ${colors.sage}, ${colors.sky})` }}
              >
                {isSaving ? '保存中...' : '設定を保存'}
              </button>
              {saveMessage && (
                <span className={`text-sm ${saveMessage.includes('エラー') || saveMessage.includes('失敗') ? 'text-red-600' : 'text-green-600'}`}>
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  interface DiagnosticQuestion {
    question_id: string;
    question_text: string;
    options: Array<{
      option_id: string;
      option_text: string;
      brain_type: string;
      score: number;
    }>;
  }

  interface Diagnostic {
    id: string;
    theme: string;
    title: string;
    description: string;
    questions: DiagnosticQuestion[];
    is_active: boolean;
    display_order: number;
  }

  const BRAIN_TYPE_LABELS: Record<string, { name: string; description: string; color: string }> = {
    left_3d: { name: '左脳3次元（合理主義）', description: '論理的・効率的・本質重視', color: '#3B82F6' },
    left_2d: { name: '左脳2次元（原理主義）', description: '緻密・規則重視・計画的', color: '#10B981' },
    right_3d: { name: '右脳3次元（拡張主義）', description: '行動的・情熱的・独創的', color: '#F59E0B' },
    right_2d: { name: '右脳2次元（温情主義）', description: '人間関係重視・共感・協力', color: '#EC4899' },
  };

  const DiagnosisSettingsEditor = () => {
    const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingDiagnostic, setEditingDiagnostic] = useState<Diagnostic | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateTheme, setGenerateTheme] = useState('');
    const [generateCount, setGenerateCount] = useState(7);
    const [generateProvider, setGenerateProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
    const [generatedQuestions, setGeneratedQuestions] = useState<DiagnosticQuestion[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [newDiagnosticTitle, setNewDiagnosticTitle] = useState('');
    const [newDiagnosticDescription, setNewDiagnosticDescription] = useState('');

    useEffect(() => {
      loadDiagnostics();
    }, []);

    const loadDiagnostics = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data) {
        setDiagnostics(data);
      }
      setIsLoading(false);
    };

    const generateQuestions = async () => {
      if (!generateTheme.trim()) {
        setMessage('テーマを入力してください');
        return;
      }

      setIsGenerating(true);
      setMessage('');
      setGeneratedQuestions([]);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-diagnostic-questions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              theme: generateTheme,
              question_count: generateCount,
              provider: generateProvider,
            }),
          }
        );

        const result = await response.json();

        if (result.error) {
          setMessage(result.error);
        } else if (result.questions) {
          setGeneratedQuestions(result.questions);
          if (result.title) {
            setNewDiagnosticTitle(result.title);
          }
          if (result.description) {
            setNewDiagnosticDescription(result.description);
          }
          setMessage(`${result.questions.length}問の質問を生成しました`);
        }
      } catch (err) {
        setMessage('質問の生成に失敗しました');
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
    };

    const saveDiagnostic = async () => {
      if (!newDiagnosticTitle.trim() || generatedQuestions.length === 0) {
        setMessage('タイトルと質問を設定してください');
        return;
      }

      setIsSaving(true);

      try {
        const { error } = await supabase.from('diagnostics').insert({
          theme: generateTheme,
          title: newDiagnosticTitle,
          description: newDiagnosticDescription,
          questions: generatedQuestions,
          is_active: true,
          display_order: diagnostics.length,
        });

        if (error) throw error;

        setMessage('診断セットを保存しました');
        setGeneratedQuestions([]);
        setGenerateTheme('');
        setNewDiagnosticTitle('');
        setNewDiagnosticDescription('');
        await loadDiagnostics();
      } catch (err) {
        setMessage('保存に失敗しました');
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    };

    const toggleDiagnosticActive = async (id: string, isActive: boolean) => {
      const { error } = await supabase
        .from('diagnostics')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (!error) {
        await loadDiagnostics();
      }
    };

    const deleteDiagnostic = async (id: string) => {
      if (!confirm('この診断セットを削除してもよろしいですか？')) return;

      const { error } = await supabase.from('diagnostics').delete().eq('id', id);

      if (!error) {
        await loadDiagnostics();
        setMessage('診断セットを削除しました');
      }
    };

    return (
      <div className="glass-card p-8 rounded-2xl space-y-6">
        <h3 className="font-serif font-bold text-xl" style={{ color: colors.deepBrown }}>
          脳タイプ診断設定
        </h3>

        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.5)' }}>
          <h4 className="font-bold text-sm mb-3" style={{ color: colors.deepBrown }}>
            脳優位タイプについて
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(BRAIN_TYPE_LABELS).map(([key, value]) => (
              <div key={key} className="p-3 rounded-lg bg-white/60">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: value.color }}></div>
                  <span className="font-bold text-xs" style={{ color: colors.deepBrown }}>{value.name}</span>
                </div>
                <p className="text-xs opacity-70" style={{ color: colors.deepBrown }}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl border-2 border-dashed border-white/60" style={{ background: 'rgba(255,255,255,0.3)' }}>
          <h4 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: colors.deepBrown }}>
            <Sparkles size={16} />
            AI診断質問を生成
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                テーマ
              </label>
              <input
                type="text"
                value={generateTheme}
                onChange={(e) => setGenerateTheme(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                placeholder="例: 仕事の進め方、コミュニケーションスタイル、決断の仕方"
                style={{ color: colors.deepBrown }}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                  質問数
                </label>
                <select
                  value={generateCount}
                  onChange={(e) => setGenerateCount(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                  style={{ color: colors.deepBrown }}
                >
                  {[5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n}問</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold mb-2" style={{ color: colors.deepBrown }}>
                  AIプロバイダー
                </label>
                <select
                  value={generateProvider}
                  onChange={(e) => setGenerateProvider(e.target.value as 'gemini' | 'openai' | 'anthropic')}
                  className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                  style={{ color: colors.deepBrown }}
                >
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateQuestions}
              disabled={isGenerating || !generateTheme.trim()}
              className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(to right, ${colors.rose}, ${colors.berry})` }}
            >
              {isGenerating ? '生成中...' : '質問を生成する'}
            </button>
          </div>
        </div>

        {generatedQuestions.length > 0 && (
          <div className="p-6 rounded-xl bg-white/40 space-y-4">
            <h4 className="font-bold text-sm" style={{ color: colors.deepBrown }}>
              生成された質問 ({generatedQuestions.length}問)
            </h4>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold" style={{ color: colors.deepBrown }}>
                    診断タイトル
                  </label>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/60" style={{ color: colors.sage }}>
                    AI生成
                  </span>
                </div>
                <input
                  type="text"
                  value={newDiagnosticTitle}
                  onChange={(e) => setNewDiagnosticTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none"
                  placeholder="例: あなたの脳タイプ診断"
                  style={{ color: colors.deepBrown }}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold" style={{ color: colors.deepBrown }}>
                    説明文
                  </label>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/60" style={{ color: colors.sage }}>
                    AI生成
                  </span>
                </div>
                <textarea
                  value={newDiagnosticDescription}
                  onChange={(e) => setNewDiagnosticDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none resize-none"
                  rows={2}
                  placeholder="診断の説明文を入力"
                  style={{ color: colors.deepBrown }}
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {generatedQuestions.map((q, idx) => (
                <div key={q.question_id} className="p-4 rounded-xl bg-white/60">
                  <p className="font-bold text-sm mb-2" style={{ color: colors.deepBrown }}>
                    Q{idx + 1}. {q.question_text}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <div key={opt.option_id} className="p-2 rounded-lg text-xs flex items-start gap-2"
                        style={{ background: 'rgba(255,255,255,0.6)' }}>
                        <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                          style={{ background: BRAIN_TYPE_LABELS[opt.brain_type]?.color || '#999' }}></div>
                        <span style={{ color: colors.deepBrown }}>{opt.option_text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveDiagnostic}
              disabled={isSaving || !newDiagnosticTitle.trim()}
              className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(to right, ${colors.sage}, ${colors.deepBrown})` }}
            >
              {isSaving ? '保存中...' : '診断セットとして保存'}
            </button>
          </div>
        )}

        {message && (
          <div className="p-3 rounded-xl text-center text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.6)', color: colors.deepBrown }}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-bold text-sm" style={{ color: colors.deepBrown }}>
            保存済み診断セット
          </h4>

          {isLoading ? (
            <div className="text-center py-4 opacity-60" style={{ color: colors.deepBrown }}>読み込み中...</div>
          ) : diagnostics.length === 0 ? (
            <div className="text-center py-4 opacity-60" style={{ color: colors.deepBrown }}>
              診断セットがありません
            </div>
          ) : (
            <div className="space-y-3">
              {diagnostics.map((diag) => (
                <div key={diag.id} className="p-4 rounded-xl bg-white/40 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm" style={{ color: colors.deepBrown }}>{diag.title}</p>
                    <p className="text-xs opacity-60" style={{ color: colors.deepBrown }}>
                      テーマ: {diag.theme} / {diag.questions.length}問
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleDiagnosticActive(diag.id, diag.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${diag.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {diag.is_active ? '有効' : '無効'}
                    </button>
                    <button
                      onClick={() => deleteDiagnostic(diag.id)}
                      className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  interface HealthMetric {
    id: string;
    line_user_id: string;
    heart_rate: number;
    hrv_sdnn: number;
    hrv_rmssd: number;
    stress_level: string;
    autonomic_balance: string;
    brain_type: string;
    ai_feedback: string;
    signal_quality: number;
    created_at: string;
    checkin_score?: number;
    body_score?: number;
    mind_score?: number;
    passion_score?: number;
    checkin_type?: string;
  }

  const HealthMetricsView = () => {
    const [metrics, setMetrics] = useState<HealthMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null);
    const [filterUserId, setFilterUserId] = useState('');
    const [filterMinScore, setFilterMinScore] = useState('');

    useEffect(() => {
      loadMetrics();
    }, []);

    const loadMetrics = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setMetrics(data);
      }
      setIsLoading(false);
    };

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const getStressColor = (level: string) => {
      switch (level) {
        case 'low': return 'bg-green-100 text-green-700';
        case 'high': return 'bg-red-100 text-red-700';
        default: return 'bg-yellow-100 text-yellow-700';
      }
    };

    const getBalanceLabel = (balance: string) => {
      switch (balance) {
        case 'parasympathetic': return 'リラックス';
        case 'sympathetic': return 'ストレス';
        default: return 'バランス良好';
      }
    };

    const getBrainTypeLabel = (type: string) => {
      const labels: Record<string, string> = {
        left_3d: '左脳3次元',
        left_2d: '左脳2次元',
        right_3d: '右脳3次元',
        right_2d: '右脳2次元'
      };
      return labels[type] || type || '未設定';
    };

    const filteredMetrics = metrics.filter(m => {
      const matchUser = m.line_user_id.toLowerCase().includes(filterUserId.toLowerCase());
      const matchScore = filterMinScore ? (m.checkin_score || 0) >= Number(filterMinScore) : true;
      return matchUser && matchScore;
    });

    return (
      <div className="glass-card p-8 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-xl" style={{ color: colors.deepBrown }}>
            自律神経・チェックインデータ
          </h3>
          <button
            onClick={loadMetrics}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
            style={{ color: colors.deepBrown }}
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/40">
          <div>
            <label className="text-xs font-bold block mb-1" style={{ color: colors.deepBrown }}>ユーザーID検索</label>
            <input
              type="text"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              placeholder="User ID..."
              className="w-full p-2 rounded-lg text-xs border border-white/50 bg-white/50 text-gray-800"
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1" style={{ color: colors.deepBrown }}>最小スコア</label>
            <input
              type="number"
              value={filterMinScore}
              onChange={(e) => setFilterMinScore(e.target.value)}
              placeholder="0-100"
              className="w-full p-2 rounded-lg text-xs border border-white/50 bg-white/50 text-gray-800"
            />
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="text-center py-8 opacity-60">読み込み中...</div>
          ) : filteredMetrics.length === 0 ? (
            <div className="text-center py-8 opacity-60">データがありません</div>
          ) : (
            filteredMetrics.map((metric) => (
              <div
                key={metric.id}
                onClick={() => setSelectedMetric(metric)}
                className="bg-white/60 p-4 rounded-xl hover:bg-white/80 transition-colors cursor-pointer border border-white/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm font-bold
                    ${metric.checkin_score !== undefined
                      ? (metric.checkin_score >= 80 ? 'bg-gradient-to-br from-yellow-300 to-orange-400 text-white' :
                        metric.checkin_score >= 60 ? 'bg-gradient-to-br from-blue-300 to-cyan-400 text-white' : 'bg-gray-100 text-gray-400')
                      : 'bg-gray-100'
                    }`}>
                    {metric.checkin_score !== undefined ? metric.checkin_score : '❤'}
                  </div>
                  <div>
                    <p className="font-bold text-xs truncate" style={{ color: colors.deepBrown, maxWidth: '120px' }}>
                      {metric.line_user_id}
                    </p>
                    <p className="text-xs opacity-60" style={{ color: colors.deepBrown }}>
                      {formatDate(metric.created_at)}
                    </p>
                  </div>
                </div>

                {metric.checkin_score !== undefined ? (
                  // Check-in Data Display
                  <div className="space-y-2">
                    <div className="flex gap-1 text-[10px] text-gray-400 justify-between">
                      <span className="px-2 py-0.5 bg-white rounded border border-blue-100 text-blue-400">体 {metric.body_score}</span>
                      <span className="px-2 py-0.5 bg-white rounded border border-emerald-100 text-emerald-400">心 {metric.mind_score}</span>
                      <span className="px-2 py-0.5 bg-white rounded border border-orange-100 text-orange-400">情 {metric.passion_score}</span>
                    </div>
                    {metric.ai_feedback && (
                      <div className="text-xs truncate text-gray-500 bg-white/50 px-2 py-1 rounded">
                        {metric.ai_feedback}
                      </div>
                    )}
                  </div>
                ) : (
                  // Legacy HRV Data Display
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStressColor(metric.stress_level || '')}`}>
                        {getBalanceLabel(metric.autonomic_balance || '')}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                        {getBrainTypeLabel(metric.brain_type || '')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs opacity-70 mb-2">
                      <div>心拍: <span className="font-bold">{metric.heart_rate}</span></div>
                      <div>元気: <span className="font-bold">{metric.signal_quality}</span></div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {selectedMetric && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedMetric(null)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg border-b pb-2">詳細データ</h3>

              {selectedMetric.checkin_score !== undefined ? (
                // Check-in Detail
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400"></div>
                    <div className="text-sm text-gray-500 mb-1">Total Score</div>
                    <div className="text-5xl font-black" style={{ color: colors.berry }}>{selectedMetric.checkin_score}</div>
                    <div className="text-sm font-bold text-gray-400 mt-2">{selectedMetric.checkin_type}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-500">{selectedMetric.body_score}</div>
                      <div className="text-xs text-gray-500">Body</div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <div className="text-xl font-bold text-emerald-500">{selectedMetric.mind_score}</div>
                      <div className="text-xs text-gray-500">Mind</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-xl font-bold text-orange-500">{selectedMetric.passion_score}</div>
                      <div className="text-xs text-gray-500">Passion</div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-bold text-xs text-gray-400 mb-2">ADVICE</p>
                    <p className="text-sm leading-relaxed">{selectedMetric.ai_feedback}</p>
                  </div>
                </div>
              ) : (
                // Legacy
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="block text-xs text-gray-500">心拍数</span>
                      <span className="text-xl font-bold">{selectedMetric.heart_rate} bpm</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="block text-xs text-gray-500">自律神経バランス</span>
                      <span className="text-sm font-bold">{getBalanceLabel(selectedMetric.autonomic_balance)}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="block text-xs text-gray-500">AIアドバイス</span>
                    <p className="text-sm mt-1">{selectedMetric.ai_feedback}</p>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-400 text-right">
                ID: {selectedMetric.line_user_id}<br />
                Time: {new Date(selectedMetric.created_at).toLocaleString()}
              </div>
              <button
                onClick={() => setSelectedMetric(null)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AISettingsEditor = () => {
    const [aiSettings, setAiSettings] = useState<{
      gemini: { has_key: boolean; is_active: boolean; masked_key: string };
      openai: { has_key: boolean; is_active: boolean; masked_key: string };
    }>({
      gemini: { has_key: false, is_active: false, masked_key: '' },
      openai: { has_key: false, is_active: false, masked_key: '' }
    });
    const [editForm, setEditForm] = useState<{
      gemini: { api_key: string; is_active: boolean };
      openai: { api_key: string; is_active: boolean };
    }>({
      gemini: { api_key: '', is_active: false },
      openai: { api_key: '', is_active: false }
    });
    const [editMode, setEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [testingProvider, setTestingProvider] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-ai-settings`;
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    useEffect(() => {
      loadAISettings();
    }, []);

    const loadAISettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'get' })
        });

        const result = await response.json();
        if (result.success) {
          setAiSettings(result.settings);
          setEditForm({
            gemini: { api_key: '', is_active: result.settings.gemini.is_active },
            openai: { api_key: '', is_active: result.settings.openai.is_active }
          });
        }
      } catch (error) {
        console.error('Error loading AI settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const saveSettings = async () => {
      setIsSaving(true);
      setSaveMessage('');

      try {
        const providers = ['gemini', 'openai'] as const;

        for (const provider of providers) {
          const form = editForm[provider];
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              action: 'save',
              provider,
              api_key: form.api_key || undefined,
              is_active: form.is_active
            })
          });

          const result = await response.json();
          if (!result.success) throw new Error(result.error);
        }

        setSaveMessage('AI設定を保存しました');
        setEditMode(false);
        await loadAISettings();
      } catch (error) {
        console.error('Error saving AI settings:', error);
        setSaveMessage('保存中にエラーが発生しました');
      } finally {
        setIsSaving(false);
      }
    };

    const testConnection = async (provider: 'gemini' | 'openai') => {
      setTestingProvider(provider);
      setTestResult(null);

      try {
        const form = editForm[provider];
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            action: 'test',
            provider,
            api_key: form.api_key || undefined
          })
        });

        const result = await response.json();
        setTestResult({ provider, success: result.success, message: result.message });
      } catch (error) {
        setTestResult({ provider, success: false, message: '接続テストに失敗しました' });
      } finally {
        setTestingProvider(null);
      }
    };

    if (isLoading) {
      return (
        <div className="glass-card p-8 rounded-2xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.berry }}></div>
        </div>
      );
    }

    return (
      <div className="glass-card p-8 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-xl" style={{ color: colors.deepBrown }}>
            AI接続設定
          </h3>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 text-white"
              style={{ background: `linear-gradient(135deg, ${colors.sky}, ${colors.sage})` }}
            >
              編集
            </button>
          )}
        </div>

        <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200">
          <p className="text-sm" style={{ color: colors.deepBrown }}>
            APIキーはサーバー側で安全に管理されます。フロントエンドには送信されません。
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
          <p className="text-sm" style={{ color: colors.deepBrown }}>
            AIプロバイダーのAPIキーを設定すると、脳タイプ診断の質問を自動生成できます。
            Gemini APIは無料枠があります。
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
          <h4 className="text-sm font-bold mb-3" style={{ color: colors.deepBrown }}>APIキー取得リンク</h4>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-white hover:bg-blue-50 transition-all border border-blue-300 text-blue-700"
            >
              <Cpu size={14} />
              Gemini API Key
            </a>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-white hover:bg-green-50 transition-all border border-green-300 text-green-700"
            >
              <Cpu size={14} />
              OpenAI API Key
            </a>
          </div>
        </div>

        {!editMode ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${aiSettings.gemini.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="font-bold text-sm" style={{ color: colors.deepBrown }}>Gemini</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: colors.deepBrown }}>
                    {aiSettings.gemini.has_key ? aiSettings.gemini.masked_key : '未設定'}
                  </span>
                  <button
                    onClick={() => testConnection('gemini')}
                    disabled={testingProvider === 'gemini' || !aiSettings.gemini.has_key}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 transition-all"
                  >
                    {testingProvider === 'gemini' ? 'テスト中...' : '接続テスト'}
                  </button>
                </div>
              </div>
              {testResult?.provider === 'gemini' && (
                <div className={`p-2 rounded-lg text-xs ${testResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {testResult.message}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-white/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${aiSettings.openai.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="font-bold text-sm" style={{ color: colors.deepBrown }}>OpenAI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: colors.deepBrown }}>
                    {aiSettings.openai.has_key ? aiSettings.openai.masked_key : '未設定'}
                  </span>
                  <button
                    onClick={() => testConnection('openai')}
                    disabled={testingProvider === 'openai' || !aiSettings.openai.has_key}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition-all"
                  >
                    {testingProvider === 'openai' ? 'テスト中...' : '接続テスト'}
                  </button>
                </div>
              </div>
              {testResult?.provider === 'openai' && (
                <div className={`p-2 rounded-lg text-xs ${testResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {testResult.message}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm" style={{ color: colors.deepBrown }}>Gemini</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.gemini.is_active}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      gemini: { ...prev.gemini, is_active: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-xs" style={{ color: colors.deepBrown }}>有効</span>
                </label>
              </div>
              <div className="text-xs opacity-60 mb-1" style={{ color: colors.deepBrown }}>
                現在: {aiSettings.gemini.has_key ? aiSettings.gemini.masked_key : '未設定'}
              </div>
              <input
                type="password"
                value={editForm.gemini.api_key}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  gemini: { ...prev.gemini, api_key: e.target.value }
                }))}
                className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none font-mono"
                placeholder="新しいAPIキーを入力（変更する場合のみ）"
                style={{ color: colors.deepBrown }}
              />
            </div>

            <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm" style={{ color: colors.deepBrown }}>OpenAI</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.openai.is_active}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      openai: { ...prev.openai, is_active: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-xs" style={{ color: colors.deepBrown }}>有効</span>
                </label>
              </div>
              <div className="text-xs opacity-60 mb-1" style={{ color: colors.deepBrown }}>
                現在: {aiSettings.openai.has_key ? aiSettings.openai.masked_key : '未設定'}
              </div>
              <input
                type="password"
                value={editForm.openai.api_key}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  openai: { ...prev.openai, api_key: e.target.value }
                }))}
                className="w-full p-3 rounded-xl border-2 border-white/50 text-sm outline-none font-mono"
                placeholder="新しいAPIキーを入力（変更する場合のみ）"
                style={{ color: colors.deepBrown }}
              />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 text-white"
                style={{ background: `linear-gradient(135deg, ${colors.sky}, ${colors.sage})` }}
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  loadAISettings();
                }}
                className="px-6 py-3 rounded-xl text-sm font-medium bg-gray-200 hover:bg-gray-300 transition-all"
                style={{ color: colors.deepBrown }}
              >
                キャンセル
              </button>
              {saveMessage && (
                <span className={`text-sm ${saveMessage.includes('エラー') ? 'text-red-600' : 'text-green-600'}`}>
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const LineSettingsEditor = () => {
    const [editMode, setEditMode] = useState(false);
    const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/line-webhook`;
    const [formData, setFormData] = useState({
      channel_access_token: lineSettings?.channel_access_token || '',
      channel_secret: lineSettings?.channel_secret || '',
      liff_url: lineSettings?.liff_url || '',
      admin_password: lineSettings?.admin_password || '',
      bot_basic_id: lineSettings?.bot_basic_id || ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [copiedWebhook, setCopiedWebhook] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    useEffect(() => {
      if (lineSettings) {
        setFormData({
          channel_access_token: lineSettings.channel_access_token,
          channel_secret: lineSettings.channel_secret,
          liff_url: lineSettings.liff_url,
          admin_password: lineSettings.admin_password,
          bot_basic_id: lineSettings.bot_basic_id || ''
        });
        const completed: number[] = [];
        if (lineSettings.channel_secret) completed.push(1);
        if (lineSettings.channel_access_token) completed.push(2);
        if (lineSettings.liff_url) completed.push(3);
        setCompletedSteps(completed);
      }
    }, [lineSettings]);

    const saveSettings = async () => {
      setIsSaving(true);
      setSaveMessage('');

      try {
        const success = await updateLineSettings(formData);
        if (success) {
          setSaveMessage('LINE設定を保存しました');
          setEditMode(false);
          await reloadLineSettings();
        } else {
          setSaveMessage('保存に失敗しました');
        }
      } catch {
        setSaveMessage('保存中にエラーが発生しました');
      } finally {
        setIsSaving(false);
      }
    };

    const copyWebhookUrl = () => {
      navigator.clipboard.writeText(webhookUrl);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    };

    const Tooltip = ({ id, children }: { id: string; children: React.ReactNode }) => (
      <div className="relative inline-block">
        <button
          type="button"
          onMouseEnter={() => setActiveTooltip(id)}
          onMouseLeave={() => setActiveTooltip(null)}
          onClick={() => setActiveTooltip(activeTooltip === id ? null : id)}
          className="ml-1.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        {activeTooltip === id && (
          <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl">
            {children}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-800" />
          </div>
        )}
      </div>
    );

    const StepIndicator = ({ step, title, completed }: { step: number; title: string; completed: boolean }) => (
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${completed
          ? 'bg-green-500 text-white'
          : 'bg-gray-200 text-gray-600'
          }`}>
          {completed ? <Check className="w-5 h-5" /> : step}
        </div>
        <span className="font-bold text-sm" style={{ color: colors.deepBrown }}>{title}</span>
        {completed && <span className="text-xs text-green-600 font-medium">完了</span>}
      </div>
    );

    const settingsGuide = {
      channel_secret: {
        label: 'チャンネルシークレット',
        hint: 'LINE Developers > チャンネル基本設定 > チャネルシークレット',
        tooltip: 'LINE Developersコンソールでプロバイダー > チャンネルを選択し、「チャネル基本設定」タブ内の「チャネルシークレット」をコピーしてください。'
      },
      channel_access_token: {
        label: 'チャンネルアクセストークン',
        hint: 'LINE Developers > Messaging API設定 > チャネルアクセストークン（長期）',
        tooltip: 'LINE Developersコンソールで「Messaging API設定」タブを開き、「チャネルアクセストークン（長期）」の「発行」ボタンをクリックして取得してください。'
      },
      liff_url: {
        label: 'LIFF URL',
        hint: 'LINE Developers > LIFF > エンドポイントURL',
        tooltip: 'LINE Developersコンソールの「LIFF」タブでLIFFアプリを作成し、生成された「LIFF URL」をコピーしてください。'
      },
      admin_password: {
        label: '管理者パスワード',
        hint: 'LINEで管理者モードに入るためのパスワード',
        tooltip: 'LINEトークでこのパスワードを送信すると、管理者モードに切り替わります。統計情報の確認や一斉送信などが可能になります。'
      },
      bot_basic_id: {
        label: 'LINE Bot Basic ID',
        hint: 'LINE公式アカウントの@から始まるID（例: @123abcde）',
        tooltip: 'LINE公式アカウントマネージャーのチャット機能を使うために必要です。LINE Developersコンソール > Messaging API設定 > 「LINE公式アカウントのBasic ID」で確認できます。'
      }
    };

    return (
      <div className="glass-card p-8 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-xl" style={{ color: colors.deepBrown }}>
              LINE連携設定
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              LINE Messaging APIとの連携に必要な設定です
            </p>
          </div>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 text-white"
              style={{ background: `linear-gradient(135deg, ${colors.sky}, ${colors.sage})` }}
            >
              編集
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <ExternalLink className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-amber-800">
              <a
                href="https://developers.line.biz/console/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline hover:no-underline"
              >
                LINE Developersコンソール
              </a>
              で設定値を取得してください
            </p>
          </div>
        </div>

        {!editMode ? (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-blue-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">!</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: colors.deepBrown }}>
                    Step 0: Webhook URLの設定
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    以下のURLをLINE Developersの「Messaging API設定」タブにある「Webhook URL」欄に貼り付けてください。<br />
                    その後、「検証」ボタンで接続を確認し、「Webhookの利用」をONにしてください。
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 rounded-lg bg-white text-xs font-mono overflow-x-auto border border-blue-200" style={{ color: colors.deepBrown }}>
                  {webhookUrl}
                </code>
                <button
                  onClick={copyWebhookUrl}
                  className={`px-4 py-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${copiedWebhook
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                  {copiedWebhook ? (
                    <>
                      <Check className="w-4 h-4" />
                      コピー済
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      コピー
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <StepIndicator step={1} title="チャンネルシークレットの設定" completed={completedSteps.includes(1)} />
              <div className="ml-11 p-4 rounded-xl bg-white/50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium" style={{ color: colors.deepBrown }}>
                        {settingsGuide.channel_secret.label}
                      </span>
                      <Tooltip id="channel_secret">
                        {settingsGuide.channel_secret.tooltip}
                      </Tooltip>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{settingsGuide.channel_secret.hint}</p>
                  </div>
                  <span className="font-mono text-sm" style={{ color: colors.deepBrown }}>
                    {lineSettings?.channel_secret ? '****' + lineSettings.channel_secret.slice(-6) : <span className="text-red-500">未設定</span>}
                  </span>
                </div>
              </div>

              <StepIndicator step={2} title="アクセストークンの設定" completed={completedSteps.includes(2)} />
              <div className="ml-11 p-4 rounded-xl bg-white/50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium" style={{ color: colors.deepBrown }}>
                        {settingsGuide.channel_access_token.label}
                      </span>
                      <Tooltip id="channel_access_token">
                        {settingsGuide.channel_access_token.tooltip}
                      </Tooltip>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{settingsGuide.channel_access_token.hint}</p>
                  </div>
                  <span className="font-mono text-sm" style={{ color: colors.deepBrown }}>
                    {lineSettings?.channel_access_token ? '****' + lineSettings.channel_access_token.slice(-12) : <span className="text-red-500">未設定</span>}
                  </span>
                </div>
              </div>

              <StepIndicator step={3} title="LIFF URLの設定" completed={completedSteps.includes(3)} />
              <div className="ml-11 p-4 rounded-xl bg-white/50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium" style={{ color: colors.deepBrown }}>
                        {settingsGuide.liff_url.label}
                      </span>
                      <Tooltip id="liff_url">
                        {settingsGuide.liff_url.tooltip}
                      </Tooltip>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{settingsGuide.liff_url.hint}</p>
                  </div>
                  <span className="font-mono text-sm" style={{ color: colors.deepBrown }}>
                    {lineSettings?.liff_url || <span className="text-red-500">未設定</span>}
                  </span>
                </div>
              </div>

              <div className="ml-11 p-4 rounded-xl bg-white/50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium" style={{ color: colors.deepBrown }}>
                        {settingsGuide.admin_password.label}
                      </span>
                      <Tooltip id="admin_password">
                        {settingsGuide.admin_password.tooltip}
                      </Tooltip>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{settingsGuide.admin_password.hint}</p>
                  </div>
                  <span className="font-mono text-sm" style={{ color: colors.deepBrown }}>
                    {lineSettings?.admin_password ? '********' : <span className="text-red-500">未設定</span>}
                  </span>
                </div>
              </div>

              <div className="ml-11 p-4 rounded-xl bg-white/50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium" style={{ color: colors.deepBrown }}>
                        {settingsGuide.bot_basic_id.label}
                      </span>
                      <Tooltip id="bot_basic_id">
                        {settingsGuide.bot_basic_id.tooltip}
                      </Tooltip>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{settingsGuide.bot_basic_id.hint}</p>
                  </div>
                  <span className="font-mono text-sm" style={{ color: colors.deepBrown }}>
                    {lineSettings?.bot_basic_id || <span className="text-gray-400">未設定（任意）</span>}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: colors.deepBrown }}>
                <ExternalLink className="w-4 h-4 text-green-600" />
                クイックリンク
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href="https://developers.line.biz/console/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-white hover:bg-green-50 transition-all border border-green-300 text-green-700"
                >
                  コンソール
                </a>
                <a
                  href="https://developers.line.biz/console/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-white hover:bg-green-50 transition-all border border-green-300 text-green-700"
                >
                  Messaging API
                </a>
                <a
                  href="https://manager.line.biz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-white hover:bg-green-50 transition-all border border-green-300 text-green-700"
                >
                  公式アカウント
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center">
                <label className="text-sm font-bold" style={{ color: colors.deepBrown }}>
                  {settingsGuide.channel_secret.label}
                </label>
                <Tooltip id="edit_channel_secret">
                  {settingsGuide.channel_secret.tooltip}
                </Tooltip>
              </div>
              <input
                type="password"
                value={formData.channel_secret}
                onChange={(e) => setFormData({ ...formData, channel_secret: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 text-sm outline-none font-mono transition-colors"
                placeholder="チャンネルシークレットを入力"
                style={{ color: colors.deepBrown }}
              />
              <p className="text-xs text-gray-500">{settingsGuide.channel_secret.hint}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <label className="text-sm font-bold" style={{ color: colors.deepBrown }}>
                  {settingsGuide.channel_access_token.label}
                </label>
                <Tooltip id="edit_channel_access_token">
                  {settingsGuide.channel_access_token.tooltip}
                </Tooltip>
              </div>
              <input
                type="password"
                value={formData.channel_access_token}
                onChange={(e) => setFormData({ ...formData, channel_access_token: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 text-sm outline-none font-mono transition-colors"
                placeholder="アクセストークンを入力"
                style={{ color: colors.deepBrown }}
              />
              <p className="text-xs text-gray-500">{settingsGuide.channel_access_token.hint}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <label className="text-sm font-bold" style={{ color: colors.deepBrown }}>
                  {settingsGuide.liff_url.label}
                </label>
                <Tooltip id="edit_liff_url">
                  {settingsGuide.liff_url.tooltip}
                </Tooltip>
              </div>
              <input
                type="url"
                value={formData.liff_url}
                onChange={(e) => setFormData({ ...formData, liff_url: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 text-sm outline-none transition-colors"
                placeholder="https://liff.line.me/..."
                style={{ color: colors.deepBrown }}
              />
              <p className="text-xs text-gray-500">{settingsGuide.liff_url.hint}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <label className="text-sm font-bold" style={{ color: colors.deepBrown }}>
                  {settingsGuide.admin_password.label}
                </label>
                <Tooltip id="edit_admin_password">
                  {settingsGuide.admin_password.tooltip}
                </Tooltip>
              </div>
              <input
                type="text"
                value={formData.admin_password}
                onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 text-sm outline-none transition-colors"
                placeholder="管理者パスワードを入力"
                style={{ color: colors.deepBrown }}
              />
              <p className="text-xs text-gray-500">{settingsGuide.admin_password.hint}</p>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label className="text-sm font-bold" style={{ color: colors.deepBrown }}>
                  {settingsGuide.bot_basic_id.label}
                </label>
                <Tooltip id="edit_bot_basic_id">
                  {settingsGuide.bot_basic_id.tooltip}
                </Tooltip>
              </div>
              <input
                type="text"
                value={formData.bot_basic_id}
                onChange={(e) => setFormData({ ...formData, bot_basic_id: e.target.value })}
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 text-sm outline-none transition-colors"
                placeholder="@123abcde"
                style={{ color: colors.deepBrown }}
              />
              <p className="text-xs text-gray-500">{settingsGuide.bot_basic_id.hint}</p>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 text-white flex items-center gap-2"
                style={{ background: `linear-gradient(135deg, ${colors.sky}, ${colors.sage})` }}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    保存
                  </>
                )}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-6 py-3 rounded-xl text-sm font-medium bg-gray-200 hover:bg-gray-300 transition-all"
                style={{ color: colors.deepBrown }}
              >
                キャンセル
              </button>
              {saveMessage && (
                <span className={`text-sm font-medium ${saveMessage.includes('エラー') || saveMessage.includes('失敗') ? 'text-red-600' : 'text-green-600'}`}>
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const LineTemplatesEditor = () => {
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const startEditing = (template: { template_key: string; message_content: string }) => {
      setEditingKey(template.template_key);
      setEditContent(template.message_content);
      setSaveMessage('');
    };

    const saveTemplate = async () => {
      if (!editingKey) return;

      setIsSaving(true);
      setSaveMessage('');

      try {
        const success = await updateLineTemplate(editingKey, editContent);
        if (success) {
          setSaveMessage('テンプレートを保存しました');
          setTimeout(() => {
            setEditingKey(null);
            setSaveMessage('');
          }, 1000);
        } else {
          setSaveMessage('保存に失敗しました');
        }
      } catch {
        setSaveMessage('保存中にエラーが発生しました');
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="glass-card p-8 rounded-2xl space-y-6">
        <h3 className="font-serif font-bold text-xl" style={{ color: colors.deepBrown }}>
          LINEメッセージテンプレート
        </h3>

        <div className="p-4 rounded-xl bg-white/30 space-y-2">
          <h4 className="text-sm font-bold" style={{ color: colors.deepBrown }}>使用可能な変数:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <code className="bg-white/50 px-2 py-0.5 rounded font-mono font-bold">{'{{app_title}}'}</code>
              <span className="ml-2 opacity-70" style={{ color: colors.deepBrown }}>アプリタイトル</span>
            </div>
            <div>
              <code className="bg-white/50 px-2 py-0.5 rounded font-mono font-bold">{'{{day}}'}</code>
              <span className="ml-2 opacity-70" style={{ color: colors.deepBrown }}>日数（1, 2, 3...）</span>
            </div>
            <div>
              <code className="bg-white/50 px-2 py-0.5 rounded font-mono font-bold">{'{{title}}'}</code>
              <span className="ml-2 opacity-70" style={{ color: colors.deepBrown }}>Dayタイトル</span>
            </div>
            <div>
              <code className="bg-white/50 px-2 py-0.5 rounded font-mono font-bold">{'{{email}}'}</code>
              <span className="ml-2 opacity-70" style={{ color: colors.deepBrown }}>ユーザーメール</span>
            </div>
            <div>
              <code className="bg-white/50 px-2 py-0.5 rounded font-mono font-bold">{'{{liff_url}}'}</code>
              <span className="ml-2 opacity-70" style={{ color: colors.deepBrown }}>LIFF URL</span>
            </div>
            <div>
              <code className="bg-white/50 px-2 py-0.5 rounded font-mono font-bold">{'{{reward_type}}'}</code>
              <span className="ml-2 opacity-70" style={{ color: colors.deepBrown }}>報酬タイプ</span>
            </div>
            <div>
              <code className="bg-white/50 px-2 py-0.5 rounded font-mono font-bold">{'{{reward_title}}'}</code>
              <span className="ml-2 opacity-70" style={{ color: colors.deepBrown }}>報酬タイトル</span>
            </div>
            <div>
              <code className="bg-white/50 px-2 py-0.5 rounded font-mono font-bold">{'{{reward_message}}'}</code>
              <span className="ml-2 opacity-70" style={{ color: colors.deepBrown }}>報酬メッセージ</span>
            </div>
            <div>
              <code className="bg-white/50 px-2 py-0.5 rounded font-mono font-bold">{'{{reward_url}}'}</code>
              <span className="ml-2 opacity-70" style={{ color: colors.deepBrown }}>報酬URL</span>
            </div>
          </div>
        </div>

        {!editingKey ? (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-left opacity-60 border-b border-white/30" style={{ color: colors.deepBrown }}>
                <th className="pb-3 w-48">テンプレート名</th>
                <th className="pb-3">内容プレビュー</th>
                <th className="pb-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {lineTemplates.map(template => (
                <tr key={template.template_key} className="border-b border-white/20">
                  <td className="py-3 font-medium" style={{ color: colors.deepBrown }}>
                    {template.template_name}
                  </td>
                  <td className="py-3 text-sm opacity-70 truncate max-w-md" style={{ color: colors.deepBrown }}>
                    {template.message_content.slice(0, 80)}...
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => startEditing(template)}
                      className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all hover:scale-105 text-white"
                      style={{ background: `linear-gradient(135deg, ${colors.rose}, ${colors.sakura})` }}
                    >
                      編集
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg" style={{ color: colors.deepBrown }}>
                {lineTemplates.find(t => t.template_key === editingKey)?.template_name}
              </h4>
            </div>

            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-white/50 text-sm outline-none resize-none font-mono"
              rows={12}
              style={{ color: colors.deepBrown }}
            />

            <div className="flex items-center gap-4">
              <button
                onClick={saveTemplate}
                disabled={isSaving}
                className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 text-white"
                style={{ background: `linear-gradient(135deg, ${colors.rose}, ${colors.sakura})` }}
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => setEditingKey(null)}
                className="px-6 py-3 rounded-xl text-sm font-medium bg-gray-200 hover:bg-gray-300 transition-all"
                style={{ color: colors.deepBrown }}
              >
                キャンセル
              </button>
              {saveMessage && (
                <span className={`text-sm ${saveMessage.includes('エラー') || saveMessage.includes('失敗') ? 'text-red-600' : 'text-green-600'}`}>
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const formatDeadline = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Shared Data Calculation (Moved from HomeView)
  const activeDaysArray = siteSettings?.active_days || [1, 2, 3];
  const dayData = activeDaysArray.map(day => {
    const setting = daySettings[day];
    const archiveUrls = [story?.day1_archive_url, story?.day2_archive_url, story?.day3_archive_url];
    const archiveDeadlines = [siteSettings?.day1_archive_deadline, siteSettings?.day2_archive_deadline, siteSettings?.day3_archive_deadline];
    const assignmentDeadlines = [siteSettings?.day1_assignment_deadline, siteSettings?.day2_assignment_deadline, siteSettings?.day3_assignment_deadline];
    const completedFields = [story?.day1_field1, story?.day2_field1, story?.day3_field1];

    return {
      day,
      title: setting?.title || `Day ${day}`,
      subtitle: setting?.subtitle || `Chapter ${day}`,
      date: setting?.date || '',
      completed: !!completedFields[day - 1],
      hasReward: !!dayRewards[day],
      archiveUrl: archiveUrls[day - 1],
      archiveDeadline: archiveDeadlines[day - 1],
      assignmentDeadline: assignmentDeadlines[day - 1]
    };
  });



  const DayListComponent = () => (
    <div className="space-y-4 px-4 pb-8">
      {dayData.map(({ day, title, subtitle, date, completed, hasReward, archiveUrl, archiveDeadline, assignmentDeadline }) => {
        let isUnlocked = unlockedDays.includes(day);

        // Refined Onboarding: Sequential Unlock Logic (Passenger Phase)
        if (!story.user_phase || story.user_phase === 'passenger') {
          const hasDiagnosis = !!story.brain_type;
          const hasDay1 = !!story.day1_field1;

          if (day === 1) isUnlocked = hasDiagnosis;
          if (day === 2) isUnlocked = hasDay1;
          // Day 3+ remains locked until Commander phase
          if (day >= 3) isUnlocked = false;
        }

        const isArchiveAvailable = archiveUrl && archiveDeadline && new Date(archiveDeadline) > new Date();
        const showReward = completed && hasReward;
        const showActions = showReward || isArchiveAvailable;
        const rewardViewed = day === 1 ? story.day1_reward_viewed : day === 2 ? story.day2_reward_viewed : story.day3_reward_viewed;

        return (
          <div key={day} className="relative">
            <div
              className={`group relative overflow-hidden rounded-[2rem] transition-all duration-500 glass-card w-full
              ${isUnlocked ? 'shadow-xl shadow-pink-100' : 'opacity-50 grayscale'}
            `}
            >
              <button
                onClick={() => isUnlocked && setView(`day${day}`)}
                disabled={!isUnlocked}
                className={`w-full p-6 text-left transition-all duration-300
                ${isUnlocked && !showActions ? 'hover:scale-[1.02] active:scale-95' : ''}
                ${!isUnlocked ? 'cursor-not-allowed' : ''}
              `}
              >
                {isUnlocked && (
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={48} style={{ color: colors.primaryDeep }} />
                  </div>
                )}

                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 relative shadow-inner
                  ${isUnlocked ? 'bg-white' : 'bg-gray-100'}`}
                  >
                    {/* Progress Line Connector (Visual only) */}
                    {day < 3 && (
                      <div className="absolute -bottom-8 left-1/2 w-0.5 h-6 bg-gray-200 -translate-x-1/2 z-0 opacity-50" />
                    )}

                    {isUnlocked ? (
                      completed ? (
                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white shadow-md">
                          <CheckCircle2 size={24} />
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-white border-2 border-pink-100 flex items-center justify-center relative overflow-hidden">
                          <span className="font-serif font-bold text-2xl text-pink-400">{day}</span>
                          {/* Decorative Sparkle */}
                          <Sparkles size={12} className="absolute top-2 right-2 text-yellow-400 opacity-50" />
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-gray-100 flex items-center justify-center">
                        <Lock className="text-gray-300" size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: colors.primaryDeep }}>{subtitle}</span>
                      {completed && <span className="text-[10px] text-white px-2 py-0.5 rounded-full" style={{ background: colors.primaryDeep }}>提出済み</span>}
                      {!completed && assignmentDeadline && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: colors.sakura, color: colors.berry }}>
                          提出期限: {formatDeadline(assignmentDeadline)}まで
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-lg mb-1" style={{ color: colors.deepBrown }}>
                      Day {day} {title}
                    </h3>
                    <p className="text-xs opacity-60" style={{ color: colors.deepBrown }}>
                      {date}
                    </p>
                  </div>
                  {isUnlocked && !completed && <ArrowRight size={20} className="animate-pulse" style={{ color: colors.primaryDeep }} />}
                </div>
              </button>

              {showActions && (
                <div className="px-6 pb-5 pt-2 space-y-3">
                  <div className="flex gap-3">
                    {showReward && dayRewards[day] ? (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const reward = dayRewards[day];
                          const url = reward.reward_url || reward.image_url;
                          if (url) {
                            setActiveVideoUrl(url); // Open in Modal
                            if (!rewardViewed) {
                              const rewardViewedField = `day${day}_reward_viewed` as keyof typeof story;
                              await updateStory({ [rewardViewedField]: true } as any);
                            }
                          }
                        }}
                        className="relative flex-1 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                        style={{
                          background: `linear-gradient(135deg, ${colors.gold}, #FFD700)`,
                          color: 'white'
                        }}
                      >
                        <Gift size={18} className="fill-current" />
                        <span>プレゼント</span>
                        {!rewardViewed && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                            NEW
                          </span>
                        )}
                      </button>
                    ) : isArchiveAvailable ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveVideoUrl(archiveUrl); // Open in Modal
                        }}
                        className="flex-1 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                        style={{
                          background: `linear-gradient(135deg, ${colors.rose}, ${colors.primaryDeep})`,
                          color: 'white'
                        }}
                      >
                        <Play size={18} />
                        <span>アーカイブ視聴</span>
                      </button>
                    ) : null}
                  </div>
                  {isArchiveAvailable && archiveDeadline && (
                    <p className="text-[10px] text-center opacity-70" style={{ color: colors.deepBrown }}>
                      視聴期限: {formatDeadline(archiveDeadline)}まで
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const ArchivesView = () => (
    <div className="page-turn-in space-y-8 relative z-10 pb-10">
      <div className="text-center pt-8 pb-4">
        <h2 className="text-2xl font-serif font-bold text-gray-800">Archives</h2>
        <p className="text-xs text-gray-500">過去の課題とコンテンツ</p>
      </div>
      <DayListComponent />
      <div className="text-center pb-8">
        <button
          onClick={() => setView('home')}
          className="px-8 py-3 rounded-full font-bold shadow-lg bg-white text-gray-600 hover:text-gray-900 border border-gray-100"
        >
          ダッシュボードに戻る
        </button>
      </div>
    </div>
  );

  const HomeView = () => {
    // 2. Commander Logic (Phase 2)
    if (story && story.user_phase === 'commander') {
      return (
        <CommanderDashboard
          story={story}
          siteSettings={siteSettings}
          onUpdate={updateStory}
          onViewRewards={() => setView('rewards')}
          onViewArchives={() => setView('archives')}
          onStartCheckin={() => setShowHRVMeasurement(true)}
          onViewBoardingPass={() => setShowBoardingPass(true)}
          onRefresh={reloadStoryData}
          onViewSettings={() => setView('admin')}
          onViewGakka={() => setView('gakka')}
          onLogout={logout}
        />
      );
    }


    return (
      <div className="pb-24 relative min-h-screen">


        {(!story.user_phase || story.user_phase === 'passenger') && (
          <div className="mb-0">
            <PassengerDashboard
              story={story}
              daySettings={daySettings}
              siteSettings={siteSettings}
              onUpdate={updateStory}
              onStartDiagnosis={() => setShowDiagnosis(true)}
              onStartTask={(day) => setView(`day${day}` as any)}
              onViewSettings={isAdmin ? () => setView('admin') : undefined}
              onViewBoardingPass={() => setShowBoardingPass(true)}
              onLogout={logout}
              displayName={userData?.display_name}
              onPromotion={async () => {
                await updateStory({ user_phase: 'commander' });
                if (!unlockedDays.includes(1)) {
                  await updateStory({ unlocked_days: [1], is_locked: false });
                }
                // Show Gate Opening for 21-day program enrollment
                setShowGateOpening(true);
              }}
            />
          </div>
        )}

        {/* Show extended content only for Commander phase */}
        {story.user_phase === 'commander' && (
          <div className="page-turn-in space-y-8 relative z-10">
            <div className="grid grid-cols-1 gap-5">
              {/* Day List */}
              <DayListComponent />
            </div>

            <div className="relative">
              <div className="glass-card p-6 rounded-[2.5rem] shadow-xl">
                <div className="text-center mb-5">
                  <span className="font-script text-xl block mb-1" style={{ color: colors.gold }}>Reward Collection</span>
                  <h3 className="font-serif font-bold text-lg" style={{ color: colors.berry }}>スタンプカード</h3>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-5">
                  {activeDaysArray.map((day) => {
                    const completed = day === 1 ? story.day1_field1 : day === 2 ? story.day2_field1 : story.day3_field1;
                    const isJustClaimed = newlyClaimedReward === day;
                    const rewardViewedFromDb = day === 1 ? story.day1_reward_viewed : day === 2 ? story.day2_reward_viewed : story.day3_reward_viewed;
                    const rewardViewed = rewardViewedFromDb || isJustClaimed;
                    const hasReward = !!dayRewards[day];
                    const canView = completed && hasReward;
                    const isNew = canView && !rewardViewed;

                    return (
                      <button
                        key={day}
                        onClick={async () => {
                          if (canView) {
                            const reward = dayRewards[day];
                            const url = reward.reward_url || reward.image_url;
                            if (url) {
                              setActiveVideoUrl(url); // Open in Modal
                              if (!rewardViewed) {
                                const rewardViewedField = `day${day}_reward_viewed` as keyof typeof story;
                                await updateStory({ [rewardViewedField]: true } as any);
                              }
                            }
                          }
                        }}
                        disabled={!canView}
                        className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300
                      ${canView ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default'}
                      ${isJustClaimed ? 'stamp-claimed' : ''}
                    `}
                        style={{
                          background: completed
                            ? `linear-gradient(135deg, ${colors.gold}, #FFD700)`
                            : '#E5E5E5'
                        }}
                      >
                        <Gift
                          size={24}
                          className={`${completed ? 'text-white fill-current' : 'text-gray-400'} ${isJustClaimed ? 'stamp-icon' : ''}`}
                        />
                        <span className={`text-[10px] font-bold ${completed ? 'text-white' : 'text-gray-400'}`}>
                          Day{day}
                        </span>
                        {rewardViewed && (
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${isJustClaimed ? 'stamp-check' : ''}`}
                            style={{ background: colors.primaryDeep }}>
                            <CheckCircle2 size={14} className="text-white" />
                          </div>
                        )}
                        {isNew && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                            NEW
                          </div>
                        )}
                        {isJustClaimed && (
                          <div className="absolute inset-0 rounded-2xl stamp-burst" />
                        )}
                      </button>
                    );
                  })}

                  {(() => {
                    const isPerfectJustClaimed = newlyClaimedReward === 'perfect';
                    const perfectViewed = story.is_gift_viewed || isPerfectJustClaimed;
                    const isPerfectNew = story.is_gift_sent && !perfectViewed;
                    return (
                      <button
                        onClick={() => story.is_gift_sent && setView('gift')}
                        disabled={!story.is_gift_sent}
                        className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300
                      ${story.is_gift_sent ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default'}
                      ${isPerfectJustClaimed ? 'stamp-claimed' : ''}
                    `}
                        style={{
                          background: story.is_gift_sent
                            ? `linear-gradient(135deg, ${colors.rose}, ${colors.berry})`
                            : '#E5E5E5'
                        }}
                      >
                        <Trophy
                          size={24}
                          className={`${story.is_gift_sent ? 'text-white' : 'text-gray-400'} ${isPerfectJustClaimed ? 'stamp-icon' : ''}`}
                        />
                        <span className={`text-[8px] font-bold leading-tight text-center ${story.is_gift_sent ? 'text-white' : 'text-gray-400'}`}>
                          Perfect
                        </span>
                        {isPerfectNew && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                            NEW
                          </div>
                        )}
                        {perfectViewed && (
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${isPerfectJustClaimed ? 'stamp-check' : ''}`}
                            style={{ background: colors.primaryDeep }}>
                            <CheckCircle2 size={14} className="text-white" />
                          </div>
                        )}
                        {isPerfectJustClaimed && (
                          <div className="absolute inset-0 rounded-2xl stamp-burst" />
                        )}
                      </button>
                    );
                  })()}
                </div>

                <div className="text-center">
                  <p className="text-[10px] opacity-60" style={{ color: colors.deepBrown }}>
                    課題を提出すると特典プレゼントがもらえます
                  </p>
                </div>
              </div>
            </div>

            {(!userData?.diagnosis_completed && !localBrainType) && (
              <div className="relative overflow-hidden rounded-[2rem] shadow-xl"
                style={{ background: `linear-gradient(135deg, ${colors.gold}15, ${colors.rose}15)` }}>
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <Compass size={128} style={{ color: colors.gold }} />
                </div>
                <div className="p-6 relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: `${colors.gold}30` }}>
                      <Compass size={18} style={{ color: colors.gold }} />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: colors.rose, color: 'white' }}>
                      初回限定
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: colors.deepBrown }}>
                    まずは脳タイプ診断から
                  </h3>
                  <p className="text-xs opacity-70 mb-4" style={{ color: colors.deepBrown }}>
                    あなたの脳タイプを診断し、最適なアドバイスをお届けします。約2分で完了します。
                  </p>
                  <button
                    onClick={() => setShowDiagnosis(true)}
                    className="w-full py-4 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                    style={{ background: `linear-gradient(to right, ${colors.gold}, ${colors.rose})` }}
                  >
                    <Compass size={20} />
                    脳タイプ診断を受ける
                  </button>
                </div>
              </div>
            )}

            {(story.brain_type || localBrainType) && (() => {
              const brainType = story.brain_type || localBrainType;
              const typeInfo: Record<string, { name: string; description: string; color: string; icon: string }> = {
                left_3d: {
                  name: 'シン（戦略家）',
                  description: '最短ルートを弾き出し、論理で戦略を練る参謀です',
                  color: '#3B82F6',
                  icon: 'strategy'
                },
                left_2d: {
                  name: 'マモル（守護者）',
                  description: 'リスクを管理し、安全と信念を守る保安官であり職人です',
                  color: '#10B981',
                  icon: 'precision'
                },
                right_3d: {
                  name: 'ソラ（冒険家）',
                  description: '未来を見るビジョナリー。常にワクワクを指し示します',
                  color: '#FBBF24',
                  icon: 'passion'
                },
                right_2d: {
                  name: 'ピク（癒やし手）',
                  description: '空気を読み、みんなとのつながりを大切にするムードメーカーです',
                  color: '#EC4899',
                  icon: 'harmony'
                }
              };
              const info = (brainType && typeInfo[brainType]) ? typeInfo[brainType] : null;
              if (!info) return null;

              return (
                <div className="relative overflow-hidden rounded-[2rem] shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${info.color}15, ${colors.cream})` }}>
                  <div className="absolute top-0 right-0 w-40 h-40 opacity-5">
                    <Compass size={160} style={{ color: info.color }} />
                  </div>
                  <div className="p-6 relative">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}90)` }}>
                        <Compass size={32} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold tracking-wider mb-1 opacity-60" style={{ color: colors.deepBrown }}>
                          あなたの脳タイプ
                        </p>
                        <h3 className="font-bold text-lg mb-2" style={{ color: colors.deepBrown }}>
                          {info.name}
                        </h3>
                        <p className="text-xs leading-relaxed opacity-70" style={{ color: colors.deepBrown }}>
                          {info.description}
                        </p>
                      </div>
                    </div>
                    {/* Only show re-diagnosis if brain type exists */}
                    {story.brain_type && (
                      <button
                        onClick={() => setShowDiagnosis(true)}
                        className="w-full py-3 rounded-xl font-medium text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                        style={{
                          background: `${info.color}10`,
                          color: info.color,
                          border: `1px solid ${info.color}30`
                        }}
                      >
                        <RefreshCw size={16} />
                        再診断する
                      </button>
                    )}
                    <p className="text-[10px] text-center opacity-50 mt-3" style={{ color: colors.deepBrown }}>
                      この脳タイプに合わせたアドバイスをお届けします
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* 指先チェックへのリンク */}
            <div className="relative overflow-hidden rounded-[2rem] shadow-xl glass-card">
              <div className="p-6 relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${colors.sage}, ${colors.cream})` }}>
                    <Activity size={18} className="text-white" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white"
                    style={{ background: colors.sage }}>
                    New Feature
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: colors.deepBrown }}>
                  ステート・チェックイン
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  今のあなたのステート（状態）をチェックし、最適な「未来設定」へのゲートを開きます。
                </p>
                <button
                  onClick={() => setShowHRVMeasurement(true)}
                  className="w-full py-4 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                  style={{ background: `linear-gradient(to right, ${colors.sage}, #8BA88B)` }}
                >
                  <Activity size={20} />
                  計測を開始する
                </button>
              </div>
            </div>

            <div className="px-2 pb-4">
              <div className="bg-white/40 p-6 rounded-[2.5rem] border border-white flex flex-col items-center gap-4 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: colors.sakura }}>
                  {siteSettings?.banner_image_url ? (
                    <img src={siteSettings.banner_image_url} alt="バナー画像" className="w-6 h-6 object-contain" />
                  ) : (
                    <Heart style={{ color: colors.rose }} size={24} />
                  )}
                </div>
                <p className="text-[11px] leading-relaxed opacity-70" style={{ color: colors.deepBrown }}>
                  {siteSettings?.banner_text || '個別セッションでは、この物語を一緒に読み解き、'}<br />
                  {siteSettings?.banner_subtext || 'あなたの魂を癒す「魔法のアファメーション」を贈ります。'}
                </p>
                {!story.is_gift_sent && (
                  <>
                    {(!story.is_gift_sent && siteSettings?.banner_link_url) ? (
                      <a
                        href={`${siteSettings.banner_link_url}${siteSettings.banner_link_url.includes('?') ? '&' : '?'}custom_id=${userData?.line_user_id || ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center py-4 rounded-full text-white font-bold text-sm shadow-xl hover:opacity-90 active:scale-95 transition-all"
                        style={{ background: `linear-gradient(to right, ${colors.rose}, ${colors.berry})` }}
                      >
                        {siteSettings?.banner_button_text || '物語の続きをセッションで描く'}
                      </a>
                    ) : (
                      <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="w-full py-4 rounded-full text-white font-bold text-sm shadow-xl hover:opacity-90 active:scale-95 transition-all"
                        style={{ background: `linear-gradient(to right, ${colors.rose}, ${colors.berry})` }}
                      >
                        {siteSettings?.banner_button_text || '物語の続きをセッションで描く'}
                      </button>
                    )}
                  </>
                )}

              </div>
            </div>

            {!story.is_gift_sent && story.progress === 100 && (
              <button
                onClick={() => updateStory({ is_gift_sent: true })}
                className="w-full py-6 rounded-full shadow-2xl flex items-center justify-center gap-3
                       font-bold text-white text-sm tracking-[0.2em] btn-bounce"
                style={{ background: `linear-gradient(135deg, ${colors.rose}, ${colors.gold})` }}>
                <Trophy size={20} />
                エピローグを開く
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const TaskView = ({
    day,
    title,
    subtitle,
    date,
    description,
    questions,
    bgGradient
  }: {
    day: number;
    title: string;
    subtitle: string;
    date: string;
    description: string;
    questions: {
      fieldName: string;
      label: string;
      placeholder: string;
      type?: 'textarea' | 'radio' | 'rating';
      options?: string[];
    }[];
    bgGradient: string;
  }) => {
    const initialFields: Record<string, string> = {};
    questions.forEach(q => {
      initialFields[q.fieldName] = (story[`day${day}_${q.fieldName}` as keyof typeof story] as string) || '';
    });

    const wasInitiallySubmittedRef = useRef(day === 1 ? !!story.day1_field1 : day === 2 ? !!story.day2_field1 : !!story.day3_field1);
    const wasInitiallySubmitted = wasInitiallySubmittedRef.current;

    const storyIdRef = useRef(story.id);
    const [fields, setFields] = useState(initialFields);
    const [email, setEmail] = useState(story.email || '');
    const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [aiMessage, setAiMessage] = useState('');
    const [showAiMessage, setShowAiMessage] = useState(false);
    const isSubmittingRef = useRef(false);
    const [isJustSubmitted, setIsJustSubmitted] = useState(false);
    const [showMission, setShowMission] = useState(false);
    const [missionSubmitted, setMissionSubmitted] = useState(false);

    useEffect(() => {
      if (story.id !== storyIdRef.current) {
        storyIdRef.current = story.id;
        setShowAiMessage(false);
        setAiMessage('');
        setSubmitSuccess(false);
        setIsJustSubmitted(false);
      }
    }, [story.id]);

    const handleFieldChange = (fieldName: string, value: string) => {
      setFields(prev => ({ ...prev, [fieldName]: value }));
    };

    const allFieldsFilled = questions.every(q => fields[q.fieldName]?.trim()) && email.trim();

    const onSubmit = async (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      if (isSubmittingRef.current || isTaskSubmitting || !allFieldsFilled) {
        console.log('Submit blocked:', { isSubmittingRef: isSubmittingRef.current, isTaskSubmitting, allFieldsFilled });
        return;
      }

      console.log('Starting submit...');
      isSubmittingRef.current = true;
      setIsTaskSubmitting(true);

      try {
        await handleTaskSubmit(day, fields, email);
        setSubmitSuccess(true);
        setIsJustSubmitted(true);

        // Fetch AI message
        try {
          const aiResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-response`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              day,
              fields,
              email
            })
          });

          if (aiResponse.ok) {
            const data = await aiResponse.json();
            setAiMessage(data.message);
            setTimeout(() => {
              setShowAiMessage(true);
            }, 800);
          } else {
            // If AI fails, still show the submission success state
            setTimeout(() => {
              setShowAiMessage(true);
              setAiMessage('あなたの想いを受け取りました。ありがとうございます。');
            }, 800);
          }
        } catch (aiError) {
          console.error('Error fetching AI message:', aiError);
          // If AI fails, still show the submission success state
          setTimeout(() => {
            setShowAiMessage(true);
            setAiMessage('あなたの想いを受け取りました。ありがとうございます。');
          }, 800);
        }
      } finally {
        setIsTaskSubmitting(false);
        isSubmittingRef.current = false;
      }
    };

    return (
      <div className="page-turn-in space-y-8 min-h-[600px] relative z-10 pb-10">
        <div className="fixed inset-0 -z-10" style={{ background: bgGradient }}>
          <div className="absolute inset-0 seigaiha opacity-30" />
        </div>

        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] opacity-50
                     hover:opacity-100 transition-all glass-card px-4 py-2 rounded-full">
          ← MAP
        </button>

        <div className="text-center space-y-4 px-4">
          <div className="inline-block p-4 rounded-full glass-card">
            <Flower size={28} style={{ color: colors.gold }} />
          </div>
          <span className="font-script text-3xl block" style={{ color: colors.gold }}>{subtitle}</span>
          <h2 className="text-3xl font-serif font-bold leading-tight" style={{ color: colors.berry }}>
            Day {day} {title}
          </h2>
          <p className="text-sm font-medium opacity-70" style={{ color: colors.deepBrown }}>
            {date}
          </p>
          <div className="h-0.5 w-20 mx-auto mizuhiki-line" />
          <p className="text-xs leading-relaxed opacity-70 max-w-md mx-auto italic px-6">
            {description}
          </p>
        </div>

        {story.submission_deadline && (
          <CountdownTimer
            deadline={story.submission_deadline}
            onExpire={async () => {
              if (!story.is_locked) {
                await supabase
                  .from('user_stories')
                  .update({ is_locked: true })
                  .eq('id', story.id);
                reloadStoryData();
              }
            }}
          />
        )}

        {daySettings[day]?.zoom_link && (
          <ZoomAccess
            day={day}
            zoomLink={daySettings[day].zoom_link}
            zoomPasscode={daySettings[day].zoom_passcode}
            meetingTime={daySettings[day].zoom_meeting_time}
            isUnlocked={unlockedDays.includes(day)}
            previousDayCompleted={day === 1 || (day === 2 && !!story.day1_field1) || (day === 3 && !!story.day2_field1)}
          />
        )}

        {/* Video Player with Mission Ignition - uses demo video if no URL set for Day 1 */}
        {(daySettings[day]?.youtube_url || day === 1) && (
          <div className="px-2 space-y-4">
            <YouTubePlayer
              videoUrl={daySettings[day]?.youtube_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
              brainType={userData?.brain_type || localBrainType}
              completionThreshold={0.9}
              onTimeThreshold={() => {
                if (!showMission && !missionSubmitted) {
                  setShowMission(true);
                }
              }}
              onWatchComplete={() => {
                console.log(`Day ${day} video 90% watched!`);
                // Also trigger mission if not already shown
                if (!showMission && !missionSubmitted) {
                  setShowMission(true);
                }
              }}
            />

            {/* Mission Ignition - appears after video threshold */}
            {day === 1 && showMission && (
              <MissionIgnition
                onSubmit={async (answer) => {
                  console.log('Mission answer submitted:', answer);
                  // Save to Supabase if needed
                  try {
                    await supabase.from('mission_responses').insert({
                      line_user_id: userData?.line_user_id || story.id,
                      day: 1,
                      mission_type: 'first_ignition',
                      response: answer,
                      created_at: new Date().toISOString()
                    });
                  } catch (e) {
                    console.log('Mission table may not exist, skipping save:', e);
                  }
                  setMissionSubmitted(true);
                }}
                audioUrl="https://example.com/night-flight-log-track2.mp3"
              />
            )}
          </div>
        )}

        {!isTaskSubmitting && !showAiMessage ? (
          <div className="space-y-8 pt-4 px-2">
            <div className="space-y-4">
              <label className="flex items-center gap-3 ml-6 text-xs font-bold opacity-80">
                <div className="w-8 h-8 rounded-full flex items-center justify-center glass-card">
                  <span style={{ color: colors.rose }}>📧</span>
                </div>
                メールアドレス（必須）
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => !(wasInitiallySubmitted || isJustSubmitted) && setEmail(e.target.value)}
                readOnly={wasInitiallySubmitted || isJustSubmitted}
                className={`w-full p-5 rounded-[2rem] border-2 border-white/50 focus:border-white
                           text-sm paper-texture shadow-[0_10px_40px_rgba(0,0,0,0.08)]
                           focus:shadow-[0_20px_60px_rgba(0,0,0,0.12)] outline-none transition-all
                           ${(wasInitiallySubmitted || isJustSubmitted) ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="your-email@example.com"
                style={{ color: colors.deepBrown }}
                required
              />
            </div>

            {questions.map((question, index) => (
              <div key={question.fieldName} className="space-y-4">
                <label className="flex items-center gap-3 ml-6 text-xs font-bold opacity-80">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center glass-card">
                    <span style={{ color: colors.rose }}>{index + 1}</span>
                  </div>
                  {question.label}
                </label>

                {(!question.type || question.type === 'textarea') && (
                  <textarea
                    value={fields[question.fieldName]}
                    onChange={(e) => !wasInitiallySubmitted && !isJustSubmitted && handleFieldChange(question.fieldName, e.target.value)}
                    readOnly={wasInitiallySubmitted || isJustSubmitted}
                    className={`w-full h-40 p-6 rounded-[2rem] border-2 border-white/50 focus:border-white
                               text-sm paper-texture shadow-[0_10px_40px_rgba(0,0,0,0.08)]
                               focus:shadow-[0_20px_60px_rgba(0,0,0,0.12)] outline-none transition-all
                               leading-relaxed resize-none ${(wasInitiallySubmitted || isJustSubmitted) ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder={question.placeholder}
                    style={{ color: colors.deepBrown }}
                  />
                )}

                {question.type === 'radio' && question.options && (
                  <div className="flex gap-4 justify-center">
                    {question.options.map(option => (
                      <button
                        key={option}
                        onClick={() => !(wasInitiallySubmitted || isJustSubmitted) && handleFieldChange(question.fieldName, option)}
                        disabled={wasInitiallySubmitted || isJustSubmitted}
                        className={`px-6 py-3 rounded-full font-bold text-sm transition-all
                                  ${fields[question.fieldName] === option
                            ? 'glass-card shadow-lg scale-105'
                            : 'bg-white/30 hover:bg-white/50'}
                                  ${(wasInitiallySubmitted || isJustSubmitted) ? 'cursor-not-allowed opacity-70' : ''}`}
                        style={{
                          color: fields[question.fieldName] === option ? colors.berry : colors.deepBrown,
                          borderWidth: fields[question.fieldName] === option ? '2px' : '1px',
                          borderColor: fields[question.fieldName] === option ? colors.rose : 'transparent'
                        }}>
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'rating' && (
                  <div className="space-y-3">
                    <div className="flex gap-3 justify-center flex-wrap">
                      {[...Array(10)].map((_, i) => {
                        const rating = i + 1;
                        return (
                          <button
                            key={rating}
                            onClick={() => !(wasInitiallySubmitted || isJustSubmitted) && handleFieldChange(question.fieldName, String(rating))}
                            disabled={wasInitiallySubmitted || isJustSubmitted}
                            className={`w-12 h-12 rounded-full font-bold text-sm transition-all
                                      ${fields[question.fieldName] === String(rating)
                                ? 'glass-card shadow-lg scale-110'
                                : 'bg-white/30 hover:bg-white/50'}
                                      ${(wasInitiallySubmitted || isJustSubmitted) ? 'cursor-not-allowed opacity-70' : ''}`}
                            style={{
                              color: fields[question.fieldName] === String(rating) ? colors.berry : colors.deepBrown,
                              borderWidth: fields[question.fieldName] === String(rating) ? '2px' : '1px',
                              borderColor: fields[question.fieldName] === String(rating) ? colors.rose : 'transparent'
                            }}>
                            {rating}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : isTaskSubmitting ? (
          <div className="flex items-center justify-center py-16 space-x-3">
            <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{
              borderColor: `${colors.rose} transparent transparent transparent`,
              borderWidth: '3px'
            }} />
            <p className="text-sm font-medium" style={{ color: colors.berry }}>
              送信中...
            </p>
          </div>
        ) : null}

        {wasInitiallySubmitted && !isJustSubmitted ? (
          <button
            onClick={() => setView('home')}
            className="w-full py-5 rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${colors.sakura}, ${colors.cream})`,
              color: colors.berry
            }}
          >
            ホームに戻る
          </button>
        ) : !showAiMessage ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allFieldsFilled || isTaskSubmitting || submitSuccess}
            className={`w-full py-6 rounded-full font-bold text-white shadow-2xl
                       flex items-center justify-center gap-3 text-sm tracking-[0.3em]
                       btn-bounce disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300 ${(isTaskSubmitting || submitSuccess) ? 'pointer-events-none' : ''}`}
            style={{ background: `linear-gradient(135deg, ${colors.rose}, ${colors.gold})` }}>
            {submitSuccess ? (
              <>
                <CheckCircle2 size={20} />
                送信しました
              </>
            ) : isTaskSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                送信中...
              </>
            ) : (
              <>
                <Send size={20} />
                想いを綴る
              </>
            )}
          </button>
        ) : (
          <div className="space-y-6 page-turn-in">
            <div className="relative">
              <div className="absolute -inset-4 opacity-30 blur-3xl rounded-[3rem]"
                style={{ background: `linear-gradient(135deg, ${colors.sakura}, ${colors.cream}, ${colors.sky})` }} />
              <div className="relative paper-texture p-8 rounded-[3rem] border-4 border-white shadow-2xl">
                <div className="space-y-4 mb-6">
                  <Sparkles size={28} style={{ color: colors.gold }} className="mx-auto animate-pulse" />
                  <h3 className="font-serif font-bold text-lg text-center" style={{ color: colors.berry }}>
                    メッセージ
                  </h3>
                </div>
                <p style={{ color: colors.deepBrown }}
                  className="text-sm leading-[2] whitespace-pre-line">
                  {aiMessage}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={async () => {
                  const reward = dayRewards[day];
                  if (reward) {
                    const url = reward.reward_url || reward.image_url;
                    if (url) {
                      window.open(url, '_blank');
                      const rewardViewedField = `day${day}_reward_viewed` as keyof typeof story;
                      await updateStory({ [rewardViewedField]: true } as any);
                    }
                  }
                  await reloadStoryData();
                  setView('home');
                }}
                className="w-full py-5 rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
                style={{
                  background: `linear-gradient(135deg, ${colors.gold}, #FFD700)`,
                  color: 'white'
                }}
              >
                <Gift size={20} className="fill-current" />
                特典を受け取る
              </button>
              <button
                onClick={async () => {
                  await reloadStoryData();
                  setView('home');
                }}
                className="w-full py-4 rounded-full font-medium shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 opacity-60 hover:opacity-100"
                style={{
                  background: `linear-gradient(135deg, ${colors.sakura}, ${colors.cream})`,
                  color: colors.berry
                }}
              >
                後で確認する
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const RewardsCollectionView = () => {
    const stampCards = [
      { day: 1, label: '特典1', completed: !!story.day1_field1, viewed: story.day1_reward_viewed, reward: dayRewards[1] },
      { day: 2, label: '特典2', completed: !!story.day2_field1, viewed: story.day2_reward_viewed, reward: dayRewards[2] },
      { day: 3, label: '特典3', completed: !!story.day3_field1, viewed: story.day3_reward_viewed, reward: dayRewards[3] },
    ];

    const perfectReceived = story.is_gift_sent && giftContent;

    return (
      <div className="page-turn-in space-y-8 relative z-10">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] opacity-50
                     hover:opacity-100 transition-all glass-card px-4 py-2 rounded-full">
          ← MAP
        </button>

        <div className="text-center space-y-4">
          <div className="inline-block p-4 rounded-full glass-card">
            <Gift size={32} style={{ color: colors.gold }} className="fill-current" />
          </div>
          <span className="font-script text-3xl block" style={{ color: colors.gold }}>Stamp Card</span>
          <h2 className="text-3xl font-serif font-bold" style={{ color: colors.berry }}>
            特典スタンプカード
          </h2>
          <div className="h-0.5 w-20 mx-auto mizuhiki-line" />
        </div>

        <div className="paper-texture rounded-[2rem] p-6 shadow-xl border-4 border-white">
          <div className="grid grid-cols-2 gap-4">
            {stampCards.map(({ day, label, completed, viewed, reward }) => (
              <button
                key={day}
                onClick={async () => {
                  if (completed && reward) {
                    const url = reward.reward_url || reward.image_url;
                    if (url) {
                      window.open(url, '_blank');
                      if (!viewed) {
                        const rewardViewedField = `day${day}_reward_viewed` as keyof typeof story;
                        await updateStory({ [rewardViewedField]: true } as any);
                      }
                    }
                  }
                }}
                disabled={!completed}
                className={`relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${completed ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                  }`}
                style={{ borderColor: completed ? colors.gold : colors.deepBrown }}
              >
                {completed ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center transform -rotate-12"
                        style={{ background: `linear-gradient(135deg, ${colors.rose}, ${colors.berry})` }}>
                        <CheckCircle2 size={40} className="text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-white shadow"
                        style={{ color: colors.berry }}>
                        {label}
                      </span>
                    </div>
                    {!viewed && (
                      <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                        NEW
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Gift size={32} style={{ color: colors.deepBrown }} className="opacity-30" />
                    <span className="text-xs font-bold" style={{ color: colors.deepBrown }}>{label}</span>
                  </>
                )}
              </button>
            ))}

            <button
              onClick={() => {
                if (perfectReceived) {
                  updateStory({ is_gift_viewed: true });
                  setView('gift');
                }
              }}
              disabled={!perfectReceived}
              className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all col-span-2 ${perfectReceived ? 'hover:scale-105 active:scale-95 cursor-pointer border-solid' : 'opacity-40 cursor-not-allowed border-dashed'
                }`}
              style={{ borderColor: perfectReceived ? colors.rose : colors.deepBrown }}
            >
              {perfectReceived ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center transform -rotate-12"
                      style={{ background: `linear-gradient(135deg, ${colors.gold}, #FFD700, ${colors.rose})` }}>
                      <Trophy size={48} className="text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-white shadow"
                      style={{ color: colors.berry }}>
                      パーフェクト賞
                    </span>
                  </div>
                  {!story.is_gift_viewed && (
                    <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                      NEW
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Trophy size={40} style={{ color: colors.deepBrown }} className="opacity-30" />
                  <span className="text-sm font-bold" style={{ color: colors.deepBrown }}>パーフェクト賞</span>
                  <span className="text-[10px] opacity-50" style={{ color: colors.deepBrown }}>全課題完了で獲得</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs opacity-60" style={{ color: colors.deepBrown }}>
              課題を提出するとスタンプが押されます
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => setView('home')}
            className="px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
            style={{ background: `linear-gradient(135deg, ${colors.sakura}, ${colors.cream})`, color: colors.berry }}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  };

  const VisionView = () => (
    <div className="page-turn-in space-y-8 relative z-10">
      <button
        onClick={() => setView('home')}
        className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] opacity-50
                   hover:opacity-100 transition-all glass-card px-4 py-2 rounded-full">
        ← MAP
      </button>

      <div className="text-center space-y-4">
        <div className="inline-block p-4 rounded-full glass-card">
          <Heart size={32} style={{ color: colors.rose }} className="animate-pulse" />
        </div>
        <span className="font-script text-3xl block" style={{ color: colors.gold }}>Visionary Gallery</span>
        <h2 className="text-3xl font-serif font-bold" style={{ color: colors.berry }}>
          未来の挿絵コレクション
        </h2>
        <div className="h-0.5 w-20 mx-auto mizuhiki-line" />
        <p className="text-xs opacity-60 italic px-10 leading-relaxed">
          あなたの理想の景色を美しく並べましょう
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 px-3 pb-10">
        {visionImages.map((img) => (
          <div key={img.id} className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden
                                       shadow-2xl border-4 border-white group hover:scale-105
                                       transition-transform duration-500">
            <img src={img.image_url} alt="vision" className="w-full h-full object-cover" />
            <button
              onClick={() => removeVisionImage(img.id)}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full
                         text-red-400 opacity-0 group-hover:opacity-100 transition-all
                         hover:scale-110 shadow-lg">
              <X size={16} />
            </button>
          </div>
        ))}

        {visionImages.length < 6 && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[3/4] rounded-[2.5rem] border-2 border-dashed flex flex-col
                       items-center justify-center gap-4 glass-card hover:scale-105
                       transition-all duration-500 group"
            style={{ borderColor: colors.rose }}>
            <Plus size={40} style={{ color: colors.rose }}
              className="opacity-40 group-hover:opacity-100 transition-opacity" />
            <span className="text-[10px] font-bold opacity-40 group-hover:opacity-70
                           uppercase tracking-[0.3em] transition-opacity">
              Add Scene
            </span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              addVisionImage(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        }}
        accept="image/*"
        className="hidden"
      />
    </div>
  );

  const GiftView = () => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      }
    }, [isPlaying]);

    return (
      <div className="page-turn-in space-y-12 text-center pb-20 relative z-10">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] opacity-50
                     hover:opacity-100 transition-all glass-card px-4 py-2 rounded-full">
          ← MAP
        </button>

        <div className="space-y-6">
          {giftContent?.image_url ? (
            <div className="mx-auto max-w-sm">
              <img
                src={giftContent.image_url}
                alt="パーフェクト特典"
                className="w-full h-64 object-cover rounded-[3rem] shadow-2xl floating"
              />
            </div>
          ) : (
            <div className="inline-block p-12 rounded-full glass-card shadow-2xl floating shimmer-border"
              style={{ background: `linear-gradient(135deg, ${colors.sakura}, ${colors.cream})` }}>
              <Trophy size={72} style={{ color: colors.gold }} />
            </div>
          )}
          <div className="space-y-3">
            <span className="font-script text-4xl block" style={{ color: colors.gold }}>
              Epilogue
            </span>
            <h2 className="text-4xl font-serif font-bold tracking-tight" style={{ color: colors.berry }}>
              {giftContent?.title || '魔法の結末'}
            </h2>
            <div className="h-0.5 w-24 mx-auto mizuhiki-line" />
          </div>
        </div>

        <div className="relative mx-4">
          <div className="absolute -inset-4 opacity-30 blur-3xl rounded-[5rem]"
            style={{ background: `linear-gradient(135deg, ${colors.sakura}, ${colors.cream}, ${colors.sky})` }} />
          <div className="relative paper-texture seigaiha p-10 rounded-[4rem] border-8 border-white shadow-2xl">
            <div className="space-y-2 mb-6">
              <Stars size={24} style={{ color: colors.gold }} className="mx-auto animate-pulse" />
            </div>
            <p style={{ color: colors.berry }}
              className="text-lg leading-[2.5] font-serif italic font-bold whitespace-pre-line">
              {giftContent?.message || 'すべての課題を完了されました。あなたの魔法の旅路はここから始まります。'}
            </p>
            <div className="mt-8 flex justify-center opacity-20">
              <Feather size={36} />
            </div>
          </div>
        </div>

        {giftContent?.audio_url && (
          <div className="mx-3 p-10 rounded-[4rem] shadow-2xl overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, ${colors.berry}, ${colors.deepBrown})` }}>
            <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
              <Music size={180} />
            </div>

            <div className="space-y-8 relative z-10">
              <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-2xl
                              shimmer-border"
                style={{ background: `linear-gradient(135deg, ${colors.rose}, ${colors.gold})` }}>
                <Music size={40} className="text-white" />
              </div>

              <div className="space-y-3">
                <h4 className="font-serif font-bold text-2xl tracking-[0.4em] text-white">
                  魔法のアファメーション
                </h4>
                <p className="text-[9px] tracking-[0.5em] opacity-50 uppercase text-white">
                  A Special Voice Gift
                </p>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center
                             shadow-2xl hover:scale-110 active:scale-95 transition-all flex-shrink-0"
                  style={{ color: colors.berry }}>
                  {isPlaying ? <Pause size={36} /> : <Play size={36} className="ml-1" />}
                </button>

                <div className="flex-1 space-y-3 text-left">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className={`h-full transition-all duration-1000 ${isPlaying ? 'w-full' : 'w-0'}`}
                      style={{
                        background: `linear-gradient(90deg, ${colors.rose}, ${colors.gold})`,
                        transitionDuration: isPlaying ? '45s' : '0s'
                      }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold opacity-40 tracking-[0.3em] text-white">
                    <span>NOW PLAYING</span>
                    <span>2:30</span>
                  </div>
                </div>
              </div>

              <audio ref={audioRef} src={giftContent.audio_url} onEnded={() => setIsPlaying(false)} />
            </div>
          </div>
        )}

        {!story.is_gift_viewed && (
          <button
            onClick={async () => {
              const result = await updateStory({ is_gift_viewed: true });
              if (!result) {
                await reloadStoryData();
              }
              setNewlyClaimedReward('perfect');
              setView('home');
              setTimeout(() => setNewlyClaimedReward(null), 2000);
            }}
            className="w-full py-6 rounded-full font-bold text-white shadow-2xl flex items-center justify-center gap-3
                       text-sm tracking-[0.3em] btn-bounce hover:scale-105 active:scale-95 transition-all"
            style={{ background: `linear-gradient(135deg, ${colors.rose}, ${colors.berry})` }}>
            <Trophy size={20} />
            特典を受け取る
          </button>
        )}

        <button
          onClick={() => sendRewardToLine('perfect', giftContent.title, giftContent.message, giftContent.image_url, giftContent.reward_url)}
          disabled={sendingToLine}
          className="w-full py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-3
                     text-sm tracking-[0.2em] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          style={{ background: '#06C755', color: 'white' }}>
          <Send size={18} />
          {sendingToLine ? '送信中...' : 'LINEに送る'}
        </button>

        {lineMessage && (
          <div className={`text-center py-3 px-4 rounded-xl text-sm font-bold ${lineMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
            {lineMessage.text}
          </div>
        )}
      </div>
    );
  };

  if (liffLoading) {
    return (
      <div className="min-h-screen sakura-gradient flex items-center justify-center">
        <StyleTag />
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-rose-300 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium" style={{ color: colors.deepBrown }}>
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center overflow-hidden relative">
        <StyleTag />

        {/* Animated Stars Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}
        </div>

        {/* Cosmic Gate Ring */}
        <div className="absolute w-[500px] h-[500px] border border-cyan-500/20 rounded-full animate-spin" style={{ animationDuration: '60s' }} />
        <div className="absolute w-[400px] h-[400px] border border-indigo-500/30 rounded-full animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
        <div className="absolute w-[300px] h-[300px] border border-purple-500/20 rounded-full animate-spin" style={{ animationDuration: '30s' }} />

        <div className="relative z-10 w-full max-w-[400px] mx-4">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/20 text-center space-y-8">

            {/* Logo & Title */}
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                <Rocket size={36} className="text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] tracking-[0.3em] text-cyan-400 font-bold">TALENTFLOW</p>
                <h1 className="text-2xl font-bold text-white tracking-wider">
                  SPACELINES
                </h1>
                <p className="text-xs text-white/50 tracking-widest">
                  PASSENGER GATE
                </p>
              </div>
            </div>

            {/* Gate Status */}
            <div className="py-4 px-6 bg-slate-800/50 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium tracking-wider">GATE OPEN</span>
              </div>
              <p className="text-sm text-white/70">
                LINEアカウントで搭乗手続きを完了し
                <br />
                <span className="text-cyan-300">あなただけの航海</span>を始めましょう
              </p>
            </div>

            {/* LINE Login Button */}
            <button
              onClick={login}
              disabled={!isInitialized}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/30 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
              style={{ background: '#06C755' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current relative z-10">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              <span className="relative z-10">{!isInitialized ? '初期化中...' : '搭乗手続きを開始'}</span>
            </button>

            {/* Demo Mode - Admin Only */}
            {isAdmin && (
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('demo', 'true');
                  window.location.href = url.toString();
                }}
                className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:bg-white/5 border border-white/20 text-white/60 hover:text-white/80"
              >
                デモフライトで体験
              </button>
            )}

            {liffError && (
              <p className="text-sm text-red-400">
                {liffError}
              </p>
            )}

            {/* Footer */}
            <p className="text-[10px] text-white/30 tracking-wider">
              ✦ 21-DAY TRANSFORMATION JOURNEY ✦
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isCommander = story.user_phase === 'commander';
  const backgroundClass = isCommander ? 'space-gradient' : 'sakura-gradient';
  const textColorClass = isCommander ? 'text-white' : '';

  return (
    <div className={`min-h-screen ${backgroundClass} overflow-x-hidden pb-10 selection:bg-pink-200 ${view === 'admin' ? '' : 'flex justify-center'} ${textColorClass}`}>
      <StyleTag />
      {view !== 'admin' && <WaveBackground />}

      <div className={`w-full min-h-screen flex flex-col relative ${view === 'admin' ? 'max-w-[1400px] mx-auto px-8 py-6' : 'max-w-[520px] p-6'}`}>

        {/* Hide global header for Commander (has its own) and Passenger (clean look) */}
        {view !== 'admin' && view !== 'home' && (
          <header className="py-8 text-center relative z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-5">
              <Cloud size={120} style={{ color: isCommander ? '#ffffff' : colors.rose }} />
            </div>
            <button
              onClick={() => setView(view === 'admin' ? 'home' : 'admin')}
              className="absolute top-4 right-4 p-2 rounded-full glass-card hover:scale-110 transition-transform duration-300 z-50"
              style={{ background: isCommander ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${colors.sakura}, ${colors.cream})` }}
            >
              <Settings size={20} style={{ color: isCommander ? '#ffffff' : colors.berry }} />
            </button>
            <div className="relative space-y-3">
              <div className="inline-block">
                <Stars size={28} style={{ color: isCommander ? '#fbbf24' : colors.gold }} className="animate-pulse" />
              </div>
              <h1 className="text-2xl font-serif font-bold leading-relaxed"
                style={{ color: isCommander ? '#ffffff' : colors.berry }}>
                {siteSettings?.site_title || '絵本で「未来を設定する」ノート'}
              </h1>
              <div className="space-y-1.5">
                <span className="text-xs opacity-70 tracking-widest font-medium block" style={{ color: isCommander ? 'rgba(255,255,255,0.8)' : colors.deepBrown }}>
                  {siteSettings?.site_subtitle || '2026年、最高の物語をここから。'}
                </span>
              </div>
            </div>
          </header>
        )}

        {/* Hide reservation/weather for Commander (has its own) and Passenger (clean look) */}
        {view !== 'admin' && view !== 'home' && (
          <div className="space-y-4 mb-6">
            <ReservationStatus />
            <WeatherScoreBar />
          </div>
        )}

        <main className="flex-1 relative z-10">
          {view === 'admin' && <AdminView />}
          {view === 'home' && <HomeView />}
          {view === 'gakka' && story && (
            <div className="relative">
              {/* Back to Commander Dashboard button */}
              <button
                onClick={() => setView('home')}
                className="absolute top-2 left-2 z-20 flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all text-sm border border-white/20"
              >
                ← 実技モードへ
              </button>
              <PassengerDashboard
                story={story}
                daySettings={daySettings}
                siteSettings={siteSettings}
                onUpdate={updateStory}
                onStartDiagnosis={() => setShowDiagnosis(true)}
                onStartTask={(day) => setView(`day${day}` as any)}
                onViewSettings={() => setView('admin')}
                onPromotion={async () => {
                  await updateStory({ user_phase: 'commander' });
                  if (!unlockedDays.includes(1)) {
                    await updateStory({ unlocked_days: [1], is_locked: false });
                  }
                  setView('home');
                }}
              />
            </div>
          )}
          {view === 'archives' && <ArchivesView />}
          {view === 'rewards' && <RewardsCollectionView />}
          {view === 'vision' && <VisionView />}
          {view === 'day1' && daySettings[1] && (
            unlockedDays.includes(1) && !story.is_locked ? (
              <TaskView
                day={1}
                subtitle={daySettings[1].subtitle}
                title={daySettings[1].title}
                date={daySettings[1].date}
                description={daySettings[1].description}
                questions={daySettings[1].questions}
                bgGradient={`linear-gradient(135deg, ${colors[daySettings[1].bg_color as keyof typeof colors] || colors.sage}33, ${colors.cream})`}
              />
            ) : (
              <div className="page-turn-in">
                <button
                  onClick={() => setView('home')}
                  className="mb-6 flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] opacity-50
                             hover:opacity-100 transition-all glass-card px-4 py-2 rounded-full">
                  ← MAP
                </button>
                <LockedDayPreview
                  day={1}
                  previewText={daySettings[1].preview_text}
                  previewImageUrl={daySettings[1].preview_image_url}
                  reason={story.is_locked ? 'deadline-expired' : 'not-unlocked'}
                  showRevivalOption={story.is_locked && siteSettings?.enable_revival_system}
                  onRevivalRequest={() => {
                    setRevivalDay(1);
                    setShowRevivalModal(true);
                  }}
                />
              </div>
            )
          )}
          {view === 'day2' && daySettings[2] && (
            unlockedDays.includes(2) && !story.is_locked ? (
              <TaskView
                day={2}
                subtitle={daySettings[2].subtitle}
                title={daySettings[2].title}
                date={daySettings[2].date}
                description={daySettings[2].description}
                questions={daySettings[2].questions}
                bgGradient={`linear-gradient(135deg, ${colors[daySettings[2].bg_color as keyof typeof colors] || colors.sky}33, ${colors.cream})`}
              />
            ) : (
              <div className="page-turn-in">
                <button
                  onClick={() => setView('home')}
                  className="mb-6 flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] opacity-50
                             hover:opacity-100 transition-all glass-card px-4 py-2 rounded-full">
                  ← MAP
                </button>
                <LockedDayPreview
                  day={2}
                  previewText={daySettings[2].preview_text}
                  previewImageUrl={daySettings[2].preview_image_url}
                  reason={story.is_locked ? 'deadline-expired' : 'not-unlocked'}
                  showRevivalOption={story.is_locked && siteSettings?.enable_revival_system}
                  onRevivalRequest={() => {
                    setRevivalDay(2);
                    setShowRevivalModal(true);
                  }}
                />
              </div>
            )
          )}
          {view === 'day3' && daySettings[3] && (
            unlockedDays.includes(3) && !story.is_locked ? (
              <TaskView
                day={3}
                subtitle={daySettings[3].subtitle}
                title={daySettings[3].title}
                date={daySettings[3].date}
                description={daySettings[3].description}
                questions={daySettings[3].questions}
                bgGradient={`linear-gradient(135deg, ${colors[daySettings[3].bg_color as keyof typeof colors] || colors.sakura}33, ${colors.cream})`}
              />
            ) : (
              <div className="page-turn-in">
                <button
                  onClick={() => setView('home')}
                  className="mb-6 flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] opacity-50
                             hover:opacity-100 transition-all glass-card px-4 py-2 rounded-full">
                  ← MAP
                </button>
                <LockedDayPreview
                  day={3}
                  previewText={daySettings[3].preview_text}
                  previewImageUrl={daySettings[3].preview_image_url}
                  reason={story.is_locked ? 'deadline-expired' : 'not-unlocked'}
                  showRevivalOption={story.is_locked && siteSettings?.enable_revival_system}
                  onRevivalRequest={() => {
                    setRevivalDay(3);
                    setShowRevivalModal(true);
                  }}
                />
              </div>
            )
          )}
          {view === 'gift' && <GiftView />}
        </main>

        {(siteSettings?.footer_line1 || siteSettings?.footer_line2) && (
          <footer className="mt-12 text-center pb-8 px-8 space-y-4 relative z-10">
            <div className="h-0.5 w-16 mx-auto mizuhiki-line" />
            <p className="opacity-30 text-[8px] font-bold tracking-[0.3em] uppercase leading-relaxed"
              style={{ color: colors.deepBrown }}>
              {siteSettings.footer_line1 && <>{siteSettings.footer_line1}<br /></>}
              {siteSettings.footer_line2}
            </p>
          </footer>
        )}
      </div>

      {showRevivalModal && revivalDay && (
        <RevivalModal
          day={revivalDay}
          lineUserId={story.email || ''}
          userStoryId={story.id}
          onClose={() => {
            setShowRevivalModal(false);
            setRevivalDay(null);
          }}
          onSuccess={() => {
            setShowRevivalModal(false);
            setRevivalDay(null);
            alert('復活課題を提出しました。管理者の承認をお待ちください。');
            reloadStoryData();
          }}
        />
      )}

      {showHRVMeasurement && (
        <HRVMeasurement
          lineUserId={userData?.line_user_id || story.email || story.id}
          brainType={userData?.brain_type || undefined}
          onClose={() => setShowHRVMeasurement(false)}
          onComplete={async (metrics, feedback) => {
            console.log('HRV Measurement completed:', metrics, feedback);

            // Update Story Progress (Daily Logs)
            const today = new Date().toISOString().split('T')[0];
            const existingTodayLog = (story.daily_logs || {})[today] || {};
            const newLogs = {
              ...(story.daily_logs || {}),
              [today]: {
                ...existingTodayLog, // Preserve existing data (mission, fortune, etc.)
                score: metrics.score,
                type: metrics.type,
                timestamp: new Date().toISOString()
              }
            };
            await updateStory({ daily_logs: newLogs });
            await reloadStoryData();

            // Save to Supabase
            try {
              await supabase.from('health_metrics').insert({
                line_user_id: userData?.line_user_id || story.id,
                checkin_score: metrics.score,
                body_score: metrics.detail.body,
                mind_score: metrics.detail.mind,
                passion_score: metrics.detail.passion,
                checkin_type: metrics.type,
                ai_feedback: feedback,
                // Legacy / Required placeholder fields
                heart_rate: 0,
                hrv_sdnn: 0,
                hrv_rmssd: 0,
                stress_level: metrics.type, // Store type here too as fallback or filter
                autonomic_balance: 'BALANCE', // Dummy
                brain_type: '',
                signal_quality: 100
              });
              console.log('Saved check-in result to health_metrics');
            } catch (e) {
              console.error('Error saving check-in result:', e);
            }
            // setShowHRVMeasurement(false); // Keep open to show result
          }}
        />
      )}

      {showDiagnosis && (
        <BrainTypeDiagnosis
          lineUserId={userData?.line_user_id || story?.line_user_id || story?.email || `guest_${story?.id || 'anonymous'}`}
          onClose={() => setShowDiagnosis(false)}
          onComplete={async (brainType) => {
            console.log('Diagnosis completed:', brainType);
            localStorage.setItem('brainType', brainType);
            localStorage.setItem('lastSeenBrainType', brainType);
            setLocalBrainType(brainType);
            setPendingBrainType(brainType);

            // Sync with Story Data (Supabase)
            await updateStory({ brain_type: brainType });
            await reloadStoryData();

            setShowDiagnosis(false);

            // Gate Opening disabled for now - use debug button to test
            // setShowGateOpening(true);

            if (userData) {
              await refreshUserData();
            }
          }}
        />
      )}

      {/* Credits */}
      <div className="fixed bottom-4 right-4 text-right text-xs text-gray-400 space-y-0.5 pointer-events-none">
        <div className="font-medium">Powered by Gamifinity</div>
        <div>Produced by Mitsue Nomura</div>
      </div>

      {/* Digital Boarding Pass (Worldview Integration) */}
      {showBoardingPass && (
        <BoardingPass
          story={story}
          onClose={handleCloseBoardingPass}
          onStartDiagnosis={() => setShowDiagnosis(true)}
        />
      )}

      {/* Gate Opening - 21 Day Program Entry */}
      {showGateOpening && (
        <GateOpening
          userName={story?.name || userData?.display_name || 'ゲスト'}
          brainType={pendingBrainType || story?.brain_type || 'right_3d'}
          onEnroll={async () => {
            // Enroll in 21-day program
            await updateStory({
              program_enrolled_at: new Date().toISOString(),
              program_day: 1,
              program_status: 'active'
            });
            await reloadStoryData();
          }}
          onSkip={() => {
            setShowGateOpening(false);
            setPendingBrainType(null);
          }}
        />
      )}

      {/* Point Card Modal */}
      {showPointCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <PointCard
            userName={story?.name || userData?.display_name || 'ゲスト'}
            brainType={story?.brain_type || 'right_3d'}
            stats={{
              ego_observation: story?.ego_observation || 0,
              ego_control: story?.ego_control || 0,
              ego_efficacy: story?.ego_efficacy || 0,
              ego_affirmation: story?.ego_affirmation || 0,
              stress_tolerance: story?.stress_tolerance || 0
            }}
            totalMiles={story?.total_miles || 0}
            programDay={story?.program_day || 1}
            rank="passenger"
            onClose={() => setShowPointCard(false)}
          />
        </div>
      )}

      {/* Trinity Code Mission Modal */}
      {showTrinityCode && (
        <TrinityCodeMission
          day={story?.program_day || 1}
          brainType={story?.brain_type || 'right_3d'}
          userName={story?.name || userData?.display_name || 'ゲスト'}
          currentStats={{
            ego_observation: story?.ego_observation || 0,
            ego_control: story?.ego_control || 0,
            ego_efficacy: story?.ego_efficacy || 0,
            ego_affirmation: story?.ego_affirmation || 0,
            stress_tolerance: story?.stress_tolerance || 0
          }}
          onComplete={async (rewards) => {
            // Update story with new stats
            await updateStory({
              ego_observation: (story?.ego_observation || 0) + (rewards.ego_observation || 0),
              ego_control: (story?.ego_control || 0) + (rewards.ego_control || 0),
              ego_efficacy: (story?.ego_efficacy || 0) + (rewards.ego_efficacy || 0),
              ego_affirmation: (story?.ego_affirmation || 0) + (rewards.ego_affirmation || 0),
              stress_tolerance: (story?.stress_tolerance || 0) + (rewards.stress_tolerance || 0),
              program_day: (story?.program_day || 1) + 1,
              total_miles: (story?.total_miles || 0) + 100
            });
            await reloadStoryData();
          }}
          onClose={() => setShowTrinityCode(false)}
        />
      )}

      {/* Video Modal (In-App Player) */}
      <VideoModal url={activeVideoUrl} onClose={() => setActiveVideoUrl(null)} />
    </div>
  );
};

export default App;
