# アーカイブ動画管理のセットアップ

このガイドでは、Googleスプレッドシートを使用してアーカイブ動画のURLと視聴期限を管理する方法を説明します。

## 1. Googleスプレッドシートの作成

1. 新しいGoogleスプレッドシートを作成します
2. シート名を「動画管理」などに変更します
3. 以下の形式でデータを入力します：

| Day | アーカイブURL | 視聴期限 |
|-----|--------------|---------|
| Day1 | https://youtube.com/... | 2026/11/18 |
| Day2 | https://youtube.com/... | 2026/11/19 |
| Day3 | https://youtube.com/... | 2026/11/20 |

**注意事項：**
- A列の1行目：`Day`
- B列の1行目：`アーカイブURL`
- C列の1行目：`視聴期限`
- 2行目以降：各Dayのデータ
- Day列の値は正確に `Day1`、`Day2`、`Day3` と入力してください
- 視聴期限は `YYYY/MM/DD` 形式で入力してください

## 2. Google Apps Scriptの設定

### 2.1 スクリプトエディタを開く

1. スプレッドシートで「拡張機能」→「Apps Script」を選択
2. 既存のコードをすべて削除します

### 2.2 スクリプトコードを貼り付け

以下のコードをコピーして貼り付けます：

```javascript
function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('動画管理');
  const data = sheet.getDataRange().getValues();

  // Skip header row
  const rows = data.slice(1);

  const result = {};

  rows.forEach(row => {
    const day = row[0]; // Day列
    const url = row[1]; // アーカイブURL列
    const expiresAt = row[2]; // 視聴期限列

    if (day && url) {
      // Parse day number (e.g., "Day1" -> "day1")
      const dayKey = day.toLowerCase();

      // Format expiration date to ISO string
      let expiresAtISO = null;
      if (expiresAt) {
        try {
          const date = new Date(expiresAt);
          expiresAtISO = date.toISOString();
        } catch (e) {
          console.error('Invalid date format:', expiresAt);
        }
      }

      result[dayKey] = {
        url: url,
        expiresAt: expiresAtISO
      };
    }
  });

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 2.3 デプロイ

1. 「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」で⚙️アイコンをクリックし、「ウェブアプリ」を選択
3. 以下の設定を行います：
   - **説明**: 「アーカイブ動画API」（任意）
   - **次のユーザーとして実行**: 「自分」
   - **アクセスできるユーザー**: 「全員」
4. 「デプロイ」をクリック
5. 権限の承認を求められたら、承認します
6. **ウェブアプリのURL**をコピーします（例: `https://script.google.com/macros/s/xxxxx/exec`）

## 3. アプリケーションでの設定

1. アプリケーションの管理画面（⚙️アイコン）を開きます
2. 「動画アーカイブ管理」セクションに移動
3. 先ほどコピーしたウェブアプリのURLを「アーカイブシートURL」フィールドに貼り付けます
4. 「動画データを同期」ボタンをクリック
5. 「動画データを同期しました」というメッセージが表示されれば成功です

## 4. 動画URLの更新

アーカイブ動画のURLや視聴期限を変更したい場合：

1. Googleスプレッドシートでデータを更新
2. アプリケーションの管理画面で「動画データを同期」ボタンをクリック
3. すべてのユーザーに最新のデータが反映されます

## トラブルシューティング

### エラー: 「同期中にエラーが発生しました」

- Google Apps ScriptのURLが正しいか確認してください
- スプレッドシートの共有設定を確認してください（「全員」にアクセス権限）
- シート名が「動画管理」になっているか確認してください

### アーカイブボタンが表示されない

- 該当のDayの課題が提出済みか確認してください
- 視聴期限が過ぎていないか確認してください
- ブラウザをリロードしてみてください

### 視聴期限の形式

視聴期限は以下の形式で入力できます：
- `2026/11/18`
- `2026-11-18`
- `11/18/2026`

スプレッドシートが日付として認識できる形式であれば問題ありません。
