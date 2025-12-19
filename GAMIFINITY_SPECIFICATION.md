# Gamifinity - Product Specification Document

## Version 1.0 | 2025-12-19

---

## 1. Executive Summary

**Gamifinity**は、LINE連携・AI・ゲーミフィケーションを統合した顧客エンゲージメントプラットフォームです。

### 主な特徴

| 機能カテゴリ | 概要 |
|-------------|------|
| LINE統合 | LIFFミニアプリ + Messaging API による双方向コミュニケーション |
| 脳タイプ診断 | 4タイプの性格診断システムによるパーソナライゼーション |
| ゲーミフィケーション | 日次アンロック、リワード、進捗トラッキング |
| AIコーチング | 脳タイプに応じた個別最適化されたAI返信提案 |
| ホットリード検出 | AIによる見込み顧客のスコアリングと通知 |
| 生体計測 | スマートフォンカメラを使用したHRV（心拍変動）計測 |

### 技術スタック

- **フロントエンド**: React 18 + TypeScript + Vite + Tailwind CSS
- **バックエンド**: Supabase (PostgreSQL + Edge Functions)
- **AI**: Google Gemini / OpenAI / Anthropic Claude
- **外部連携**: LINE LIFF, LINE Messaging API, Google Sheets, Zoom

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         LINE Platform                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │  LINE App   │    │  LIFF SDK   │    │ Messaging   │          │
│  │  (User)     │◄──►│  (Mini App) │◄──►│    API      │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Gamifinity Application                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React Frontend                        │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │
│  │  │BrainType │ │  Day     │ │  Chat    │ │  HRV     │   │    │
│  │  │Diagnosis │ │ Journey  │ │Dashboard │ │Measure   │   │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Supabase Edge Functions                  │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐          │    │
│  │  │line-webhook│ │generate-   │ │hot-lead-   │          │    │
│  │  │            │ │chat-reply  │ │notify      │          │    │
│  │  └────────────┘ └────────────┘ └────────────┘          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  PostgreSQL Database                     │    │
│  │  line_users | user_stories | diagnostics | chat_status  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Google   │  │  OpenAI  │  │Anthropic │  │  Google  │        │
│  │ Gemini   │  │  GPT-4   │  │  Claude  │  │  Sheets  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Features

### 3.1 Brain Type Diagnosis System (脳タイプ診断)

4つの脳タイプ（クルー）に基づくパーソナライゼーションシステム。

#### 4つのタイプ

| タイプID | 名前 | 特性 | キーワード | 強み | 弱点 |
|----------|------|------|-----------|------|------|
| `left_3d` | シン（戦略家） | 論理的・本質追求 | 効率、分析、最適化 | 問題解決力 | 冷たく感じられる |
| `left_2d` | マモル（守護者） | 慎重・規則重視 | 安全、前例、精密 | 信頼性、細部への注意 | 過度に慎重 |
| `right_3d` | ソラ（冒険家） | 直感的・可能性追求 | ワクワク、可能性、情熱 | 創造性、インスピレーション | 散漫になりやすい |
| `right_2d` | ピク（癒やし手） | 共感的・調和重視 | 感謝、つながり、協調 | 感情サポート、協力 | 自己犠牲的 |

#### 診断フロー

```
1. ユーザーがLINEで友だち追加
       ↓
2. ウェルカムメッセージで診断リンク送信
       ↓
3. 7〜10問の選択式質問に回答
       ↓
4. 各選択肢は特定の脳タイプ + スコアに紐づく
       ↓
5. 合計スコアが最も高いタイプ = プライマリタイプ
       ↓
6. 結果表示 + line_usersテーブルに保存
       ↓
7. 以降のすべてのコミュニケーションをパーソナライズ
```

#### 診断のカスタマイズ

- `diagnostics`テーブルで質問を管理
- 各質問には4つの選択肢（各脳タイプに対応）
- AIによる質問自動生成機能あり（Gemini/OpenAI/Claude対応）
- 管理画面から有効/無効の切り替え可能

---

