import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ステートの定義
type State = 'intro' | 'measuring' | 'analyzing' | 'result';
type TrainingState = 'COACH' | 'CLASH';

interface Props {
  onClose?: () => void;
  onComplete?: (metrics: any, feedback: string) => void;
  lineUserId?: string;
  brainType?: string;
}

export const HRVMeasurement: React.FC<Props> = ({ onClose, onComplete }) => {
  const [phase, setPhase] = useState<State>('intro');
  const [bpm, setBpm] = useState<number>(0);
  const [hrvScore, setHrvScore] = useState<number>(0);
  const [state, setState] = useState<TrainingState | null>(null);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [remainingTime, setRemainingTime] = useState(30);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  // 計測データ保持用
  const brightnessData = useRef<number[]>([]);
  const lastHeartBeat = useRef<number>(Date.now());
  const rrIntervals = useRef<number[]>([]);
  const recentBrightness = useRef<number[]>([]); // グラフ描画用

  // カメラの起動
  const startCamera = async () => {
    // ブラウザの互換性チェック
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("お使いのブラウザはカメラ機能をサポートしていません。Safari (iOS) または Chrome (Android) をお使いください。");
      return;
    }

    try {
      let stream;
      try {
        // まず背面カメラを試行
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
      } catch (e) {
        console.warn("背面カメラの取得に失敗、標準カメラで再試行します:", e);
        // 失敗したら任意のカメラを試行
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      setMediaStream(stream);
      setPhase('measuring');
    } catch (err: any) {
      console.error("カメラの起動に失敗しました:", err);

      const errorName = err.name || "UnknownError";
      const errorMessage = err.message || "No detail";

      let alertMsg = `カメラが起動できませんでした。\n(Error: ${errorName})\n\n`;

      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        alertMsg += "カメラの使用が許可されていません。\n端末の [設定] > [ブラウザ] > [カメラ] から許可をオンにしてください。";
      } else if (errorName === 'NotFoundError') {
        alertMsg += "カメラが見つかりませんでした。";
      } else if (errorName === 'NotReadableError') {
        alertMsg += "カメラが他のアプリで使用されているか、一時的なエラーです。ブラウザを再起動してみてください。";
      } else {
        alertMsg += `詳細: ${errorMessage}`;
      }
      alert(alertMsg);
    }
  };

  // ストリームがセットされ、かつ計測フェーズになったら動画に割り当てて解析開始
  useEffect(() => {
    if (phase === 'measuring' && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(e => console.error("再生エラー:", e));

        // フラッシュライト（トーチ）をオンにする
        const track = mediaStream.getVideoTracks()[0];
        if (track && track.getCapabilities) {
          const capabilities = track.getCapabilities() as any;
          if (capabilities.torch) {
            track.applyConstraints({
              advanced: [{ torch: true } as any]
            }).catch(e => console.warn("ライトの点灯に失敗しました:", e));
          }
        }

        startAnalysis();
      };
    }
  }, [phase, mediaStream]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (mediaStream) {
        // トーチをオフにするためにトラックを停止
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [mediaStream]);

  // グラフ描画
  const drawWaveform = () => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = recentBrightness.current;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;

    if (data.length > 1) {
      // データの正規化（最小・最大を見つけてスケーリング）
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;

      for (let i = 0; i < data.length; i++) {
        const x = (i / (data.length - 1)) * width;
        const normalizedY = (data[i] - min) / range;
        const y = height - (normalizedY * height * 0.8 + height * 0.1); // 上下10%の余白

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  // PPG解析（輝度変化の抽出）
  const startAnalysis = () => {
    const startTime = Date.now();
    const duration = 30000; // 30秒間計測

    const analyze = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // 映像からデータ取得
      ctx.drawImage(videoRef.current, 0, 0, 100, 100);
      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;

      // 赤色成分の平均輝度を算出
      let rSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
      }
      const avgR = rSum / (data.length / 4);

      // データを保存（グラフ用は直近100件）
      brightnessData.current.push(avgR);
      recentBrightness.current.push(avgR);
      if (recentBrightness.current.length > 100) {
        recentBrightness.current.shift();
      }

      // グラフ更新
      drawWaveform();

      // ピーク検出（簡易版）
      if (brightnessData.current.length > 10) {
        const last = brightnessData.current[brightnessData.current.length - 1];
        const prev = brightnessData.current[brightnessData.current.length - 2];
        if (prev > avgR && prev > brightnessData.current[brightnessData.current.length - 3]) {
          const now = Date.now();
          const interval = now - lastHeartBeat.current;
          if (interval > 400 && interval < 1500) { // 正常な心拍間隔（40BPM〜150BPM）
            rrIntervals.current.push(interval);
            lastHeartBeat.current = now;

            // リアルタイムBPM表示（直近3回の平均）
            if (rrIntervals.current.length >= 3) {
              const last3 = rrIntervals.current.slice(-3);
              const avgInterval = last3.reduce((a, b) => a + b, 0) / last3.length;
              setBpm(Math.round(60000 / avgInterval));
            }
          }
        }
      }

      // 進捗更新
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(currentProgress);
      setRemainingTime(Math.ceil((duration - elapsed) / 1000));

      if (elapsed < duration) {
        requestRef.current = requestAnimationFrame(analyze);
      } else {
        stopCamera();
        processResults();
      }
    };
    requestRef.current = requestAnimationFrame(analyze);
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  // 結果の解析（COACH/CLASH判定）
  const processResults = async () => {
    setPhase('analyzing');

    // RMSSDの算出
    if (rrIntervals.current.length < 5) {
      alert("計測できませんでした。ライトが点灯している状態で、カメラに指をしっかり当てて再試行してください。");
      setPhase('intro');
      return;
    }

    const diffs = [];
    for (let i = 0; i < rrIntervals.current.length - 1; i++) {
      diffs.push(Math.pow(rrIntervals.current[i + 1] - rrIntervals.current[i], 2));
    }
    const rmssd = Math.sqrt(diffs.reduce((a, b) => a + b, 0) / diffs.length);

    const calculatedHrvScore = Math.round(rmssd);
    const calculatedBpm = Math.round(60000 / (rrIntervals.current.reduce((a, b) => a + b, 0) / rrIntervals.current.length));

    setHrvScore(calculatedHrvScore);
    setBpm(calculatedBpm);

    // COACH/CLASH判定（暫定基準: RMSSD 40以上をCOACHとする）
    const isCoach = rmssd >= 40;
    const newState = isCoach ? 'COACH' : 'CLASH';
    setState(newState);

    const feedbackText = isCoach
      ? "完璧な『凪』の状態です。無重力フライトの準備が整いました。あなたの直感に従って、未来を選択してください。"
      : "脳内渋滞（重力）を検知しました。マモルが安全を守るために必死にブレーキを踏んでいます。まずは5分間、Dream Makerに任せて深呼吸しましょう。";
    setFeedback(feedbackText);

    if (onComplete) {
      onComplete({ hrv: calculatedHrvScore, bpm: calculatedBpm, state: newState }, feedbackText);
    }

    setPhase('result');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* メインコンテナ - 状況に応じてスタイル変更 */}
      <div className={`w-full h-full sm:h-auto sm:max-w-md relative overflow-hidden flex flex-col items-center justify-center transition-all duration-500
        ${phase === 'measuring' ? 'bg-gradient-to-br from-emerald-500 to-teal-700' : 'bg-sage-50 sm:rounded-3xl p-6'}`}>

        {/* 閉じるボタン（計測中以外） */}
        {onClose && phase !== 'measuring' && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 text-sage-400 hover:text-sage-600 p-2 bg-white/50 rounded-full"
            aria-label="閉じる"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

        {/* --- 導入画面 --- */}
        {phase === 'intro' && (
          <div className="text-center w-full max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.28 3.6-2.34 3.6-4.44C22.6 7.16 20.8 5.5 18.6 5.5c-1.4 0-2.52.8-3.09 1.94-.57-1.14-1.69-1.94-3.09-1.94-2.2 0-4 1.66-4 4.06 0 2.1 2.11 3.16 3.6 4.44L12 21.35l7-7.35z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-sage-800">指先チェック</h2>
            <p className="mb-8 text-sage-600 leading-relaxed">
              カメラに指先をそっと当てて、<br />
              あなたの心の状態（HRV）を<br />
              30秒間計測します。
            </p>
            <button
              onClick={startCamera}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2"
            >
              計測を開始する
            </button>
            <p className="mt-4 text-xs text-sage-400">※ カメラとライトを使用します</p>
          </div>
        )}

        {/* --- 計測中画面 (リファレンス風) --- */}
        {phase === 'measuring' && (
          <div className="flex flex-col items-center justify-between h-full w-full py-20 px-6 animate-in fade-in duration-700">

            {/* 隠しビデオ要素（解析用） */}
            <video ref={videoRef} autoPlay playsInline className="absolute opacity-0 pointer-events-none w-1 h-1" />
            <canvas ref={canvasRef} width="100" height="100" className="hidden" />

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-widest">計測しています...</h2>
              <p className="text-white/80 text-sm">残り {remainingTime} 秒</p>
            </div>

            {/* プログレスリング & ハート */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* 背景リング */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="120" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
                <circle cx="128" cy="128" r="120" stroke="white" strokeWidth="4" fill="none"
                  strokeDasharray={2 * Math.PI * 120}
                  strokeDashoffset={2 * Math.PI * 120 * ((100 - progress) / 100)}
                  className="transition-all duration-100 ease-linear"
                />
              </svg>

              {/* 脈動するハート */}
              <div className="animate-pulse duration-1000">
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="white" stroke="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>

              <div className="absolute top-1/2 mt-16 text-white font-bold text-xl">
                {bpm > 0 ? `${bpm} bpm` : '...'}
              </div>
            </div>

            {/* リアルタイム波形グラフ */}
            <div className="w-full h-32 relative">
              <canvas ref={waveformCanvasRef} width="300" height="100" className="w-full h-full" />
              {/* 区切り線 */}
              <div className="absolute top-0 left-0 w-full h-px bg-white/20"></div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-white/20"></div>
              <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 border-t border-dashed border-white/20"></div>
            </div>

            <div className="text-white/90 text-sm text-center">
              おはようございます、<br />
              調子はいかがでしょうか😌
            </div>
          </div>
        )}

        {/* --- 解析中画面 --- */}
        {phase === 'analyzing' && (
          <div className="text-center py-10 w-full max-w-xs">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="text-xl font-bold text-sage-800">解析準備中...</div>
          </div>
        )}

        {/* --- 結果画面 --- */}
        {phase === 'result' && (
          <div className="text-center w-full max-w-xs animate-in zoom-in duration-500">
            <div className="mb-2">
              <span className="text-sage-500 text-sm font-bold tracking-widest">自律神経のスコア</span>
            </div>

            {/* スコア表示 */}
            <div className="relative mb-8">
              <div className="text-8xl font-serif text-sage-900 leading-none">{hrvScore}</div>
              {state === 'COACH' ? (
                <div className="text-emerald-600 font-bold flex items-center justify-center gap-1 mt-2">
                  <span>🥰</span> 絶好調ですね
                </div>
              ) : (
                <div className="text-orange-600 font-bold flex items-center justify-center gap-1 mt-2">
                  <span>🤔</span> 少しお疲れのようです
                </div>
              )}
            </div>

            {/* 詳細カード */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage-100 mb-6 text-left">
              <div className="flex justify-between items-center mb-4 border-b border-sage-50 pb-4">
                <div>
                  <div className="text-xs text-sage-400">心拍数</div>
                  <div className="text-2xl font-bold text-sage-800">{bpm} <span className="text-sm font-normal">bpm</span></div>
                </div>
                <div className="h-8 w-px bg-sage-100"></div>
                <div>
                  <div className="text-xs text-sage-400">自律神経バランス</div>
                  <div className="text-2xl font-bold text-sage-800">{state}</div>
                </div>
              </div>
              <p className="text-sage-700 text-sm leading-relaxed">
                {feedback}
              </p>
            </div>

            <button
              onClick={() => setPhase('intro')}
              className="text-sage-500 font-bold text-sm hover:text-sage-700 transition-colors"
            >
              もう一度測定を始める
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
