import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, Send, Sparkles, User, Clock, Star, StarOff,
  AlertCircle, ChevronRight, Brain, FileText, RefreshCw,
  Search, Filter, X, Check, Loader2, ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChatUser {
  line_user_id: string;
  display_name: string | null;
  brain_type: string | null;
  email: string | null;
  unread_count: number;
  last_message_at: string | null;
  last_admin_reply_at: string | null;
  is_starred: boolean;
  notes: string | null;
  latest_message?: string;
}

interface Message {
  id: string;
  line_user_id: string;
  direction: 'inbound' | 'outbound';
  message_type: string;
  message_text: string | null;
  sent_by_admin: string | null;
  created_at: string;
}

interface KnowledgeBoard {
  brainType: string;
  communicationStyle: string;
  approachTips: string;
  storySummary: string;
  recentActivity: { direction: string; text: string; time: string }[];
}

interface AISuggestion {
  suggestions: string[];
  knowledgeBoard: KnowledgeBoard;
  userData: {
    displayName: string;
    brainType: string;
    brainTypeLabel: string;
  };
}

interface ChatTemplate {
  id: string;
  brain_type: string;
  category: string;
  title: string;
  content: string;
}

interface Submission {
  id: string;
  line_user_id: string;
  day: number;
  content: { question: string; answer: string }[];
  status: string;
  submitted_at: string | null;
}

const colors = {
  berry: '#8B4B6B',
  deepBrown: '#4A3728',
  gold: '#C9A86C',
  sage: '#87A889',
  sky: '#7BA3C4',
  cream: '#FDF8F3',
  rose: '#E8B4B8',
  sakura: '#FFE4E6',
};

const brainTypeLabels: Record<string, { name: string; color: string; icon: string }> = {
  left_3d: { name: 'シン（戦略家）', color: '#3B82F6', icon: '🎯' },
  left_2d: { name: 'マモル（守護者）', color: '#10B981', icon: '🛡️' },
  right_3d: { name: 'ソラ（冒険家）', color: '#FBBF24', icon: '🚀' },
  right_2d: { name: 'ピク（癒やし手）', color: '#EC4899', icon: '💝' },
};

interface ChatDashboardProps {
  initialUserId?: string | null;
}

