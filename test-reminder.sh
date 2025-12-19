#!/bin/bash

# リマインダー機能のテストスクリプト

# 環境変数を読み込み
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "エラー: .envファイルが見つかりません"
  exit 1
fi

echo "========================================="
echo "リマインダー機能テスト"
echo "========================================="
echo ""

# リマインダーを実行
echo "📤 リマインダーを送信しています..."
echo ""

RESPONSE=$(curl -s -X POST \
  "${VITE_SUPABASE_URL}/functions/v1/send-reminders" \
  -H "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json")

echo "📥 レスポンス:"
echo "$RESPONSE" | jq '.'
echo ""

# 結果を解析
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
SENT_COUNT=$(echo "$RESPONSE" | jq -r '.sentCount')
SKIPPED_COUNT=$(echo "$RESPONSE" | jq -r '.skippedCount')
TOTAL_USERS=$(echo "$RESPONSE" | jq -r '.totalUsers')
CURRENT_DAY=$(echo "$RESPONSE" | jq -r '.currentDay')
MESSAGE=$(echo "$RESPONSE" | jq -r '.message')

echo "========================================="
echo "結果サマリー"
echo "========================================="

if [ "$SUCCESS" = "true" ]; then
  echo "✅ 実行成功"

  if [ "$MESSAGE" != "null" ]; then
    echo "📝 メッセージ: $MESSAGE"
  else
    echo "📊 現在の課題: Day $CURRENT_DAY"
    echo "📤 送信数: $SENT_COUNT 人"
    echo "⏭️ スキップ: $SKIPPED_COUNT 人（提出済み）"
    echo "👥 登録者数: $TOTAL_USERS 人"
    echo ""

    if [ "$SENT_COUNT" = "0" ] && [ "$SKIPPED_COUNT" = "0" ]; then
      echo "ℹ️ 送信対象者がいませんでした"
      echo "   - リマインダー設定時間外の可能性があります"
      echo "   - または登録者がいません"
    elif [ "$SENT_COUNT" = "0" ]; then
      echo "🎉 全員が課題を提出済みです！"
    else
      echo "✉️ $SENT_COUNT 人に未提出リマインダーを送信しました"
    fi
  fi
else
  echo "❌ 実行失敗"
fi

echo "========================================="