### 3.2 Day Journey System (日次ジャーニー)

3日間の段階的なコンテンツ解放システム。

#### ジャーニー構成

| Day | テーマ | 内容 | アンロック条件 |
|-----|--------|------|---------------|
| Day 1 | 記憶の森 | 幼少期の記憶、好きだったこと | 初期状態で解放 |
| Day 2 | 才能の泉 | 自然な才能、得意なこと | 設定時刻到達後 |
| Day 3 | 未来の扉 | 2026年のビジョン、フィードバック | 設定時刻到達後 |

#### 機能詳細

**カウントダウンタイマー**
- 各Dayのアンロック時刻までリアルタイムカウントダウン
- 日・時間・分・秒で表示
- 期待感を演出

**デッドライン管理**
- ユーザーごとの提出期限設定可能
- 期限超過時はロック状態に
- Revivalシステムで復活リクエスト可能

**リワードシステム**
- Day完了時に報酬を付与
- 報酬内容: タイトル、メッセージ、画像、リンク
- LINEメッセージで報酬通知

**エピローグギフト**
- 全Day完了時に特別ギフト解放
- 音声コンテンツ対応
- 達成感の演出

#### 設定項目

```typescript
interface DaySettings {
  day: number;              // Day番号 (1-10)
  title: string;            // タイトル（例: "記憶の森"）
  subtitle: string;         // サブタイトル
  description: string;      // 説明文
  questions: Question[];    // 質問の配列
  bg_color: string;         // 背景色 ('sage' | 'sky' | 'sakura')
  zoom_link: string;        // Zoomリンク
  zoom_passcode: string;    // Zoomパスコード
  zoom_meeting_time: Date;  // ミーティング時刻
  youtube_url: string;      // YouTube動画URL
  preview_text: string;     // ロック時のプレビューテキスト
  preview_image_url: string; // ロック時のプレビュー画像
}
```

---

### 3.3 AI Chat Coaching (AIチャットコーチング)

管理者向けのAI返信提案機能。

#### 機能概要

```
ユーザーからのメッセージ受信
       ↓
generate-chat-reply Edge Function呼び出し
       ↓
ユーザー情報取得（脳タイプ、課題回答、チャット履歴）
       ↓
Gemini AIで3つの返信候補生成
       ↓
管理画面に提案表示
       ↓
管理者が選択・編集して送信
```

#### 3ステップ返信フォーマット

1. **共感 (Acknowledge)**
   - ユーザーの発言から具体的なフレーズを引用
   - 感情や状況への理解を示す

2. **分析 (Analyze)**
   - 脳タイプ理論に基づく解説
   - 才能フロー方程式を活用

3. **実験 (Experiment)**
   - 5分でできる小さなアクションを提案
   - 具体的で実行可能なマイクロハビット

#### ナレッジボード

管理画面のチャット画面に表示される情報パネル:

- ユーザーの脳タイプと特性
- コミュニケーションスタイルのヒント
- 課題回答のサマリー
- 最近のアクティビティ

---

### 3.4 Hot Lead Detection (ホットリード検出)

AIによる見込み顧客の自動スコアリングシステム。

#### スコアリング基準

| 基準 | スコア影響 |
|------|-----------|
| 具体的な目標・金額の記載 | +2 |
| 痛み・緊急性の表現 | +2 |
| 講師への信頼感 | +1 |
| 行動へのコミットメント | +2 |
| 投資マインド | +2 |
| 回答の努力・長さ | +1 |
| 曖昧・努力不足 | -1 |
| 短すぎる回答 | -2 |

#### 通知フロー

```
課題提出
   ↓
hot-lead-notify Edge Function呼び出し
   ↓
Gemini AIでスコア計算（1-10）
   ↓
hot_lead_logsテーブルに記録
   ↓
閾値以上の場合、管理者LINEに通知
   ↓
通知内容: ユーザー名、メール、スコア、理由
```

#### 管理機能

- システムの有効/無効切り替え
- 閾値の設定（デフォルト: 7）
- 通知先LINEユーザーIDの登録
- 分析統計の表示

