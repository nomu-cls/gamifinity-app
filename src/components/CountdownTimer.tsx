import { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface CountdownTimerProps {
  deadline: string | null;
  onExpire?: () => void;
  compact?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function CountdownTimer({ deadline, onExpire, compact = false }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!deadline) return;

    const calculateTimeRemaining = (): TimeRemaining => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const total = deadlineTime - now;

      if (total <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        days: Math.floor(total / (1000 * 60 * 60 * 24)),
        hours: Math.floor((total / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((total / 1000 / 60) % 60),
        seconds: Math.floor((total / 1000) % 60),
        total
      };
    };

    const updateTimer = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining.total <= 0 && !isExpired) {
        setIsExpired(true);
        onExpire?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deadline, onExpire, isExpired]);

  if (!deadline || !timeRemaining) {
    return null;
  }

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-400" />
        <span className="text-red-300 font-medium">期限切れ</span>
      </div>
    );
  }

  const isUrgent = timeRemaining.total < 3600000; // Less than 1 hour

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
        isUrgent
          ? 'bg-red-500/20 border border-red-500/30'
          : 'bg-amber-500/20 border border-amber-500/30'
      }`}>
        <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400' : 'text-amber-400'}`} />
        <span className={`text-sm font-medium ${isUrgent ? 'text-red-300' : 'text-amber-300'}`}>
          {timeRemaining.days > 0 && `${timeRemaining.days}日 `}
          {String(timeRemaining.hours).padStart(2, '0')}:
          {String(timeRemaining.minutes).padStart(2, '0')}:
          {String(timeRemaining.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div className={`glass-card p-4 rounded-xl ${
      isUrgent ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'
    }`}>
      <div className="flex items-center gap-3">
        <Clock className={`w-6 h-6 ${isUrgent ? 'text-red-400' : 'text-amber-400'} animate-pulse`} />
        <div className="flex-1">
          <p className={`text-sm ${isUrgent ? 'text-red-300' : 'text-amber-300'} mb-1`}>
            課題提出期限まで
          </p>
          <div className="flex items-center gap-2">
            {timeRemaining.days > 0 && (
              <div className="flex flex-col items-center">
                <span className={`text-2xl font-bold ${isUrgent ? 'text-red-200' : 'text-amber-200'}`}>
                  {timeRemaining.days}
                </span>
                <span className="text-xs text-white/60">日</span>
              </div>
            )}
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-bold ${isUrgent ? 'text-red-200' : 'text-amber-200'}`}>
                {String(timeRemaining.hours).padStart(2, '0')}
              </span>
              <span className="text-xs text-white/60">時間</span>
            </div>
            <span className={`text-2xl ${isUrgent ? 'text-red-200' : 'text-amber-200'}`}>:</span>
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-bold ${isUrgent ? 'text-red-200' : 'text-amber-200'}`}>
                {String(timeRemaining.minutes).padStart(2, '0')}
              </span>
              <span className="text-xs text-white/60">分</span>
            </div>
            <span className={`text-2xl ${isUrgent ? 'text-red-200' : 'text-amber-200'}`}>:</span>
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-bold ${isUrgent ? 'text-red-200' : 'text-amber-200'}`}>
                {String(timeRemaining.seconds).padStart(2, '0')}
              </span>
              <span className="text-xs text-white/60">秒</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
