import { useState } from 'react';
import { X, Heart, Send, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RevivalModalProps {
  day: number;
  lineUserId: string;
  userStoryId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function RevivalModal({ day, lineUserId, userStoryId, onClose, onSuccess }: RevivalModalProps) {
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!submissionText.trim()) {
      setError('復活課題の内容を入力してください');
      return;
    }

    if (submissionText.length < 50) {
      setError('50文字以上で入力してください（現在: ' + submissionText.length + '文字）');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('revival_submissions')
        .insert([{
          user_story_id: userStoryId,
          line_user_id: lineUserId,
          day,
          submission_text: submissionText,
          status: 'pending'
        }]);

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('user_stories')
        .update({ revival_requested: true })
        .eq('id', userStoryId);

      if (updateError) throw updateError;

      onSuccess();
    } catch (err) {
      console.error('Error submitting revival:', err);
      setError('復活課題の提出に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">復活課題</h2>
              <p className="text-sm text-white/60">Day {day} の再挑戦</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="glass-card p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <h3 className="text-green-200 font-medium mb-2">諦めるのはまだ早い！</h3>
          <p className="text-white/80 text-sm leading-relaxed">
            期限を過ぎてしまいましたが、復活課題を提出することで再参加のチャンスがあります。
            以下の質問に対して、真摯に向き合い、50文字以上で回答してください。
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-white font-medium">
            復活課題：なぜこのチャレンジに再挑戦したいのですか？
          </label>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="あなたの想いを聞かせてください&#10;&#10;例：&#10;・期限に間に合わなかった理由&#10;・このチャレンジから得たい学び&#10;・今後どのように取り組むか&#10;&#10;（50文字以上）"
            className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 resize-none"
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between text-sm">
            <span className={`${
              submissionText.length >= 50 ? 'text-green-400' : 'text-white/60'
            }`}>
              {submissionText.length} / 50文字
            </span>
            {submissionText.length > 0 && submissionText.length < 50 && (
              <span className="text-amber-400">
                あと {50 - submissionText.length} 文字必要です
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="glass-card p-3 rounded-lg bg-red-500/10 border-red-500/30">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || submissionText.length < 50}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                提出中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                復活課題を提出
              </>
            )}
          </button>
        </div>

        <div className="glass-card p-3 rounded-lg bg-blue-500/10 border-blue-500/30">
          <p className="text-blue-200 text-xs leading-relaxed">
            ※ 提出後、管理者が内容を確認し、承認されるとDay {day} のロックが解除されます。
          </p>
        </div>
      </div>
    </div>
  );
}
