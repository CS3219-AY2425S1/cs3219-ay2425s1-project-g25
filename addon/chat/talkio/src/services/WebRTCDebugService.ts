// WebRTCDebugService.ts
export interface AudioAnalyzerMetrics {
    level: number;
    peak: number;
    average: number;
    peakFrequency: number;
    timestamp: string;
}

export interface AudioAnalyzer {
    audioContext: AudioContext;
    analyserNode: AnalyserNode;
    dataArray: Uint8Array;
    animationFrameId: number | null;
}

export interface AudioAnalyzers {
    local: AudioAnalyzer | null;
    remote: AudioAnalyzer | null;
}

export class WebRTCDebugService {
    private static DEBUG_LOCAL_AUDIO = false;
    private static DEBUG_REMOTE_AUDIO = true;
    private logCounter = 0;
    private readonly LOG_INTERVAL = 10;

    constructor(
        private readonly audioContext: AudioContext,
        private readonly analyserNode: AnalyserNode,
        private readonly dataArray: Uint8Array,
        private readonly streamType: 'local' | 'remote'
    ) { }

    public analyzeAudioFrame(): AudioAnalyzerMetrics | null {
        if (!this.shouldAnalyze()) return null;

        this.analyserNode.getByteFrequencyData(this.dataArray);
        const metrics = this.calculateMetrics();

        if (this.shouldLog()) {
            this.logAudioMetrics(metrics);
        }

        return metrics;
    }

    private shouldAnalyze(): boolean {
        return this.streamType === 'local' ?
            WebRTCDebugService.DEBUG_LOCAL_AUDIO :
            WebRTCDebugService.DEBUG_REMOTE_AUDIO;
    }

    private shouldLog(): boolean {
        this.logCounter++;
        if (this.logCounter >= this.LOG_INTERVAL) {
            this.logCounter = 0;
            return true;
        }
        return false;
    }

    private calculateMetrics(): AudioAnalyzerMetrics {
        const average = this.dataArray.reduce((acc, value) => acc + value, 0) / this.dataArray.length;
        const normalizedLevel = Math.min(100, (average / 256) * 100);
        const peak = Math.max(...Array.from(this.dataArray));
        const peakIndex = this.dataArray.indexOf(peak);
        const peakFrequency = (peakIndex * this.audioContext.sampleRate) /
            (this.analyserNode.frequencyBinCount * 2);

        return {
            level: normalizedLevel,
            peak,
            average,
            peakFrequency,
            timestamp: new Date().toISOString()
        };
    }

    private logAudioMetrics(metrics: AudioAnalyzerMetrics) {
        const emoji = this.streamType === 'local' ? '🎤' : '🎧';
        const streamName = this.streamType.charAt(0).toUpperCase() + this.streamType.slice(1);

        console.log(`${emoji} ${streamName} Audio:`, {
            level: metrics.level.toFixed(2) + '%',
            peak: metrics.peak,
            average: metrics.average.toFixed(2),
            peakFrequency: metrics.peakFrequency.toFixed(2) + 'Hz',
            timestamp: metrics.timestamp
        });

        if (metrics.level > 5) {
            const bars = '█'.repeat(Math.floor(metrics.level / 5));
            console.log(`${streamName} Volume: ${bars} ${metrics.level.toFixed(1)}%`);
        }
    }

    // Static debug control methods
    public static setDebugFlags(localDebug: boolean, remoteDebug: boolean) {
        WebRTCDebugService.DEBUG_LOCAL_AUDIO = localDebug;
        WebRTCDebugService.DEBUG_REMOTE_AUDIO = remoteDebug;
        console.log('Debug settings updated:', {
            localAudio: localDebug,
            remoteAudio: remoteDebug,
            timestamp: new Date().toISOString()
        });
    }

    public static getDebugStatus() {
        return {
            localAudioDebug: WebRTCDebugService.DEBUG_LOCAL_AUDIO,
            remoteAudioDebug: WebRTCDebugService.DEBUG_REMOTE_AUDIO
        };
    }
}