export default function ChatDashboard({ initialUserId }: ChatDashboardProps) {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [pendingInitialUserId, setPendingInitialUserId] = useState<string | null>(initialUserId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterStarred, setFilterStarred] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [templates, setTemplates] = useState<ChatTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 200;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage, adjustTextareaHeight]);

  const loadUsers = useCallback(async () => {
    const { data: chatStatus } = await supabase
      .from('chat_status')
      .select('*')
      .order('last_message_at', { ascending: false });

    const { data: lineUsers } = await supabase
      .from('line_users')
      .select('line_user_id, display_name, brain_type, email');

    const { data: latestMessages } = await supabase
      .from('line_messages')
      .select('line_user_id, message_text, created_at')
      .eq('direction', 'inbound')
      .order('created_at', { ascending: false });

    const userMap = new Map<string, ChatUser>();

    lineUsers?.forEach(user => {
      userMap.set(user.line_user_id, {
        line_user_id: user.line_user_id,
        display_name: user.display_name,
        brain_type: user.brain_type,
        email: user.email,
        unread_count: 0,
        last_message_at: null,
        last_admin_reply_at: null,
        is_starred: false,
        notes: null,
      });
    });

    chatStatus?.forEach(status => {
      const existing = userMap.get(status.line_user_id);
      if (existing) {
        existing.unread_count = status.unread_count || 0;
        existing.last_message_at = status.last_message_at;
        existing.last_admin_reply_at = status.last_admin_reply_at;
        existing.is_starred = status.is_starred || false;
        existing.notes = status.notes;
      }
    });

    const latestByUser = new Map<string, string>();
    latestMessages?.forEach(msg => {
      if (!latestByUser.has(msg.line_user_id)) {
        latestByUser.set(msg.line_user_id, msg.message_text || '');
      }
    });
    latestByUser.forEach((text, id) => {
      const user = userMap.get(id);
      if (user) user.latest_message = text;
    });

    const userList = Array.from(userMap.values())
      .sort((a, b) => {
        if (a.is_starred !== b.is_starred) return a.is_starred ? -1 : 1;
        if (a.last_message_at && !b.last_message_at) return -1;
        if (!a.last_message_at && b.last_message_at) return 1;
        const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return timeB - timeA;
      });

    setUsers(userList);
    setIsLoading(false);
  }, []);

  const loadAISuggestion = useCallback(async (userId: string, latestMessage?: string) => {
    setIsLoadingAI(true);
    try {
      console.log('Loading AI suggestion for user:', userId, 'with message:', latestMessage);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-chat-reply`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lineUserId: userId, latestMessage }),
        }
      );

      if (!response.ok) {
        console.error('AI suggestion API error:', response.status, await response.text());
        return;
      }

      const data = await response.json();
      console.log('AI suggestion response:', data);

      if (data.success) {
        setAiSuggestion(data);
      } else {
        console.error('AI suggestion returned success=false:', data);
      }
    } catch (error) {
      console.error('Failed to load AI suggestion:', error);
    } finally {
      setIsLoadingAI(false);
    }
  }, []);

  const loadMessages = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('line_messages')
      .select('*')
      .eq('line_user_id', userId)
      .order('created_at', { ascending: true });

    const messageList = data || [];
    setMessages(messageList);

    await supabase
      .from('chat_status')
      .update({ unread_count: 0, updated_at: new Date().toISOString() })
      .eq('line_user_id', userId);

    setUsers(prev => prev.map(u =>
      u.line_user_id === userId ? { ...u, unread_count: 0 } : u
    ));

    // Load AI suggestion after messages are loaded
    const lastInbound = messageList.filter(m => m.direction === 'inbound').pop();
    await loadAISuggestion(userId, lastInbound?.message_text || '');
  }, [loadAISuggestion]);

  const loadSubmissions = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('line_user_id', userId)
      .order('day', { ascending: true });

    setSubmissions(data || []);
  }, []);

  const loadTemplates = useCallback(async () => {
    const { data } = await supabase
      .from('chat_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    setTemplates(data || []);
  }, []);

  useEffect(() => {
    loadUsers();
    loadTemplates();
  }, [loadUsers, loadTemplates]);

  useEffect(() => {
    if (pendingInitialUserId && users.length > 0) {
      const targetUser = users.find(u => u.line_user_id === pendingInitialUserId);
      if (targetUser) {
        setSelectedUser(targetUser);
        setPendingInitialUserId(null);
      }
    }
  }, [pendingInitialUserId, users]);

  useEffect(() => {
    if (initialUserId && initialUserId !== pendingInitialUserId) {
      setPendingInitialUserId(initialUserId);
    }
  }, [initialUserId]);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.line_user_id);
      loadSubmissions(selectedUser.line_user_id);
    }
  }, [selectedUser?.line_user_id, loadMessages, loadSubmissions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'line_messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          if (selectedUser && newMsg.line_user_id === selectedUser.line_user_id) {
            setMessages(prev => [...prev, newMsg]);
          }
          loadUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, loadUsers]);

  const sendMessage = async () => {
    if (!selectedUser || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-line-message`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lineUserId: selectedUser.line_user_id,
            message: newMessage,
            adminName: 'admin',
          }),
        }
      );

      if (response.ok) {
        setNewMessage('');
        if (textareaRef.current) {
          textareaRef.current.style.height = '44px';
        }
        await loadMessages(selectedUser.line_user_id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const updateBrainType = useCallback(async (userId: string, brainType: string | null) => {
    const { error } = await supabase
      .from('line_users')
      .update({ brain_type: brainType })
      .eq('line_user_id', userId);

    if (!error) {
      setUsers(prev => prev.map(u =>
        u.line_user_id === userId ? { ...u, brain_type: brainType } : u
      ));
      if (selectedUser?.line_user_id === userId) {
        setSelectedUser({ ...selectedUser, brain_type: brainType });
      }
      // Reload AI suggestion with updated brain type
      const lastInbound = messages.filter(m => m.direction === 'inbound').pop();
      await loadAISuggestion(userId, lastInbound?.message_text || '');
    }
  }, [selectedUser, messages, loadAISuggestion]);

  const toggleStar = async (userId: string, currentStar: boolean) => {
    await supabase
      .from('chat_status')
      .update({ is_starred: !currentStar, updated_at: new Date().toISOString() })
      .eq('line_user_id', userId);

    setUsers(prev => prev.map(u =>
      u.line_user_id === userId ? { ...u, is_starred: !currentStar } : u
    ));
  };

  const filteredUsers = users.filter(user => {
    if (filterUnread && user.unread_count === 0) return false;
    if (filterStarred && !user.is_starred) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.display_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      return '昨日';
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    }
  };

  const isOverdue = (user: ChatUser) => {
    if (!user.last_message_at || user.last_admin_reply_at) return false;
    const lastMsg = new Date(user.last_message_at);
    const lastReply = user.last_admin_reply_at ? new Date(user.last_admin_reply_at) : null;
    if (lastReply && lastReply > lastMsg) return false;
    const hours = (Date.now() - lastMsg.getTime()) / (1000 * 60 * 60);
    return hours >= 24 && user.unread_count > 0;
  };

  const getRelevantTemplates = () => {
    const userBrainType = selectedUser?.brain_type || 'general';
    return templates.filter(t => t.brain_type === userBrainType || t.brain_type === 'general');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ユーザーを検索..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterUnread(!filterUnread)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterUnread ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              未読
            </button>
            <button
              onClick={() => setFilterStarred(!filterStarred)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterStarred ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              スター付き
            </button>
            <button
              onClick={loadUsers}
              className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map(user => (
            <button
              key={user.line_user_id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 text-left border-b border-gray-100 hover:bg-white transition-colors ${
                selectedUser?.line_user_id === user.line_user_id ? 'bg-white border-l-4 border-l-blue-500' : ''
              } ${isOverdue(user) ? 'bg-red-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  {user.brain_type && brainTypeLabels[user.brain_type] && (
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
                      style={{ backgroundColor: brainTypeLabels[user.brain_type].color }}
                    >
                      {brainTypeLabels[user.brain_type].icon}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate" style={{ color: colors.deepBrown }}>
                      {user.display_name || 'Unknown'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">
                        {formatTime(user.last_message_at)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {user.latest_message || 'メッセージなし'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {user.unread_count > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                        {user.unread_count}
                      </span>
                    )}
                    {user.is_starred && (
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    )}
                    {isOverdue(user) && (
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              該当するユーザーがいません
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: colors.deepBrown }}>
                    {selectedUser.display_name || 'Unknown'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="relative">
                      <select
                        value={selectedUser.brain_type || ''}
                        onChange={(e) => updateBrainType(selectedUser.line_user_id, e.target.value || null)}
                        className="appearance-none px-2 py-0.5 pr-5 rounded-full text-white text-[10px] font-bold border-0 cursor-pointer hover:opacity-90 transition-opacity"
                        style={{
                          backgroundColor: selectedUser.brain_type && brainTypeLabels[selectedUser.brain_type]
                            ? brainTypeLabels[selectedUser.brain_type].color
                            : '#9CA3AF'
                        }}
                      >
                        <option value="" style={{ backgroundColor: 'white', color: 'black' }}>未設定</option>
                        {Object.entries(brainTypeLabels).map(([key, label]) => (
                          <option key={key} value={key} style={{ backgroundColor: 'white', color: 'black' }}>
                            {label.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-white text-[8px]">
                        ▼
                      </div>
                    </div>
                    {selectedUser.email && <span>{selectedUser.email}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStar(selectedUser.line_user_id, selectedUser.is_starred)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {selectedUser.is_starred ? (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => setShowKnowledge(!showKnowledge)}
                  className={`p-2 rounded-lg transition-colors ${showKnowledge ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
                >
                  <Brain className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className={`flex-1 flex flex-col ${showKnowledge ? 'border-r border-gray-200' : ''}`}>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          msg.direction === 'outbound'
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-white border border-gray-200 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                        <div className={`text-[10px] mt-1 ${msg.direction === 'outbound' ? 'text-blue-200' : 'text-gray-400'}`}>
                          {formatTime(msg.created_at)}
                          {msg.sent_by_admin && msg.direction === 'outbound' && (
                            <span className="ml-2">({msg.sent_by_admin})</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {aiSuggestion && aiSuggestion.suggestions.length > 0 && (
                  <div className="p-3 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-bold text-purple-700">AI返信提案</span>
                      <button
                        onClick={() => loadAISuggestion(selectedUser.line_user_id, messages.filter(m => m.direction === 'inbound').pop()?.message_text)}
                        className="ml-auto text-xs text-purple-500 hover:underline flex items-center gap-1"
                      >
                        {isLoadingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        再生成
                      </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {aiSuggestion.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setNewMessage(suggestion)}
                          className="flex-shrink-0 px-3 py-2 text-xs text-left bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-colors max-w-[200px]"
                        >
                          <p className="line-clamp-2">{suggestion}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                        showTemplates ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      テンプレート
                    </button>
                  </div>

                  {showTemplates && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-1">
                        {getRelevantTemplates().map(template => (
                          <button
                            key={template.id}
                            onClick={() => {
                              setNewMessage(template.content);
                              setShowTemplates(false);
                            }}
                            className="p-2 text-left text-xs bg-white rounded border border-gray-200 hover:border-blue-400 transition-colors"
                          >
                            <p className="font-medium truncate">{template.title}</p>
                            <p className="text-gray-400 truncate">{template.category}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="メッセージを入力... (Shift+Enterで改行)"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none overflow-auto text-sm min-h-[44px] max-h-[200px]"
                      style={{ height: '44px' }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {showKnowledge && (aiSuggestion || submissions.length > 0) && (
                <div className="w-72 bg-gradient-to-b from-blue-50 to-purple-50 p-4 overflow-y-auto">
                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: colors.deepBrown }}>
                    <Brain className="w-4 h-4 text-purple-500" />
                    ナレッジボード
                  </h4>

                  <div className="space-y-4">{aiSuggestion && (
                    <>
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <p className="text-xs font-bold text-gray-500 mb-1">脳タイプ</p>
                      <p className="text-sm font-bold" style={{ color: colors.berry }}>
                        {aiSuggestion.knowledgeBoard.brainType}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <p className="text-xs font-bold text-gray-500 mb-1">コミュニケーションスタイル</p>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {aiSuggestion.knowledgeBoard.communicationStyle}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <p className="text-xs font-bold text-gray-500 mb-1">効果的な接し方</p>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {aiSuggestion.knowledgeBoard.approachTips}
                      </p>
                    </div>

                    {aiSuggestion.knowledgeBoard.storySummary && (
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <p className="text-xs font-bold text-gray-500 mb-1">課題サマリー</p>
                        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {aiSuggestion.knowledgeBoard.storySummary}
                        </p>
                      </div>
                    )}
                    </>
                    )}

                    {submissions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-500 mb-2">課題回答全文</p>
                        {submissions.map((submission) => (
                          <div key={submission.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedDays);
                                if (newExpanded.has(submission.day)) {
                                  newExpanded.delete(submission.day);
                                } else {
                                  newExpanded.add(submission.day);
                                }
                                setExpandedDays(newExpanded);
                              }}
                              className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" style={{ color: colors.berry }} />
                                <span className="text-xs font-bold" style={{ color: colors.deepBrown }}>
                                  Day {submission.day}
                                </span>
                                {submission.status === 'submitted' && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                    提出済
                                  </span>
                                )}
                              </div>
                              <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform ${
                                  expandedDays.has(submission.day) ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            {expandedDays.has(submission.day) && (
                              <div className="px-3 pb-3 space-y-3 border-t border-gray-100">
                                {submission.content.map((item, idx) => (
                                  <div key={idx} className="pt-3">
                                    <p className="text-xs font-bold text-gray-600 mb-1">
                                      {item.question}
                                    </p>
                                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                      {item.answer}
                                    </p>
                                  </div>
                                ))}
                                {submission.submitted_at && (
                                  <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                                    提出日時: {new Date(submission.submitted_at).toLocaleString('ja-JP')}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto" />
              <p className="text-gray-500">ユーザーを選択してチャットを開始</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