---

### 3.5 HRV Measurement (心拍変動計測)

スマートフォンカメラを使用したバイオメトリクス計測。

#### 計測プロセス

```
1. カメラアクセス許可を取得
       ↓
2. 指をカメラに押し当てる
       ↓
3. 30秒間の動画キャプチャ
       ↓
4. PPG（光電式容積脈波）解析
       ↓
5. HRV指標の算出
       ↓
6. 脳タイプ別フィードバック生成
```

#### 計測指標

| 指標 | 説明 |
|------|------|
| Heart Rate (BPM) | 心拍数 |
| SDNN | R-R間隔の標準偏差（全体的な変動性） |
| RMSSD | 連続するR-R間隔差のRMS（副交感神経活動） |
| Stress Level | ストレスレベル（low/moderate/high） |
| Autonomic Balance | 自律神経バランス（交感神経優位/バランス/副交感神経優位） |

#### 脳タイプ別フィードバック

各脳タイプとストレス状態の組み合わせに応じた個別アドバイスを提供。

例:
- シン × ストレス高 → 「論理が過負荷状態です。ソラの"ワクワク"に耳を傾けて」
- ピク × リラックス → 「その温かさを周りに分けてあげましょう」

---

### 3.6 Admin Panel (管理画面)

#### 機能一覧

| セクション | 機能 |
|-----------|------|
| ユーザー一覧 | 全ユーザーの表示、フィルター、検索、チャット遷移 |
| 基本設定 | サイトタイトル、バナー、フッター設定 |
| チャット | ユーザーとの1対1メッセージング、AI提案 |
| ロック解除 | ユーザーのDay手動解放 |
| アーカイブ | 動画アーカイブURL管理 |
| プレゼント | Day別報酬の設定 |
| Day設定 | 各Dayのコンテンツ管理 |
| 脳タイプ診断 | 診断質問の管理、AI生成 |
| AI接続 | AI APIキーの管理 |
| LINE連携 | LINE設定、メッセージテンプレート |
| メッセージ | 定型文テンプレートの管理 |

#### ユーザー一覧機能

```typescript
// フィルターオプション
interface FilterState {
  brainType: string;      // 脳タイプでフィルター
  minDay: number | null;  // 進捗Day下限
  maxDay: number | null;  // 進捗Day上限
  minScore: number | null; // ホットリードスコア下限
  hotLeadOnly: boolean;   // ホットリードのみ
  searchQuery: string;    // 名前・メール検索
}

// ソートオプション
type SortBy = 'score' | 'day' | 'name' | 'recent';
```

---

### 3.7 LINE Integration (LINE連携)

#### LIFF (LINE Front-end Framework)

```typescript
// 初期化
liff.init({ liffId: 'YOUR_LIFF_ID' });

// ユーザー情報取得
const profile = await liff.getProfile();
// profile.userId, profile.displayName, profile.pictureUrl

// LIFFを閉じる
liff.closeWindow();
```

#### Messaging API

**Webhook処理**

```typescript
// line-webhook Edge Functionで処理するイベント
type EventType =
  | 'follow'    // 友だち追加
  | 'unfollow'  // ブロック
  | 'message';  // メッセージ受信

// メッセージタイプ
type MessageType = 'text' | 'image' | 'sticker' | 'audio' | 'video';
```

**メッセージ送信**

```typescript
// Reply Message（ユーザーのメッセージに返信）
POST https://api.line.me/v2/bot/message/reply
{
  replyToken: string,
  messages: Message[]
}

// Push Message（任意のタイミングで送信）
POST https://api.line.me/v2/bot/message/push
{
  to: string,  // LINE User ID
  messages: Message[]
}
```

#### メッセージテンプレート

カスタマイズ可能なメッセージテンプレート:

| キー | 用途 | プレースホルダー |
|------|------|-----------------|
| `welcome` | 友だち追加時 | `{{displayName}}`, `{{diagnosticUrl}}` |
| `reminder` | リマインダー | `{{dayTitle}}`, `{{liffUrl}}` |
| `email_registered` | メール登録完了 | `{{email}}` |
| `reward_notification` | 報酬通知 | `{{rewardTitle}}`, `{{rewardUrl}}` |

