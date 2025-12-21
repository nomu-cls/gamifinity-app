-- =====================================================
-- Fix Brain Type Diagnosis Data Structure
-- =====================================================
-- Run this in DreamMaker's Supabase SQL Editor

-- First, delete the incorrectly formatted data
DELETE FROM diagnostics WHERE theme = 'brain_type';

-- Insert with correct structure matching the component's expected format
INSERT INTO diagnostics (theme, title, description, questions, is_active, display_order) 
VALUES (
  'brain_type',
  '脳タイプ診断',
  'あなたの脳タイプを判定するための質問です',
  '[
    {
      "question_id": "q1",
      "question_text": "新しいプロジェクトを始めるとき、あなたはどのようにアプローチしますか？",
      "options": [
        {"option_id": "q1_a", "option_text": "詳細な計画を立ててから始める", "brain_type": "left_3d", "score": 1},
        {"option_id": "q1_b", "option_text": "全体像をイメージしてから始める", "brain_type": "right_3d", "score": 1},
        {"option_id": "q1_c", "option_text": "手順を一つずつ確認しながら進める", "brain_type": "left_2d", "score": 1},
        {"option_id": "q1_d", "option_text": "直感的に感じたことから始める", "brain_type": "right_2d", "score": 1}
      ]
    },
    {
      "question_id": "q2",
      "question_text": "問題を解決するとき、どのような方法を好みますか？",
      "options": [
        {"option_id": "q2_a", "option_text": "論理的に分析して解決策を導く", "brain_type": "left_3d", "score": 1},
        {"option_id": "q2_b", "option_text": "創造的なアイデアで解決する", "brain_type": "right_3d", "score": 1},
        {"option_id": "q2_c", "option_text": "過去の経験やルールに基づいて解決する", "brain_type": "left_2d", "score": 1},
        {"option_id": "q2_d", "option_text": "感覚や直感を信じて解決する", "brain_type": "right_2d", "score": 1}
      ]
    },
    {
      "question_id": "q3",
      "question_text": "情報を整理するとき、どの方法が自然ですか？",
      "options": [
        {"option_id": "q3_a", "option_text": "カテゴリやフォルダで体系的に整理", "brain_type": "left_3d", "score": 1},
        {"option_id": "q3_b", "option_text": "マインドマップやビジュアルで整理", "brain_type": "right_3d", "score": 1},
        {"option_id": "q3_c", "option_text": "リストやチェックリストで整理", "brain_type": "left_2d", "score": 1},
        {"option_id": "q3_d", "option_text": "記憶や感覚で大まかに整理", "brain_type": "right_2d", "score": 1}
      ]
    },
    {
      "question_id": "q4",
      "question_text": "チームで働くとき、あなたの役割は？",
      "options": [
        {"option_id": "q4_a", "option_text": "戦略を立てて方向性を示す", "brain_type": "left_3d", "score": 1},
        {"option_id": "q4_b", "option_text": "ビジョンを描いてみんなを巻き込む", "brain_type": "right_3d", "score": 1},
        {"option_id": "q4_c", "option_text": "進捗を管理し細かくサポートする", "brain_type": "left_2d", "score": 1},
        {"option_id": "q4_d", "option_text": "チームの雰囲気を良くし調和を保つ", "brain_type": "right_2d", "score": 1}
      ]
    },
    {
      "question_id": "q5",
      "question_text": "ストレスを感じたとき、どのように対処しますか？",
      "options": [
        {"option_id": "q5_a", "option_text": "原因を分析し解決策を考える", "brain_type": "left_3d", "score": 1},
        {"option_id": "q5_b", "option_text": "新しい視点や可能性を模索する", "brain_type": "right_3d", "score": 1},
        {"option_id": "q5_c", "option_text": "ルーティンや習慣に戻る", "brain_type": "left_2d", "score": 1},
        {"option_id": "q5_d", "option_text": "感情を表現したり誰かに話す", "brain_type": "right_2d", "score": 1}
      ]
    }
  ]'::jsonb,
  true,
  1
);

-- =====================================================
-- Done! Correctly formatted diagnosis data added
-- =====================================================
