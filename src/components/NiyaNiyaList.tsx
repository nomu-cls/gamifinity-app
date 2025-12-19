import { useState, useEffect, useMemo } from 'react';
import { Search, ExternalLink, Flame, Filter, ChevronDown, ChevronUp, Users, TrendingUp, AlertCircle, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserData {
  line_user_id: string;
  display_name: string | null;
  email: string | null;
  brain_type: string | null;
  diagnosis_completed: boolean;
  created_at: string;
  progress: number;
  current_day: number;
  hot_lead_score: number | null;
  hot_lead_reason: string | null;
  last_activity: string | null;
}

interface FilterState {
  brainType: string;
  minDay: number | null;
  maxDay: number | null;
  minScore: number | null;
  hotLeadOnly: boolean;
  searchQuery: string;
}

const BRAIN_TYPE_INFO: Record<string, { name: string; shortName: string; color: string }> = {
  left_3d: { name: 'シン（戦略家）', shortName: 'シン', color: '#3B82F6' },
  left_2d: { name: 'マモル（守護者）', shortName: 'マモル', color: '#10B981' },
  right_3d: { name: 'ソラ（冒険家）', shortName: 'ソラ', color: '#FBBF24' },
  right_2d: { name: 'ピク（癒やし手）', shortName: 'ピク', color: '#EC4899' }
};

const colors = {
  cream: '#FDF6E9',
  peach: '#FFECD2',
  rose: '#E8A598',
  sage: '#A8C5A8',
  deepBrown: '#5D4E37',
  gold: '#D4A574',
  berry: '#C17B7B',
  sakura: '#FFE4E6',
  primaryDeep: '#4A3728'
};

interface NiyaNiyaListProps {
  lineChannelId?: string;
  onUserChatClick?: (lineUserId: string) => void;
}

export default function NiyaNiyaList({ lineChannelId, onUserChatClick }: NiyaNiyaListProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [botBasicId, setBotBasicId] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    brainType: 'all',
    minDay: null,
    maxDay: null,
    minScore: null,
    hotLeadOnly: false,
    searchQuery: ''
  });
  const [sortBy, setSortBy] = useState<'score' | 'day' | 'name' | 'recent'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadUsers();
    loadLineSettings();
  }, []);

  const loadLineSettings = async () => {
    const { data } = await supabase
      .from('line_settings')
      .select('bot_basic_id')
      .maybeSingle();
    if (data?.bot_basic_id) {
      setBotBasicId(data.bot_basic_id);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);

    const { data: lineUsers, error: lineError } = await supabase
      .from('line_users')
      .select('line_user_id, display_name, email, brain_type, diagnosis_completed, created_at, is_admin_mode');

    if (lineError) {
      console.error('Error loading line users:', lineError);
      setIsLoading(false);
      return;
    }

    const { data: stories, error: storiesError } = await supabase
      .from('user_stories')
      .select('line_user_id, day1_field1, day2_field1, day3_field1, progress, updated_at');

    if (storiesError) {
      console.error('Error loading stories:', storiesError);
    }

    const { data: hotLeads, error: hotLeadError } = await supabase
      .from('hot_lead_logs')
      .select('line_user_id, score, analysis_reason, created_at')
      .order('created_at', { ascending: false });

    if (hotLeadError) {
      console.error('Error loading hot leads:', hotLeadError);
    }

    const latestHotLeads = new Map<string, { score: number; reason: string }>();
    hotLeads?.forEach(lead => {
      if (!latestHotLeads.has(lead.line_user_id)) {
        latestHotLeads.set(lead.line_user_id, {
          score: lead.score,
          reason: lead.analysis_reason
        });
      }
    });

    const storiesMap = new Map(stories?.map(s => [s.line_user_id, s]) || []);

    const userData: UserData[] = (lineUsers || []).map(user => {
      const story = storiesMap.get(user.line_user_id);
      const hotLead = latestHotLeads.get(user.line_user_id);

      let currentDay = 0;
      if (story) {
        if (story.day3_field1) currentDay = 3;
        else if (story.day2_field1) currentDay = 2;
        else if (story.day1_field1) currentDay = 1;
      }

      return {
        line_user_id: user.line_user_id,
        display_name: user.display_name,
        email: user.email,
        brain_type: user.brain_type,
        diagnosis_completed: user.diagnosis_completed || false,
        created_at: user.created_at,
        progress: story?.progress || 0,
        current_day: currentDay,
        hot_lead_score: hotLead?.score || null,
        hot_lead_reason: hotLead?.reason || null,
        last_activity: story?.updated_at || user.created_at
      };
    });

    setUsers(userData);
    setIsLoading(false);
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(u =>
        (u.display_name?.toLowerCase().includes(query)) ||
        (u.email?.toLowerCase().includes(query))
      );
    }

    if (filters.brainType !== 'all') {
      result = result.filter(u => u.brain_type === filters.brainType);
    }

    if (filters.minDay !== null) {
      result = result.filter(u => u.current_day >= filters.minDay!);
    }

    if (filters.maxDay !== null) {
      result = result.filter(u => u.current_day <= filters.maxDay!);
    }

    if (filters.minScore !== null) {
      result = result.filter(u => (u.hot_lead_score || 0) >= filters.minScore!);
    }

    if (filters.hotLeadOnly) {
      result = result.filter(u => (u.hot_lead_score || 0) >= 7);
    }

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'score':
          comparison = (b.hot_lead_score || 0) - (a.hot_lead_score || 0);
          break;
        case 'day':
          comparison = b.current_day - a.current_day;
          break;
        case 'name':
          comparison = (a.display_name || '').localeCompare(b.display_name || '');
          break;
        case 'recent':
          comparison = new Date(b.last_activity || 0).getTime() - new Date(a.last_activity || 0).getTime();
          break;
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });

    const hotUsers = result.filter(u => (u.hot_lead_score || 0) >= 7);
    const otherUsers = result.filter(u => (u.hot_lead_score || 0) < 7);

    return [...hotUsers, ...otherUsers];
  }, [users, filters, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const total = users.length;
    const hotLeads = users.filter(u => (u.hot_lead_score || 0) >= 7).length;
    const diagnosisCompleted = users.filter(u => u.diagnosis_completed).length;
    const byBrainType = Object.keys(BRAIN_TYPE_INFO).reduce((acc, type) => {
      acc[type] = users.filter(u => u.brain_type === type).length;
      return acc;
    }, {} as Record<string, number>);

    return { total, hotLeads, diagnosisCompleted, byBrainType };
  }, [users]);

  const openLineOAManager = (lineUserId: string) => {
    if (!botBasicId) {
      alert('LINE Bot Basic IDが設定されていません。\n設定画面で「LINE Bot Basic ID」を設定してください。');
      return;
    }
    const basicId = botBasicId.startsWith('@') ? botBasicId.substring(1) : botBasicId;
    const managerUrl = `https://chat.line.biz/@${basicId}/chat/${lineUserId}`;
    window.open(managerUrl, '_blank');
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return '#9CA3AF';
    if (score >= 8) return '#EF4444';
    if (score >= 7) return '#F59E0B';
    if (score >= 5) return '#10B981';
    return '#6B7280';
  };

  const getDayBadgeColor = (day: number) => {
    switch (day) {
      case 0: return { bg: '#F3F4F6', text: '#6B7280' };
      case 1: return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 2: return { bg: '#D1FAE5', text: '#047857' };
      case 3: return { bg: '#FEF3C7', text: '#B45309' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const presetFilters = [
    { label: 'Day2で停止中', filter: { minDay: 2, maxDay: 2 } },
    { label: 'Day1で停止中', filter: { minDay: 1, maxDay: 1 } },
    { label: '未着手', filter: { minDay: 0, maxDay: 0 } },
    { label: '右脳2次元のみ', filter: { brainType: 'right_2d' } },
    { label: '左脳3次元のみ', filter: { brainType: 'left_3d' } },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: colors.berry }} />
        <span className="ml-3 text-sm" style={{ color: colors.deepBrown }}>読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} style={{ color: colors.berry }} />
            <span className="text-xs font-medium" style={{ color: colors.deepBrown }}>総ユーザー</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: colors.primaryDeep }}>{stats.total}</p>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={18} className="text-red-500" />
            <span className="text-xs font-medium" style={{ color: colors.deepBrown }}>ホットリード</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.hotLeads}</p>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} style={{ color: colors.sage }} />
            <span className="text-xs font-medium" style={{ color: colors.deepBrown }}>診断完了</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: colors.sage }}>{stats.diagnosisCompleted}</p>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} style={{ color: colors.gold }} />
            <span className="text-xs font-medium" style={{ color: colors.deepBrown }}>要フォロー</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: colors.gold }}>
            {users.filter(u => u.current_day > 0 && u.current_day < 3 && (u.hot_lead_score || 0) >= 5).length}
          </p>
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.deepBrown }} />
            <input
              type="text"
              placeholder="名前・メールで検索..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'white' }}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium transition-all hover:bg-white/50"
            style={{ color: colors.deepBrown }}
          >
            <Filter size={16} />
            詳細フィルター
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
            style={{ color: colors.deepBrown }}
          >
            <option value="score">熱量スコア順</option>
            <option value="day">進捗Day順</option>
            <option value="name">名前順</option>
            <option value="recent">最終活動順</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-lg border border-gray-200 hover:bg-white/50"
          >
            {sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {showFilters && (
          <div className="p-4 mb-4 rounded-lg bg-white/50 space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs font-medium" style={{ color: colors.deepBrown }}>クイックフィルター:</span>
              {presetFilters.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setFilters(prev => ({ ...prev, ...preset.filter }))}
                  className="px-3 py-1 text-xs rounded-full border border-gray-200 hover:bg-white transition-all"
                  style={{ color: colors.deepBrown }}
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => setFilters({
                  brainType: 'all',
                  minDay: null,
                  maxDay: null,
                  minScore: null,
                  hotLeadOnly: false,
                  searchQuery: ''
                })}
                className="px-3 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
                style={{ color: colors.berry }}
              >
                リセット
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.deepBrown }}>脳タイプ</label>
                <select
                  value={filters.brainType}
                  onChange={(e) => setFilters(prev => ({ ...prev, brainType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="all">すべて</option>
                  {Object.entries(BRAIN_TYPE_INFO).map(([key, info]) => (
                    <option key={key} value={key}>{info.shortName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.deepBrown }}>進捗Day（最小）</label>
                <select
                  value={filters.minDay ?? ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, minDay: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="">指定なし</option>
                  <option value="0">未着手</option>
                  <option value="1">Day 1</option>
                  <option value="2">Day 2</option>
                  <option value="3">Day 3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.deepBrown }}>進捗Day（最大）</label>
                <select
                  value={filters.maxDay ?? ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxDay: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="">指定なし</option>
                  <option value="0">未着手</option>
                  <option value="1">Day 1</option>
                  <option value="2">Day 2</option>
                  <option value="3">Day 3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.deepBrown }}>熱量スコア（最小）</label>
                <select
                  value={filters.minScore ?? ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, minScore: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="">指定なし</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n}以上</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hotLeadOnly"
                checked={filters.hotLeadOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, hotLeadOnly: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="hotLeadOnly" className="text-sm" style={{ color: colors.deepBrown }}>
                ホットリードのみ表示（スコア7以上）
              </label>
            </div>
          </div>
        )}

        <div className="text-xs mb-2" style={{ color: colors.deepBrown }}>
          {filteredAndSortedUsers.length} 件表示 / {users.length} 件中
        </div>
      </div>

      <div className="space-y-2">
        {filteredAndSortedUsers.map((user) => {
          const brainInfo = user.brain_type ? BRAIN_TYPE_INFO[user.brain_type] : null;
          const dayBadge = getDayBadgeColor(user.current_day);
          const isHot = (user.hot_lead_score || 0) >= 7;

          return (
            <div
              key={user.line_user_id}
              className={`glass-card p-4 rounded-xl transition-all hover:shadow-lg ${isHot ? 'ring-2 ring-red-300' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 relative">
                  {isHot && (
                    <Flame
                      size={20}
                      className="absolute -top-2 -right-2 text-red-500 animate-pulse"
                      fill="currentColor"
                    />
                  )}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: brainInfo?.color || '#9CA3AF' }}
                  >
                    {user.display_name?.charAt(0) || '?'}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold truncate" style={{ color: colors.primaryDeep }}>
                      {user.display_name || '名前未設定'}
                    </span>
                    {brainInfo && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: brainInfo.color }}
                      >
                        {brainInfo.shortName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs" style={{ color: colors.deepBrown }}>
                    {user.email && (
                      <span className="truncate max-w-[150px]">{user.email}</span>
                    )}
                    <span
                      className="px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: dayBadge.bg, color: dayBadge.text }}
                    >
                      {user.current_day === 0 ? '未着手' : `Day ${user.current_day}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: getScoreColor(user.hot_lead_score) }}
                    >
                      {user.hot_lead_score ?? '-'}
                    </div>
                    <div className="text-xs" style={{ color: colors.deepBrown }}>熱量</div>
                  </div>

                  {onUserChatClick && (
                    <button
                      onClick={() => onUserChatClick(user.line_user_id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
                      style={{ backgroundColor: colors.berry }}
                      title="チャットを開く"
                    >
                      <MessageCircle size={14} />
                      チャット
                    </button>
                  )}

                  <button
                    onClick={() => openLineOAManager(user.line_user_id)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: '#06C755' }}
                    title="LINE公式アカウントマネージャーで開く"
                  >
                    <ExternalLink size={14} />
                    LINE
                  </button>
                </div>
              </div>

              {user.hot_lead_reason && isHot && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-xs" style={{ color: colors.deepBrown }}>
                    <span className="font-medium text-red-600">AI分析: </span>
                    {user.hot_lead_reason}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {filteredAndSortedUsers.length === 0 && (
          <div className="glass-card p-8 rounded-xl text-center">
            <p style={{ color: colors.deepBrown }}>条件に一致するユーザーがいません</p>
          </div>
        )}
      </div>
    </div>
  );
}
