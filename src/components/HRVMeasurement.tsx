import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ステートの定義
type State = 'intro' | 'check' | 'measuring' | 'analyzing' | 'result';
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

  // チェックフェーズ用
  const [isSignalGood, setIsSignalGood] = useState(false);
  const [readyCountdown, setReadyCountdown] = useState<number | null>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  // 計測データ保持用
  const brightnessData = useRef<number[]>([]); // スムージング後のデータを入れる
  const lastHeartBeat = useRef<number>(Date.now());
  const rrIntervals = useRef<number[]>([]);
  const goodSignalStartTime = useRef<number | null>(null);

  // カメラを起動
  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("お使いのブラウザはカメラ機能をサポートしていません。");
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
      } catch (e) {
        console.warn("背面カメラ失敗、標準カメラで試行:", e);
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      setMediaStream(stream);
      setPhase('check'); // まずチェックフェーズへ
    } catch (err: any) {
      console.error("カメラ起動失敗:", err);
      alert("カメラが起動できませんでした。\n" + err.name);
    }
  };

  // ストリーム設定
  useEffect(() => {
    if ((phase === 'check' || phase === 'measuring') && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(e => console.error("再生エラー:", e));

        // トーチ点灯
        const track = mediaStream.getVideoTracks()[0];
        if (track && track.getCapabilities) {
          const capabilities = track.getCapabilities() as any;
          if (capabilities.torch) {
            track.applyConstraints({ advanced: [{ torch: true } as any] })
              .catch(e => console.warn("ライト点灯失敗:", e));
          }
        }

        if (phase === 'check') startCheckSignal();
        if (phase === 'measuring') startAnalysis();
      };
    }
  }, [phase, mediaStream]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      // mediaStreamは意図的に維持（遷移でカメラを切らないため）
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // フェーズ変更時の処理
  useEffect(() => {
    if (phase === 'measuring') {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startAnalysis();
    }
  }, [phase]);

  // 信号チェック（準備フェーズ）
  const startCheckSignal = () => {
    const check = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0, 100, 100);
      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;

      let rSum = 0, gSum = 0, bSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
      }
      const pixels = data.length / 4;
      const avgR = rSum / pixels;
      const avgG = gSum / pixels;
      const avgB = bSum / pixels;

      // 赤色が支配的か判定 (閾値を緩和: 100->60, 1.5倍->1.2倍)
      // 暗すぎる場合(avgR < 40)は指当ててないかライトなしと判定
      const isBrightEnough = avgR > 40;
      const isRed = isBrightEnough && avgR > avgG * 1.2 && avgR > avgB * 1.2;

      setIsSignalGood(isRed);

      if (isRed) {
        if (!goodSignalStartTime.current) goodSignalStartTime.current = Date.now();
        const duration = Date.now() - goodSignalStartTime.current;

        const count = 3 - Math.floor(duration / 1000);
        setReadyCountdown(count > 0 ? count : 0);

        if (duration > 3000) {
          setPhase('measuring');
          return;
        }
      } else {
        goodSignalStartTime.current = null;
        setReadyCountdown(null);
      }

      if (phase === 'check') {
        requestRef.current = requestAnimationFrame(check);
      }
    };
    requestRef.current = requestAnimationFrame(check);
  };

  // グラフ描画
  const drawWaveform = () => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    // 最新360フレーム（約6秒分）を表示＝ゆったり
    const dataLen = 360;
    const data = brightnessData.current.slice(-dataLen);

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (data.length > 5) {
      // オートゲイン（最小・最大に合わせてスケーリング）
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;

      const points = data.map((val, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - ((val - min) / range * height * 0.8 + height * 0.1) // 80%領域
      }));

      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.stroke();
    }
  };

  // 解析実行
  const startAnalysis = () => {
    // リセット
    brightnessData.current = [];
    rrIntervals.current = [];
    lastHeartBeat.current = Date.now();
    let rawHistory: number[] = [];

    const startTime = Date.now();
    const duration = 30000;

    const analyze = () => {
      // 途中でコンポーネントがアンマウントされていたら終了
      if (!videoRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0, 100, 100);
      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;

      // 輝度取得 (Green成分も使うと感度が良い場合があるが、まずはRed)
      let rSum = 0;
      for (let i = 0; i < data.length; i += 4) rSum += data[i];
      const avgR = rSum / (data.length / 4);

      // スムージング処理 (移動平均 7フレーム)
      rawHistory.push(avgR);
      if (rawHistory.length > 7) rawHistory.shift();
      const smoothedVal = rawHistory.reduce((a, b) => a + b, 0) / rawHistory.length;

      brightnessData.current.push(smoothedVal);
      if (brightnessData.current.length > 1000) brightnessData.current.shift();

      drawWaveform();

      // ピーク検出（再調整版: ウインドウを少し狭めて検出漏れを防ぐ）
      if (brightnessData.current.length > 15) {
        // 5フレーム前を判定基準にする (以前は8)
        const currentIdx = brightnessData.current.length - 6;
        const val = brightnessData.current[currentIdx];

        let isPeak = true;
        // 前後4フレームと比較（±0.06秒程度）
        for (let i = 1; i <= 4; i++) {
          if (val <= brightnessData.current[currentIdx - i] || val <= brightnessData.current[currentIdx + i]) {
            isPeak = false;
            break;
          }
        }

        if (isPeak) {
          const now = Date.now();
          const interval = now - lastHeartBeat.current;

          // BPM 40-180 (333ms - 1500ms)
          // BPM 37-200 (300ms - 1600ms)
          if (interval > 300 && interval < 1600) {
            // 厳しいフィルタを全撤廃。範囲内ならすべて採用する
            rrIntervals.current.push(interval);
            lastHeartBeat.current = now;

            // BPM表示 (直近3回の平均)
            if (rrIntervals.current.length >= 2) {
              const last3 = rrIntervals.current.slice(-3);
              const avgInterval = last3.reduce((a, b) => a + b, 0) / last3.length;
              setBpm(Math.round(60000 / avgInterval));
            }
          }
          // 時間が空きすぎた場合はリセット
          if (interval > 1600) {
            lastHeartBeat.current = now;
          }
        }
      }

      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / duration) * 100, 100));
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
  };

  const processResults = async () => {
    setPhase('analyzing');
    if (rrIntervals.current.length < 5) {
      alert("計測データが不足しています。\nもう一度、リラックスして指を当ててください。");
      setPhase('intro');
      return;
    }

    // RMSSD計算
    const diffs = [];
    for (let i = 0; i < rrIntervals.current.length - 1; i++) {
      diffs.push(Math.pow(rrIntervals.current[i + 1] - rrIntervals.current[i], 2));
    }
    const rmssd = Math.sqrt(diffs.reduce((a, b) => a + b, 0) / diffs.length);
    const calculatedHrvScore = Math.min(Math.round(rmssd), 100);
    const calculatedBpm = Math.round(60000 / (rrIntervals.current.reduce((a, b) => a + b, 0) / rrIntervals.current.length));

    setHrvScore(calculatedHrvScore);
    setBpm(calculatedBpm);

    const isCoach = rmssd >= 40;
    const newState = isCoach ? 'COACH' : 'CLASH';
    setState(newState);

    const feedbackText = isCoach
      ? "完璧な『凪』の状態です。無重力フライトの準備が整いました。あなたの直感に従って、未来を選択してください。"
      : "脳内渋滞（重力）を検知しました。マモルが安全を守るために必死にブレーキを踏んでいます。まずは5分間、Dream Makerに任せて深呼吸しましょう。";
    setFeedback(feedbackText);
    if (onComplete) onComplete({ hrv: calculatedHrvScore, bpm: calculatedBpm, state: newState }, feedbackText);
    setPhase('result');
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return "おはようございます、";
    if (h >= 11 && h < 18) return "こんにちは、";
    return "こんばんは、";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className={`w-full h-full sm:h-auto sm:max-w-md relative overflow-hidden flex flex-col items-center justify-center transition-all duration-500
        ${(phase === 'measuring' || phase === 'check') ? 'bg-gradient-to-br from-emerald-500 to-teal-700' : 'bg-sage-50 sm:rounded-3xl p-6'}`}>

        {onClose && phase !== 'measuring' && (
          <button onClick={onClose} className="absolute top-6 right-6 z-10 text-sage-400 hover:text-sage-600 p-2 bg-white/50 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
              カメラとライトを使って<br />
              あなたのステートを測定します。
            </p>
            <button
              onClick={startCamera}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2"
            >
              計測を始める
            </button>
            <p className="mt-4 text-xs text-sage-400">※ カメラの使用を許可してください</p>
          </div>
        )}

        {/* --- チェック（準備）画面 --- */}
        {phase === 'check' && (
          <div className="flex flex-col items-center justify-center h-full w-full py-10 px-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold text-white mb-2">準備しましょう</h2>
            <p className="text-white/80 text-sm mb-12 text-center leading-relaxed">
              下図のように、カメラが<br />赤くなるよう指で覆ってください
            </p>

            <div className="flex justify-center gap-8 mb-16">
              <div className="flex flex-col items-center gap-3">
                <div className={`relative w-24 h-24 rounded-full overflow-hidden border-4 shadow-xl transition-all duration-300 ${isSignalGood ? 'border-emerald-400 scale-105' : 'border-white/50'}`}>
                  <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <span className="text-white text-xs font-bold tracking-wider">カメラ映像</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-4 border-white/50 shadow-xl"></div>
                <span className="text-white text-xs font-bold tracking-wider">見本</span>
              </div>
            </div>

            {/* 状態表示 */}
            <div className="h-24 flex items-center justify-center w-full">
              {isSignalGood ? (
                <div className="text-center animate-pulse bg-emerald-500/20 px-8 py-4 rounded-2xl backdrop-blur-sm border border-emerald-500/30">
                  <div className="text-4xl font-black text-white mb-1">OK!</div>
                  <div className="text-white font-bold">{readyCountdown}秒後にスタート</div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="text-white/80 text-sm bg-white/10 px-6 py-3 rounded-full animate-bounce">
                    ☝️ カメラ全体を指で覆ってください
                  </div>
                  <p className="text-white/50 text-xs">
                    (画面が赤くなるように位置を調整)
                  </p>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} width="100" height="100" className="hidden" />
          </div>
        )}

        {/* --- 計測中画面 --- */}
        {phase === 'measuring' && (
          <div className="flex flex-col items-center justify-between h-full w-full py-16 px-6 animate-in fade-in duration-700">
            {/* プレビュー (小さく表示) */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 bg-black mb-4 shadow-lg">
              <video ref={videoRef} autoPlay playsInline className="absolute w-full h-full object-cover opacity-80" />
            </div>

            <div className="text-center space-y-1 mb-6">
              <h2 className="text-xl font-bold text-white tracking-widest">{phase === 'measuring' ? "計測中..." : "準備中..."}</h2>
              <p className="text-white/60 text-xs">残り {remainingTime} 秒</p>
            </div>

            {/* プログレスリング & ハート */}
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
                <circle cx="96" cy="96" r="88" stroke="white" strokeWidth="3" fill="none"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * ((100 - progress) / 100)}
                  className="transition-all duration-100 ease-linear"
                />
              </svg>
              <div className="animate-pulse duration-1000">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
              <div className="absolute top-1/2 mt-14 text-white font-bold text-xl">
                {bpm > 0 ? bpm : '--'} <span className="text-xs font-normal">bpm</span>
              </div>
            </div>

            <div className="w-full h-24 relative mb-4">
              <canvas ref={waveformCanvasRef} width="300" height="100" className="w-full h-full" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-white/20"></div>
            </div>

            <div className="text-white/90 text-sm text-center font-medium">
              {getGreeting()}<br />
              調子はいかがでしょうか😌
            </div>

            {/* 解析用隠しキャンバス (これがないとループが止まる) */}
            <canvas ref={canvasRef} width="100" height="100" className="hidden" />
          </div>
        )}

        {/* --- 結果画面 --- */}
        {(phase === 'analyzing' || phase === 'result') && (
          <div className={`w-full h-full flex flex-col items-center justify-center bg-sage-50 sm:rounded-3xl p-6 ${phase === 'analyzing' ? '' : 'animate-in zoom-in duration-500'}`}>
            {phase === 'analyzing' ? (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <div className="text-xl font-bold text-sage-800">解析中...</div>
              </div>
            ) : (
              <div className="text-center w-full max-w-xs">
                <div className="mb-2">
                  <span className="text-sage-500 text-sm font-bold tracking-widest">自律神経のスコア</span>
                </div>
                <div className="relative mb-6">
                  <div className="text-8xl font-serif text-sage-900 leading-none">{hrvScore}</div>
                  <div className={`font-bold flex items-center justify-center gap-1 mt-2 ${state === 'COACH' ? 'text-emerald-600' : 'text-orange-600'}`}>
                    <span>{state === 'COACH' ? '🥰' : '🤔'}</span>
                    <span>{state === 'COACH' ? '絶好調ですね' : '少しお疲れのようです'}</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-sage-100 mb-6 text-left">
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
                  <p className="text-sage-700 text-sm leading-relaxed">{feedback}</p>
                </div>
                <button onClick={() => setPhase('intro')} className="text-sage-500 font-bold text-sm hover:text-sage-700 transition-colors">
                  もう一度測定
                </button>
                <button onClick={onClose} className="mt-4 text-xs text-sage-400 underline p-2">
                  閉じる
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