---

## 4. Database Schema

### 4.1 Core Tables

#### line_users
```sql
CREATE TABLE line_users (
  line_user_id TEXT PRIMARY KEY,
  display_name TEXT,
  email TEXT,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '09:00',
  brain_type TEXT CHECK (brain_type IN ('left_3d', 'left_2d', 'right_3d', 'right_2d')),
  brain_type_scores JSONB,
  diagnosis_completed BOOLEAN DEFAULT false,
  progress_level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  is_admin_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### user_stories
```sql
CREATE TABLE user_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id TEXT REFERENCES line_users(line_user_id),
  email TEXT,

  -- Day 1 fields
  day1_field1 TEXT,
  day1_field2 TEXT,
  day1_field3 TEXT,

  -- Day 2 fields
  day2_field1 TEXT,
  day2_field2 TEXT,
  day2_field3 TEXT,

  -- Day 3 fields (extended)
  day3_field1 TEXT,
  day3_field2 TEXT,
  day3_field3 TEXT,
  day3_field4 TEXT,
  day3_field5 TEXT,
  day3_field6 TEXT,

  -- Progress tracking
  unlocked_days JSONB DEFAULT '[1]',
  progress INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,

  -- Gift system
  is_gift_sent BOOLEAN DEFAULT false,
  is_gift_viewed BOOLEAN DEFAULT false,

  -- Deadlines
  submission_deadline TIMESTAMPTZ,
  revival_requested BOOLEAN DEFAULT false,

  -- Rewards
  day1_reward_viewed BOOLEAN DEFAULT false,
  day2_reward_viewed BOOLEAN DEFAULT false,
  day3_reward_viewed BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### diagnostics
