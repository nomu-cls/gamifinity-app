import { useState, useRef, useEffect, useCallback } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer as YTPlayer } from 'react-youtube';
import { Play, Pause, CheckCircle2 } from 'lucide-react';

interface YouTubePlayerProps {
  videoUrl: string;
  brainType?: string | null;
  onWatchComplete?: () => void;
  onTimeThreshold?: (currentTime: number) => void;
  timeThresholdSeconds?: number;
  completionThreshold?: number;
}


const extractVideoId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

const _brainTypeMessages: Record<string, { title: string; message: string; color: string }> = {
  left_3d: {
    title: '本質（左脳3次元）',
    message: '今のあなたの脳は本質を掴むのに最適な状態です',
    color: '#B89B66'
  },
  left_2d: {
    title: '緻密（左脳2次元）',
    message: '今のあなたの脳は細部を分析するのに最適な状態です',
    color: '#6B8E6B'
  },
  right_3d: {
    title: '情熱（右脳3次元）',
    message: '今のあなたの脳はインスピレーションを受け取るのに最適な状態です',
    color: '#D1A6A6'
  },
  right_2d: {
    title: '共感（右脳2次元）',
    message: '今のあなたの脳は深い理解を得るのに最適な状態です',
    color: '#9B7B9B'
  }
};

const YouTubePlayer = ({
  videoUrl,
  brainType: _brainType,
  onWatchComplete,
  onTimeThreshold,
  timeThresholdSeconds,
  completionThreshold = 0.9
}: YouTubePlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);
  const thresholdTriggeredRef = useRef(false);
  const skipTimerRef = useRef<NodeJS.Timeout | null>(null);

  const videoId = extractVideoId(videoUrl);

  // Show skip button after 30 seconds if video hasn't been played
  useEffect(() => {
    skipTimerRef.current = setTimeout(() => {
      if (!isPlaying && !hasCompleted) {
        setShowSkipButton(true);
      }
    }, 30000); // 30 seconds

    return () => {
      if (skipTimerRef.current) {
        clearTimeout(skipTimerRef.current);
      }
    };
  }, []);

  // Hide skip button if video starts playing
  useEffect(() => {
    if (isPlaying) {
      setShowSkipButton(false);
    }
  }, [isPlaying]);

  const handleSkipToComplete = () => {
    completedRef.current = true;
    setHasCompleted(true);
    setShowSkipButton(false);
    console.log('User skipped video due to playback issues');
    onWatchComplete?.();
  };


  const checkProgress = useCallback(() => {
    if (!playerRef.current) return;

    try {
      const currentTime = playerRef.current.getCurrentTime();
      const totalDuration = playerRef.current.getDuration();

      if (totalDuration > 0) {
        const currentProgress = currentTime / totalDuration;
        setProgress(currentProgress);
        setDuration(totalDuration);

        // Time threshold trigger (for mission form)
        if (timeThresholdSeconds && onTimeThreshold && !thresholdTriggeredRef.current) {
          // Use seconds directly, or calculate from end if negative
          const targetTime = timeThresholdSeconds > 0
            ? timeThresholdSeconds
            : totalDuration + timeThresholdSeconds; // e.g., -180 = 3 min before end

          if (currentTime >= targetTime) {
            thresholdTriggeredRef.current = true;
            console.log(`Time threshold ${timeThresholdSeconds}s reached at ${currentTime.toFixed(1)}s`);
            onTimeThreshold(currentTime);
          }
        }

        // Completion threshold trigger
        if (currentProgress >= completionThreshold && !completedRef.current) {
          completedRef.current = true;
          setHasCompleted(true);
          console.log(`Video ${completionThreshold * 100}% completion detected!`);
          onWatchComplete?.();
        }
      }
    } catch (error) {
      console.error('Error checking progress:', error);
    }
  }, [completionThreshold, onWatchComplete, onTimeThreshold, timeThresholdSeconds]);


  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    setIsReady(true);
    setDuration(event.target.getDuration());
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    const playerState = event.data;

    if (playerState === 1) {
      setIsPlaying(true);
      setShowOverlay(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      progressIntervalRef.current = setInterval(checkProgress, 1000);
    } else if (playerState === 2 || playerState === 0) {
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    if (playerState === 0) {
      checkProgress();
    }
  };

  const opts: YouTubeProps['opts'] = {
    width: '100%',
    height: '100%',
    playerVars: {
      rel: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      playsinline: 1,
      origin: window.location.origin,
      // Prevent end screen with related videos
      fs: 1,
      controls: 1,
      disablekb: 0
    }
  };

  const handlePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500 text-sm">動画URLが無効です</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-xl bg-black">
      <div className="aspect-video relative">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />

        {showOverlay && isReady && !isPlaying && (
          <div
            className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity hover:bg-black/30"
            onClick={handlePlayPause}
          >
            <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
              <Play size={36} className="text-gray-800 ml-1" />
            </div>
          </div>
        )}

        {/* Brain type overlay removed per user request */}

        {hasCompleted && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg">
            <CheckCircle2 size={14} />
            視聴完了
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPause}
            disabled={!isReady}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause size={18} className="text-white" />
            ) : (
              <Play size={18} className="text-white ml-0.5" />
            )}
          </button>

          <div className="flex-1">
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress * 100}%`,
                  background: hasCompleted
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                    : 'linear-gradient(90deg, #D1A6A6, #B89B66)'
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/60">
                {formatTime(progress * duration)}
              </span>
              <span className="text-[10px] text-white/60">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-white/80">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Skip Button - appears after 30 seconds if video can't play */}
      {showSkipButton && !hasCompleted && (
        <div className="bg-gradient-to-r from-amber-900/30 to-rose-900/30 px-4 py-3 border-t border-amber-500/20">
          <button
            onClick={handleSkipToComplete}
            className="w-full py-2 text-sm text-amber-200 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <span>動画が見れない場合はこちら</span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded">スキップ</span>
          </button>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default YouTubePlayer;
