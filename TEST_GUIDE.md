# テスト手順書

## 1. LINEボット連携のテスト

### Step 1: LINEでメールアドレスを登録
1. LINEボットにメールアドレスを送信
   ```
   test@example.com
   ```
2. 以下のメッセージが返ってくることを確認
   ```
   ✅ メールアドレス "test@example.com" を登録しました！
   課題未提出時にリマインダーをお送りします。
   ```

### Step 2: リマインダー設定を確認
1. 「ヘルプ」と送信
   ```
   ヘルプ
   ```
2. 現在のメールアドレスが表示されることを確認

3. 「リマインダーオン」と送信
   ```
   リマインダーオン
   ```
4. 「リマインダーをオンにしました」と返ってくることを確認

### Step 3: データベースで確認
Supabaseダッシュボードで以下を確認：

1. `line_users`テーブル
   - `line_user_id`: あなたのLINE ID
   - `email`: 登録したメールアドレス
   - `reminder_enabled`: true

2. `user_stories`テーブル
   - 該当のemailのレコードに`line_user_id`が自動で紐付いているか確認

## 2. リマインダー送信のテスト

### 手動でリマインダーを実行
以下のコマンドで直接Edge Functionを呼び出せます：

```bash
curl -X POST "YOUR_SUPABASE_URL/functions/v1/send-reminders" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

レスポンス例：
```json
{
  "success": true,
  "currentDay": 1,
  "sentCount": 2,
  "skippedCount": 3,
  "totalUsers": 5
}
```

### レスポンスの意味
- `currentDay`: 現在の課題日（1, 2, 3）
- `sentCount`: 未提出者に送信した人数
- `skippedCount`: 提出済みでスキップした人数
- `totalUsers`: 登録者の合計人数

### 期待される動作
- **課題未提出**: リマインダーが届く
- **課題提出済み**: リマインダーが届かない（skippedCountに含まれる）
- **期間外**: "現在は課題期間外です" と返る

## 3. データベースで確認する方法

### SQL実行で確認
Supabase SQL Editorで以下を実行：

```sql
-- LINE登録状況を確認
SELECT
  line_user_id,
  email,
  display_name,
  reminder_enabled,
  last_reminded_at
FROM line_users
ORDER BY created_at DESC;

-- 課題提出状況を確認
SELECT
  email,
  line_user_id,
  day1_field1 IS NOT NULL AND day1_field1 != '' as day1_submitted,
  day2_field1 IS NOT NULL AND day2_field1 != '' as day2_submitted,
  day3_field1 IS NOT NULL AND day3_field1 != '' as day3_submitted,
  updated_at
FROM user_stories
WHERE email IS NOT NULL
ORDER BY updated_at DESC;

-- リマインダー送信状況を確認
SELECT
  lu.display_name,
  lu.email,
  lu.reminder_enabled,
  lu.last_reminded_at,
  us.day1_field1 IS NOT NULL as has_day1,
  us.day2_field1 IS NOT NULL as has_day2,
  us.day3_field1 IS NOT NULL as has_day3
FROM line_users lu
LEFT JOIN user_stories us ON us.email = lu.email
WHERE lu.reminder_enabled = true
ORDER BY lu.last_reminded_at DESC;
```

## 4. 本番環境での確認（cronジョブ）

毎日決まった時間にリマインダーを送信するには、以下のいずれかを設定：

### オプション1: Supabase Cron（推奨）
Supabaseの管理画面で pg_cron を設定

### オプション2: 外部Cronサービス
- GitHub Actions
- Vercel Cron
- cron-job.org

いずれも、毎日9時に以下のURLをPOSTで呼び出す：
```
https://YOUR_PROJECT.supabase.co/functions/v1/send-reminders
```

## トラブルシューティング

### リマインダーが届かない場合
1. `line_users`テーブルで`reminder_enabled = true`を確認
2. `email`が正しく登録されているか確認
3. `user_stories`テーブルに該当のemailが存在するか確認
4. 課題期間内かどうか確認（2026年1/17-1/24）

### メールアドレスが紐付かない場合
1. Webフォームで入力したメールアドレスとLINEで送信したメールアドレスが完全に一致しているか確認
2. スペースや大文字・小文字の違いがないか確認