```sql
CREATE TABLE diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  -- questions format:
  -- [
  --   {
  --     "question_id": "q1",
  --     "question_text": "質問文",
  --     "options": [
  --       {"option_id": "a", "option_text": "選択肢", "brain_type": "left_3d", "score": 3}
  --     ]
  --   }
  -- ]
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### line_messages
```sql
CREATE TABLE line_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT NOT NULL,
  message_text TEXT,
  message_data JSONB,
  line_message_id TEXT,
  sent_by_admin TEXT,
  reply_to_message_id UUID REFERENCES line_messages(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 Configuration Tables

#### site_settings
```sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Deadlines
  day1_archive_deadline TIMESTAMPTZ,
  day1_assignment_deadline TIMESTAMPTZ,
  day2_archive_deadline TIMESTAMPTZ,
  day2_assignment_deadline TIMESTAMPTZ,
  day3_archive_deadline TIMESTAMPTZ,
  day3_assignment_deadline TIMESTAMPTZ,
  default_submission_time TEXT DEFAULT '21:30',

  -- Features
  enable_revival_system BOOLEAN DEFAULT true,

  -- Branding
  site_title TEXT,
  site_subtitle TEXT,
  app_title TEXT,
  banner_text TEXT,
  banner_image_url TEXT,
  footer_line1 TEXT,
  footer_line2 TEXT,

  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### day_settings
```sql
CREATE TABLE day_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day INTEGER UNIQUE NOT NULL,
  subtitle TEXT,
  title TEXT,
  date TEXT,
  description TEXT,
  questions JSONB,
  -- questions format:
  -- [
  --   {"field": "day1_field1", "label": "質問ラベル", "type": "textarea"}
  -- ]
  bg_color TEXT DEFAULT 'sage',
  zoom_link TEXT,
  zoom_passcode TEXT,
  zoom_meeting_time TIMESTAMPTZ,
  youtube_url TEXT,
  preview_text TEXT,
  preview_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### line_settings
```sql
CREATE TABLE line_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_access_token TEXT,
  channel_secret TEXT,
  liff_url TEXT,
  bot_basic_id TEXT,
  admin_password TEXT DEFAULT 'admin2025',
  admin_line_user_id TEXT,
  hot_lead_enabled BOOLEAN DEFAULT false,
  hot_lead_threshold INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. Edge Functions

### 5.1 line-webhook

**目的**: LINEからのWebhookイベントを処理

**トリガー**: LINE Messaging API Webhook

**処理内容**:
- 署名検証（HMAC-SHA256）
- followイベント: ウェルカムメッセージ送信
- messageイベント: コマンド処理、チャット記録
- 管理者コマンド: 統計、通知設定など

### 5.2 generate-chat-reply

**目的**: AI返信提案の生成

**入力**:
```json
{
  "lineUserId": "U1234567890",
  "latestMessage": "最新のメッセージ内容"
}
```

**出力**:
```json
{
  "success": true,
  "suggestions": ["提案1", "提案2", "提案3"],
  "knowledgeBoard": {
    "brainType": "シン（戦略家）",
    "communicationStyle": "論理的で簡潔な説明を好む",
    "approachTips": "データや根拠を示すと効果的",
    "storySummary": "課題回答のサマリー"
  },
  "userData": {
    "displayName": "ユーザー名",
    "brainType": "left_3d",
    "brainTypeLabel": "シン（戦略家）"
  }
}
```

### 5.3 hot-lead-notify

**目的**: ホットリードの検出と通知

**入力**:
```json
{
  "lineUserId": "U1234567890",
  "email": "user@example.com",
  "day": 1,
  "content": "課題の回答内容"
}
```

**出力**:
```json
{
  "success": true,
  "score": 8,
  "reason": "具体的な数字目標があり、行動への意欲が高い",
  "notified": true
}
```

### 5.4 send-reminders

**目的**: 日次リマインダーの送信

**トリガー**: Cronジョブ（毎時実行推奨）

**処理内容**:
1. 現在アクティブなDayを判定
2. リマインダー有効＋該当時刻のユーザーを抽出
3. 未提出ユーザーにリマインダー送信
4. last_reminded_atを更新

### 5.5 submit-to-sheets

**目的**: Google Sheetsへのデータ送信と報酬配信

**入力**:
```json
{
  "email": "user@example.com",
  "day": 1,
  "field1": "回答1",
  "field2": "回答2",
  "field3": "回答3",
  "lineUserId": "U1234567890",
  "userName": "ユーザー名"
}
```

**処理**:
1. Google Sheets WebhookへPOST
2. submissionsテーブルに記録
3. hot-lead-notify呼び出し
4. 報酬メッセージをLINEで送信

### 5.6 generate-diagnostic-questions

**目的**: 診断質問のAI生成

**入力**:
```json
{
  "theme": "自己理解",
  "provider": "gemini"  // "gemini" | "openai" | "anthropic"
}
```

**出力**:
```json
{
  "success": true,
  "questions": [
    {
      "question_id": "q1",
      "question_text": "質問文",
      "options": [
        {"option_id": "a", "option_text": "選択肢A", "brain_type": "left_3d", "score": 3},
        {"option_id": "b", "option_text": "選択肢B", "brain_type": "left_2d", "score": 3},
        {"option_id": "c", "option_text": "選択肢C", "brain_type": "right_3d", "score": 3},
        {"option_id": "d", "option_text": "選択肢D", "brain_type": "right_2d", "score": 3}
      ]
    }
  ]
}
```

---

## 6. Frontend Components

### 6.1 Component Structure

```
src/
├── App.tsx                    # メインアプリケーション
├── components/
│   ├── BrainTypeDiagnosis.tsx # 脳タイプ診断
│   ├── ChatDashboard.tsx      # 管理者チャット
│   ├── NiyaNiyaList.tsx       # ユーザー一覧
│   ├── CountdownTimer.tsx     # カウントダウン
│   ├── HRVMeasurement.tsx     # HRV計測
│   ├── LockedDayPreview.tsx   # ロック時プレビュー
│   ├── RevivalModal.tsx       # 復活リクエスト
│   ├── YouTubePlayer.tsx      # YouTube埋め込み
│   └── ZoomAccess.tsx         # Zoom情報表示
├── hooks/
│   ├── useLiff.ts             # LIFF初期化フック
│   └── useStoryData.ts        # ストーリーデータフック
└── lib/
    ├── supabase.ts            # Supabaseクライアント
    └── ppgAnalysis.ts         # PPG解析ライブラリ
```

### 6.2 Key Component: BrainTypeDiagnosis

```typescript
interface BrainTypeDiagnosisProps {
  onComplete: (brainType: string) => void;
}

// 内部状態
interface DiagnosisState {
  currentQuestion: number;
  answers: Answer[];
  scores: Record<BrainType, number>;
  result: BrainType | null;
  isComplete: boolean;
}
```

### 6.3 Key Component: ChatDashboard

```typescript
interface ChatDashboardProps {
  initialUserId?: string | null;
}

// 機能
// - ユーザーリスト表示（検索・フィルター付き）
// - メッセージスレッド表示
// - AI返信提案
// - テンプレート選択
// - ナレッジボード表示
// - スター・メモ機能
```

### 6.4 Key Component: HRVMeasurement

```typescript
// 計測フェーズ
type MeasurementPhase =
  | 'intro'      // 説明画面
  | 'setup'      // カメラ準備
  | 'measuring'  // 計測中
  | 'analyzing'  // 解析中
  | 'result';    // 結果表示

// 計測結果
interface HRVResult {
  heartRate: number;
  hrvSDNN: number;
  hrvRMSSD: number;
  stressLevel: 'low' | 'moderate' | 'high';
  autonomicBalance: 'sympathetic' | 'balanced' | 'parasympathetic';
  feedback: string;
}
```

---

## 7. External Integrations

### 7.1 LINE Setup

#### LIFF App作成

1. LINE Developersコンソールでプロバイダー作成
2. Messaging APIチャネル作成
3. LIFFアプリ追加
   - サイズ: Full
   - エンドポイントURL: デプロイ先URL
4. LIFF IDを取得

#### Messaging API設定

1. チャネルアクセストークン発行
2. チャネルシークレット確認
3. Webhook URL設定: `https://{project}.supabase.co/functions/v1/line-webhook`
4. Webhookの利用: ON
5. 応答メッセージ: OFF
6. あいさつメッセージ: OFF

### 7.2 Google Sheets Setup

#### Apps Script設定

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.email,
    data.day,
    data.field1,
    data.field2,
    data.field3,
    data.userName
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ success: true })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

