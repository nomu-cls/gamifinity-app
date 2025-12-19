import { Video, Calendar, ExternalLink, Lock, Key } from 'lucide-react';

interface ZoomAccessProps {
  day: number;
  zoomLink?: string;
  zoomPasscode?: string;
  meetingTime?: string;
  isUnlocked: boolean;
  previousDayCompleted: boolean;
}

export function ZoomAccess({ day, zoomLink, zoomPasscode, meetingTime, isUnlocked, previousDayCompleted }: ZoomAccessProps) {
  const canAccessZoom = isUnlocked && previousDayCompleted;

  const generateGoogleCalendarUrl = () => {
    if (!meetingTime || !zoomLink) return '';

    const startTime = new Date(meetingTime);
    const endTime = new Date(startTime.getTime() + 90 * 60000); // 90 minutes later

    const formatDateTime = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `YOSHUKU Challenge - Day ${day}`,
      details: `Zoom Meeting Link: ${zoomLink}`,
      dates: `${formatDateTime(startTime)}/${formatDateTime(endTime)}`,
      location: zoomLink
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  if (!canAccessZoom) {
    return (
      <div className="glass-card p-4 rounded-xl bg-white/5 border-white/10">
        <div className="flex items-center gap-3 text-white/40">
          <Lock className="w-5 h-5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Zoom参加リンク</p>
            <p className="text-xs mt-1">
              {!previousDayCompleted
                ? '前日の課題を提出すると表示されます'
                : 'Day ' + day + ' を解放すると表示されます'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!zoomLink) {
    return null;
  }

  return (
    <div className="glass-card p-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Video className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium">本日のZoom参加リンク</h3>
          {meetingTime && (
            <p className="text-white/60 text-sm">
              {new Date(meetingTime).toLocaleString('ja-JP', {
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <a
          href={zoomLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <Video className="w-5 h-5" />
          Zoomに参加
          <ExternalLink className="w-4 h-4" />
        </a>

        {meetingTime && (
          <a
            href={generateGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center gap-2"
            title="Googleカレンダーに追加"
          >
            <Calendar className="w-5 h-5" />
          </a>
        )}
      </div>

      {zoomPasscode && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10">
          <Key className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-white/60 text-xs">パスコード</p>
            <p className="text-white font-mono font-bold">{zoomPasscode}</p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5">
        <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5" />
        <p className="text-white/70 text-xs leading-relaxed">
          ミーティングには5分前から入室可能です。参加する際はマイクとカメラの設定をご確認ください。
        </p>
      </div>
    </div>
  );
}
