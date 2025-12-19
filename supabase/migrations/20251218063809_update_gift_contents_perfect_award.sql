/*
  # パーフェクト特典の内容を更新
  
  1. 変更内容
    - ギフトコンテンツのタイトルとメッセージを更新
    - パーフェクト賞の情報を反映
    - プレゼント画像のURLを追加する準備（image_urlカラムを追加）
  
  2. 新しいカラム
    - `image_url` (text) - プレゼント画像のURL（オプション）
*/

-- image_urlカラムを追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_contents' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE gift_contents ADD COLUMN image_url text;
  END IF;
END $$;

-- 既存のギフトコンテンツを更新
UPDATE gift_contents
SET 
  title = '【パーフェクト賞】シークレット特典',
  message = '富と豊かさが巡る宇宙の法則

新築を購入後、家のローン5000万以上を背負い…たった2年で無料で住めることになった奇跡の秘話動画

（非売品／期間限定動画）',
  image_url = 'https://images.pexels.com/photos/6393342/pexels-photo-6393342.jpeg?auto=compress&cs=tinysrgb&w=800',
  updated_at = now()
WHERE is_active = true;