#### WebアプリとしてデプロイI

1. Apps Scriptエディタで「デプロイ」→「新しいデプロイ」
2. 種類: ウェブアプリ
3. 実行ユーザー: 自分
4. アクセス: 全員
5. デプロイURLを取得

### 7.3 AI Provider Setup

#### Google Gemini

1. Google AI Studioでプロジェクト作成
2. APIキー発行
3. 環境変数`GEMINI_API_KEY`に設定

#### OpenAI (オプション)

1. OpenAI PlatformでAPIキー発行
2. 管理画面の「AI接続」で設定

#### Anthropic (オプション)

1. Anthropic ConsoleでAPIキー発行
2. 管理画面の「AI接続」で設定

---

## 8. Environment Variables

### Frontend (.env)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_LIFF_ID=1234567890-xxxxxxxx
VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/xxx/exec
```

### Supabase Edge Functions

```env
# 自動設定（Supabase提供）
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# 手動設定
GEMINI_API_KEY=AIza...
```

---

## 9. Security Considerations

### Row Level Security (RLS)

すべてのテーブルでRLSを有効化:

```sql
-- 基本ポリシー例
ALTER TABLE line_users ENABLE ROW LEVEL SECURITY;

-- 匿名アクセス（Edge Function経由）
CREATE POLICY "Allow anon access" ON line_users
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);
```

### API Key Security

- LINEトークン: `line_settings`テーブルに保存
- AIキー: `ai_settings`テーブルに暗号化保存
- 本番環境では環境変数を使用

### Webhook Security

```typescript
// LINE Webhook署名検証
const isValidSignature = (
  body: string,
  signature: string,
  channelSecret: string
): boolean => {
  const hash = crypto
    .createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');
  return hash === signature;
};
```

---

## 10. Deployment

### Supabase Project Setup

1. Supabaseプロジェクト作成
2. マイグレーション実行
3. Edge Functions デプロイ
4. 環境変数設定

### Frontend Deployment

1. `npm run build`
2. `dist/`フォルダをホスティング
3. LINE LIFFのエンドポイントURLを更新

### Initial Data Setup

```sql
-- サイト設定の初期値
INSERT INTO site_settings (site_title, enable_revival_system)
VALUES ('Gamifinity', true);

