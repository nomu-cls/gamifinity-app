import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase'; // Supabaseクライアントのパスを確認してください

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  // 計測データ保持用
  const brightnessData = useRef<number[]>([]);
  const lastHeartBeat = useRef<number>(Date.now());
  const rrIntervals = useRef<number[]>([]);

  // カメラの起動
  const startCamera = async () => {
    alert("DEBUG: ボタンが押されました。カメラを起動します...");

    // ブラウザの互換性チェック
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("お使いのブラウザはカメラ機能をサポートしていません。Safari (iOS) または Chrome (Android) をお使いください。");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // 動画の読み込み完了を待つ (iOS対応)
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => {
            console.error("再生エラー:", e);
            // play()が失敗しても計測フェーズには移行させる（ユーザーアクションでトリガーされているため通常は動く）
          });
          setPhase('measuring');
          startAnalysis();
        };
      }
    } catch (err: any) {
      console.error("カメラの起動に失敗しました:", err);
      // 詳細なエラーメッセージを表示
      let message = "カメラへのアクセスを許可してください。\n";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message += "設定 > Safari (またはブラウザ) > カメラ でアクセスを許可してください。";
      } else if (err.name === 'NotFoundError') {
        message += "カメラが見つかりません。";
      } else {
        message += `エラー詳細: ${err.message || err.name}`;
      }
      alert(message);
    }
  };

  // PPG解析（輝度変化の抽出）
  const startAnalysis = () => {
    const startTime = Date.now();
    const duration = 30000; // 30秒間計測

    const analyze = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0, 100, 100);
      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;

      // 赤色成分の平均輝度を算出
      let rSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
      }
      const avgR = rSum / (data.length / 4);
      brightnessData.current.push(avgR);

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
          }
        }
      }

      // 進捗更新
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / duration) * 100, 100));

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
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    cancelAnimationFrame(requestRef.current!);
  };

  // 結果の解析（COACH/CLASH判定）
  const processResults = async () => {
    setPhase('analyzing');

    // RMSSDの算出
    if (rrIntervals.current.length < 5) {
      alert("計測に失敗しました。指をしっかり当てて再試行してください。");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-sage-50 rounded-3xl shadow-2xl relative overflow-hidden p-6 animate-in fade-in zoom-in duration-300">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-sage-400 hover:text-sage-600 transition-colors p-2 hover:bg-sage-100 rounded-full"
            aria-label="閉じる"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        <h2 className="text-2xl font-bold mb-4 text-sage-800 text-center">指先バイオリズム・チェック</h2>

        {phase === 'intro' && (
          <div className="text-center">
            <p className="mb-6 text-sage-600">指先からあなたのステートを読み取り、<br />無重力へのゲートを開きます。</p>
            <button
              onClick={startCamera}
              className="bg-sage-600 text-white px-8 py-3 rounded-full font-bold hover:bg-sage-700 transition w-full shadow-lg"
            >
              計測を開始する
            </button>
          </div>
        )}

        {phase === 'measuring' && (
          <div className="flex flex-col items-center w-full">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-sage-200 mb-4 shadow-inner">
              <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover grayscale" />
              <canvas ref={canvasRef} width="100" height="100" className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-white border-dashed rounded-full animate-spin-slow opacity-30"></div>
              </div>
            </div>
            <p className="text-sage-600 font-medium text-center animate-pulse">指をレンズにそっと当てたまま、<br />リラックスしてください...</p>
            <div className="w-full bg-sage-200 h-2 rounded-full mt-6 overflow-hidden">
              <div className="bg-sage-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="text-center py-10">
            <div className="animate-pulse text-2xl font-bold text-sage-600">あなたの航路を解析中...</div>
          </div>
        )}

        {phase === 'result' && (
          <div className="text-center w-full">
            <div className={`text-4xl font-black mb-2 ${state === 'COACH' ? 'text-blue-600' : 'text-orange-600'}`}>
              {state} ステート
            </div>
            <div className="bg-white p-4 rounded-2xl mb-6 shadow-inner text-left">
              <div className="flex justify-around mb-4 border-b pb-2">
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase">HRV (RMSSD)</div>
                  <div className="text-xl font-bold">{hrvScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase">Heart Rate</div>
                  <div className="text-xl font-bold">{bpm} <span className="text-xs">BPM</span></div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed italic">"{feedback}"</p>
            </div>
            <button
              onClick={() => setPhase('intro')}
              className="text-sage-500 font-bold hover:underline"
            >
              もう一度計測する
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
