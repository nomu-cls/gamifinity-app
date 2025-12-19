# Googleスプレッドシート連携設定ガイド

このアプリケーションは、ユーザーが提出したデータをGoogleスプレッドシートに自動的に送信できます。

## 必要なもの

- Googleアカウント
- Googleスプレッドシート
- Google Apps Script（無料）

## セットアップ手順

### ステップ1: Googleスプレッドシートを作成

1. [Google Sheets](https://sheets.google.com)を開く
2. 新しいスプレッドシートを作成
3. スプレッドシートの名前を「My Story 2026」などわかりやすい名前に変更

### ステップ2: シートを作成

1. スプレッドシートに3つのシートを作成：
   - シート名: **Day1**
   - シート名: **Day2**
   - シート名: **Day3**

2. 各シートの1行目にヘッダーを追加：
   - **Day1シート**:
     ```
     A列: タイムスタンプ | B列: メールアドレス | C列: 子供の頃に好きなこと | D列: 大人の今も好きなこと | E列: セミナーの感想
     ```
   - **Day2シート**:
     ```
     A列: タイムスタンプ | B列: メールアドレス | C列: 頑張らなくても出来ること | D列: 褒めたいところ | E列: 好きと得意が合わさること
     ```
   - **Day3シート**:
     ```
     A列: タイムスタンプ | B列: メールアドレス | C列: 叶えたい夢 | D列: 絵本の可能性 | E列: 一番の気づき | F列: 続けるための環境 | G列: 講座の評価 | H列: 評価の理由
     ```

### ステップ3: Google Apps Scriptを作成

1. スプレッドシートで「拡張機能」→「Apps Script」をクリック
2. 既存のコードを削除し、以下のコードを貼り付け：

```javascript
function doPost(e) {
  try {
    // POSTデータを解析
    var data = JSON.parse(e.postData.contents);
    var day = data.day;

    // スプレッドシートを取得
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Dayに応じてシート名を決定
    var sheetName = 'Day' + day;
    var sheet = spreadsheet.getSheetByName(sheetName);

    // シートが存在しない場合はエラー
    if (!sheet) {
      throw new Error('シート "' + sheetName + '" が見つかりません。Day1、Day2、Day3という名前のシートを作成してください。');
    }

    // データを行として追加
    var row = [
      data.timestamp || new Date().toISOString(),
      data.email || ''
    ];

    // Day1の場合
    if (day === 1) {
      row.push(
        data.field1 || '',
        data.field2 || '',
        data.field3 || ''
      );
    }
    // Day2の場合
    else if (day === 2) {
      row.push(
        data.field1 || '',
        data.field2 || '',
        data.field3 || ''
      );
    }
    // Day3の場合
    else if (day === 3) {
      row.push(
        data.field1 || '',
        data.field2 || '',
        data.field3 || '',
        data.field4 || '',
        data.field5 || '',
        data.field6 || ''
      );
    }

    sheet.appendRow(row);

    // 成功レスポンス
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'データを' + sheetName + 'に保存しました'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // エラーレスポンス
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### ステップ4: ウェブアプリとしてデプロイ

1. 右上の「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」で「ウェブアプリ」を選択
3. 設定：
   - 説明: 任意（例：「My Story 2026 データ収集」）
   - 次のユーザーとして実行: **自分**
   - アクセスできるユーザー: **全員**
4. 「デプロイ」をクリック
5. 権限の承認を求められたら承認する
6. **ウェブアプリのURL**をコピー（重要！）

URLは次のような形式です：
```
https://script.google.com/macros/s/AKfycby.../exec
```

### ステップ5: アプリケーションに設定

1. アプリのホーム画面の一番下までスクロール
2. 薄いグレーの「Googleスプレッドシート連携設定」ボタンをクリック
3. コピーしたウェブアプリのURLを貼り付け
4. OKをクリック

## 動作確認

1. アプリで任意のChapterを開く
2. メールアドレスを入力
3. 必要事項を記入して「想いを綴る」ボタンをクリック
4. Googleスプレッドシートを確認し、データが追加されていることを確認

## トラブルシューティング

### データが送信されない場合

1. **URLが正しいか確認**
   - URLは `https://script.google.com/macros/s/` で始まる
   - URLの末尾は `/exec` になっている

2. **Apps Scriptの権限を確認**
   - 「次のユーザーとして実行」が「自分」になっている
   - 「アクセスできるユーザー」が「全員」になっている

3. **スプレッドシートの権限を確認**
   - Apps Scriptを実行するアカウントがスプレッドシートの編集権限を持っている

4. **ブラウザのコンソールでエラーを確認**
   - F12キーを押して開発者ツールを開く
   - Console タブでエラーメッセージを確認

### Apps Scriptのログを確認する方法

1. Apps Scriptエディタを開く
2. 左側のメニューから「実行数」をクリック
3. 最近の実行履歴とエラーを確認できます

## セキュリティに関する注意

- このウェブアプリのURLは公開されるため、誰でもデータを送信できます
- スパム対策が必要な場合は、Apps Scriptに追加の検証ロジックを実装してください
- 機密情報を送信する場合は、追加のセキュリティ対策を検討してください

## データの形式

送信されるデータの例：

```json
{
  "email": "user@example.com",
  "timestamp": "2025-12-18T12:34:56.789Z",
  "day": 1,
  "field1": "回答内容1",
  "field2": "回答内容2",
  "field3": "回答内容3"
}
```

各Dayで送信されるフィールドは異なる場合があります。

---

## 特典URLの連携機能

### ステップ1: 特典シートを作成

スプレッドシートに「特典」という名前のシートを追加し、以下の形式でデータを入力：

| A列（特典） | B列（特典ページ） |
|------------|------------------|
| 特典1 | https://example.com/reward1 |
| 特典2 | https://example.com/reward2 |
| 特典3 | https://example.com/reward3 |
| パーフェクト賞 | https://example.com/perfect |

### ステップ2: Apps Scriptにコードを追加

既存のApps Scriptに以下の`doGet`関数を追加してください：

```javascript
function doGet(e) {
  try {
    var action = e.parameter.action;

    if (action === 'getRewards') {
      var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = spreadsheet.getSheetByName('特典');

      if (!sheet) {
        throw new Error('シート "特典" が見つかりません');
      }

      var data = sheet.getDataRange().getValues();
      var rewards = {};

      for (var i = 1; i < data.length; i++) {
        var name = data[i][0];
        var url = data[i][1];

        if (name === '特典1') rewards.reward1 = url;
        else if (name === '特典2') rewards.reward2 = url;
        else if (name === '特典3') rewards.reward3 = url;
        else if (name === 'パーフェクト賞') rewards.perfectReward = url;
      }

      return ContentService
        .createTextOutput(JSON.stringify(rewards))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### ステップ3: 再デプロイ

コードを追加後、Apps Scriptを再デプロイしてください：

1. 「デプロイ」→「デプロイを管理」
2. 既存のデプロイを編集するか、新しいデプロイを作成
3. 「デプロイ」をクリック

### 機能説明

- 課題を提出すると、自動的にLINEで特典URLが送信されます
- スタンプカード画面で獲得した特典を確認できます
- 特典1〜3はDay1〜3の課題完了時に、パーフェクト賞は全課題完了時に送信されます