-- LINE設定の初期値
INSERT INTO line_settings (admin_password)
VALUES ('admin2025');

-- Day設定の初期値
INSERT INTO day_settings (day, title, subtitle, bg_color)
VALUES
  (1, '記憶の森', 'Day 1', 'sage'),
  (2, '才能の泉', 'Day 2', 'sky'),
  (3, '未来の扉', 'Day 3', 'sakura');
```

---

## 11. Customization Guide

### ブランディング変更

1. `site_settings`でタイトル・バナー設定
2. `colors`オブジェクトで配色変更
3. ロゴ・画像のアップロード

### Day構成の変更

1. `day_settings`でDay数を追加（最大10）
2. 各Dayの質問をJSONで定義
3. アンロック時刻を`site_settings`で設定

### 脳タイプのカスタマイズ

1. `BRAIN_TYPE_INFO`定数を編集
2. 診断質問を`diagnostics`テーブルで管理
3. チャットテンプレートを脳タイプ別に設定

### メッセージのカスタマイズ

1. `line_message_templates`でテンプレート編集
2. プレースホルダー: `{{displayName}}`, `{{dayTitle}}`など
3. 管理画面の「メッセージ」セクションで編集

---

## 12. API Reference

### REST Endpoints (via Supabase)

```
# データ取得
GET /rest/v1/line_users
GET /rest/v1/user_stories
GET /rest/v1/diagnostics

# Edge Functions
POST /functions/v1/line-webhook
POST /functions/v1/generate-chat-reply
POST /functions/v1/hot-lead-notify
POST /functions/v1/submit-to-sheets
POST /functions/v1/send-line-message
POST /functions/v1/send-reminders
```

### Supabase Client Usage

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// データ取得
const { data, error } = await supabase
  .from('line_users')
  .select('*')
  .eq('brain_type', 'left_3d');

// データ更新
await supabase
  .from('user_stories')
  .update({ progress: 100 })
  .eq('line_user_id', userId);
```

---

## 13. Troubleshooting

### よくある問題

| 問題 | 原因 | 解決策 |
|------|------|--------|
| LIFFが開かない | LIFF ID不正 | LINE Developersで確認 |
| Webhookエラー | 署名不一致 | チャネルシークレット確認 |
| AIが応答しない | APIキー無効 | キーの有効期限確認 |
| メッセージ未送信 | トークン期限切れ | トークン再発行 |
| Sheets連携失敗 | URLの設定ミス | デプロイURL確認 |

### ログ確認

```bash
# Supabase Edge Function ログ
supabase functions logs line-webhook
supabase functions logs generate-chat-reply
```

---

## 14. Roadmap (Future Features)

### Phase 2
- マルチテナント対応（複数組織で利用可能に）
- ダッシュボード分析機能強化
- A/Bテスト機能

### Phase 3
- 音声メッセージ対応
- 動画メッセージ対応
- 多言語対応（i18n）

### Phase 4
- Stripe決済連携
- サブスクリプション管理
- アフィリエイト機能

---

## 15. Support & Contact

### ドキュメント

- [LINE Developers](https://developers.line.biz/)
- [Supabase Docs](https://supabase.com/docs)
- [Google AI Studio](https://makersuite.google.com/)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-19
**Author**: Gamifinity Development Team
