import { Lock, Sparkles } from 'lucide-react';

interface LockedDayPreviewProps {
  day: number;
  previewText?: string;
  previewImageUrl?: string;
  reason: 'not-unlocked' | 'deadline-expired';
  onRevivalRequest?: () => void;
  showRevivalOption?: boolean;
}

export function LockedDayPreview({
  day,
  previewText,
  previewImageUrl,
  reason,
  onRevivalRequest,
  showRevivalOption = false
}: LockedDayPreviewProps) {
  const defaultPreviewText = reason === 'deadline-expired'
    ? '期限までに課題を提出できませんでした'
    : '前日の課題を提出して解放しよう';

  return (
    <div className="relative overflow-hidden rounded-2xl min-h-[400px] flex items-center justify-center">
      {previewImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${previewImageUrl})`,
            filter: 'blur(10px)',
            transform: 'scale(1.1)'
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90 backdrop-blur-xl" />

      <div className="relative z-10 text-center px-8 py-12 max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 mb-6">
          <Lock className="w-10 h-10 text-white/80" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-3">
          Day {day} は未開放です
        </h3>

        <p className="text-white/70 text-lg mb-6">
          {previewText || defaultPreviewText}
        </p>

        {previewText && reason === 'not-unlocked' && (
          <div className="glass-card p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 mb-6">
            <div className="flex items-center gap-2 justify-center mb-2">
              <Sparkles className="w-5 h-5 text-purple-300" />
              <span className="text-purple-200 font-medium">次回予告</span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              {previewText}
            </p>
          </div>
        )}

        {reason === 'deadline-expired' && showRevivalOption && (
          <div className="space-y-4">
            <div className="glass-card p-4 rounded-xl bg-red-500/10 border-red-500/30">
              <p className="text-red-200 text-sm leading-relaxed">
                提出期限を過ぎてしまいました。
                しかし、まだチャンスはあります！
              </p>
            </div>

            {onRevivalRequest && (
              <button
                onClick={onRevivalRequest}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                復活課題に挑戦する
              </button>
            )}
          </div>
        )}

        {reason === 'not-unlocked' && (
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
            <Lock className="w-4 h-4" />
            <span>前日の課題をクリアすると解放されます</span>
          </div>
        )}
      </div>
    </div>
  );
}
