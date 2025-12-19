export interface PPGSignal {
  timestamp: number;
  value: number;
}

export interface RRInterval {
  timestamp: number;
  interval: number;
}

export interface HRVMetrics {
  heartRate: number;
  sdnn: number;
  rmssd: number;
  stressLevel: 'low' | 'moderate' | 'high';
  autonomicBalance: 'sympathetic' | 'balanced' | 'parasympathetic';
  signalQuality: number;
  rrIntervals: number[];
}

export class PPGAnalyzer {
  private signals: PPGSignal[] = [];
  private peaks: number[] = [];
  private rrIntervals: number[] = [];
  private sampleRate: number = 30;
  private minPeakDistance: number = 400;
  private bufferSize: number = 512;

  constructor(sampleRate: number = 30) {
    this.sampleRate = sampleRate;
    this.minPeakDistance = Math.floor(400 * sampleRate / 1000);
  }

  addSignal(value: number): void {
    const timestamp = Date.now();
    this.signals.push({ timestamp, value });

    if (this.signals.length > this.bufferSize) {
      this.signals.shift();
    }
  }

  getSignals(): PPGSignal[] {
    return [...this.signals];
  }

  private bandpassFilter(data: number[]): number[] {
    if (data.length < 5) return data;

    const filtered: number[] = [];
    const windowSize = 5;

    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let count = 0;
      for (let j = Math.max(0, i - windowSize); j <= Math.min(data.length - 1, i + windowSize); j++) {
        sum += data[j];
        count++;
      }
      filtered.push(data[i] - sum / count);
    }

    return filtered;
  }

  private detectPeaks(data: number[]): number[] {
    const peaks: number[] = [];
    const threshold = this.calculateAdaptiveThreshold(data);

    for (let i = 2; i < data.length - 2; i++) {
      if (data[i] > threshold &&
          data[i] > data[i - 1] && data[i] > data[i - 2] &&
          data[i] > data[i + 1] && data[i] > data[i + 2]) {

        if (peaks.length === 0 || i - peaks[peaks.length - 1] > this.minPeakDistance) {
          peaks.push(i);
        }
      }
    }

    return peaks;
  }

  private calculateAdaptiveThreshold(data: number[]): number {
    const sorted = [...data].sort((a, b) => a - b);
    const percentile75 = sorted[Math.floor(sorted.length * 0.75)];
    const percentile25 = sorted[Math.floor(sorted.length * 0.25)];
    return percentile25 + (percentile75 - percentile25) * 0.6;
  }

  private calculateRRIntervals(peakIndices: number[]): number[] {
    const intervals: number[] = [];

    for (let i = 1; i < peakIndices.length; i++) {
      const interval = (peakIndices[i] - peakIndices[i - 1]) * (1000 / this.sampleRate);
      if (interval > 300 && interval < 2000) {
        intervals.push(interval);
      }
    }

    return intervals;
  }

  private calculateSDNN(rrIntervals: number[]): number {
    if (rrIntervals.length < 2) return 0;

    const mean = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
    const squaredDiffs = rrIntervals.map(rr => Math.pow(rr - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / rrIntervals.length;

    return Math.sqrt(variance);
  }

  private calculateRMSSD(rrIntervals: number[]): number {
    if (rrIntervals.length < 2) return 0;

    const successiveDiffs: number[] = [];
    for (let i = 1; i < rrIntervals.length; i++) {
      successiveDiffs.push(Math.pow(rrIntervals[i] - rrIntervals[i - 1], 2));
    }

    const meanSquaredDiff = successiveDiffs.reduce((a, b) => a + b, 0) / successiveDiffs.length;
    return Math.sqrt(meanSquaredDiff);
  }

  private assessSignalQuality(): number {
    if (this.signals.length < 30) return 0;

    const values = this.signals.map(s => s.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const cv = Math.sqrt(variance) / mean;

    let quality = 100;

    if (cv < 0.01) quality -= 40;
    if (cv > 0.5) quality -= 30;

    if (this.rrIntervals.length < 3) quality -= 30;

    const rrVariance = this.rrIntervals.length > 1
      ? this.rrIntervals.reduce((a, b) => a + Math.pow(b - this.rrIntervals.reduce((x, y) => x + y, 0) / this.rrIntervals.length, 2), 0) / this.rrIntervals.length
      : 0;
    if (rrVariance > 100000) quality -= 20;

    return Math.max(0, Math.min(100, quality));
  }

  private determineStressLevel(rmssd: number, sdnn: number): 'low' | 'moderate' | 'high' {
    if (rmssd > 50 && sdnn > 50) return 'low';
    if (rmssd < 20 || sdnn < 30) return 'high';
    return 'moderate';
  }

  private determineAutonomicBalance(rmssd: number, heartRate: number): 'sympathetic' | 'balanced' | 'parasympathetic' {
    if (rmssd > 50 && heartRate < 70) return 'parasympathetic';
    if (rmssd < 25 && heartRate > 85) return 'sympathetic';
    return 'balanced';
  }

  analyze(): HRVMetrics {
    const values = this.signals.map(s => s.value);
    const filtered = this.bandpassFilter(values);
    const peakIndices = this.detectPeaks(filtered);
    this.peaks = peakIndices;
    this.rrIntervals = this.calculateRRIntervals(peakIndices);

    const avgRR = this.rrIntervals.length > 0
      ? this.rrIntervals.reduce((a, b) => a + b, 0) / this.rrIntervals.length
      : 800;
    const heartRate = Math.round(60000 / avgRR);

    const sdnn = this.calculateSDNN(this.rrIntervals);
    const rmssd = this.calculateRMSSD(this.rrIntervals);
    const signalQuality = this.assessSignalQuality();
    const stressLevel = this.determineStressLevel(rmssd, sdnn);
    const autonomicBalance = this.determineAutonomicBalance(rmssd, heartRate);

    return {
      heartRate: Math.max(40, Math.min(200, heartRate)),
      sdnn: Math.round(sdnn * 10) / 10,
      rmssd: Math.round(rmssd * 10) / 10,
      stressLevel,
      autonomicBalance,
      signalQuality: Math.round(signalQuality),
      rrIntervals: this.rrIntervals
    };
  }

  reset(): void {
    this.signals = [];
    this.peaks = [];
    this.rrIntervals = [];
  }
}

export function extractRedChannel(imageData: ImageData): number {
  const data = imageData.data;
  let redSum = 0;
  let count = 0;

  const centerX = Math.floor(imageData.width / 2);
  const centerY = Math.floor(imageData.height / 2);
  const radius = Math.min(imageData.width, imageData.height) / 4;

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      if (dx * dx + dy * dy <= radius * radius) {
        const i = (y * imageData.width + x) * 4;
        redSum += data[i];
        count++;
      }
    }
  }

  return count > 0 ? redSum / count : 0;
}

export function isFingerDetected(imageData: ImageData): boolean {
  const data = imageData.data;
  let redSum = 0;
  let greenSum = 0;
  let brightnessSum = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    redSum += data[i];
    greenSum += data[i + 1];
    brightnessSum += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }

  const avgRed = redSum / pixelCount;
  const avgGreen = greenSum / pixelCount;
  const avgBrightness = brightnessSum / pixelCount;

  return avgRed > 100 && avgRed > avgGreen * 1.2 && avgBrightness > 50 && avgBrightness < 240;
}
