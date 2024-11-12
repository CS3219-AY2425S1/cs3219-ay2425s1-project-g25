// WebRTCService.ts
import { MutableRefObject } from 'react';
import { AudioAnalyzer, AudioAnalyzers, WebRTCDebugService } from './WebRTCDebugService';
import ChatService from './chatService';

export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private iceCandidateQueue: RTCIceCandidateInit[] = [];
    private targetId: string | null = null;
    private isEnabled: boolean = false;
    private analyzers: AudioAnalyzers = {
        local: null,
        remote: null
    };

    constructor(
        private readonly chatService: ChatService,
        private readonly isVoiceEnabledRef: MutableRefObject<boolean>,
        private readonly onRemoteStream: (stream: MediaStream) => void,
        private readonly onAudioLevel?: (localLevel: number, remoteLevel: number) => void
    ) { }

    async setupConnection() {
        if (this.peerConnection) return;
        console.log("Setting up WebRTC connection...");

        this.peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.targetId && this.isVoiceEnabledRef.current) {
                console.log("Sending ICE candidate:", event.candidate);
                this.chatService.sendIceCandidate(this.targetId, event.candidate);
            }
        };

        this.peerConnection.ontrack = (event) => {
            console.log("Received remote track:", event);
            const [remoteStream] = event.streams;
            this.setupRemoteAudioAnalyzer(remoteStream);

            // Assign the remote stream to an audio element to ensure playback
            const audioElement = new Audio();
            audioElement.srcObject = remoteStream;
            audioElement.play().catch(error => console.error("Audio playback error:", error));

            this.onRemoteStream(remoteStream); // Keep this if needed for other operations
        };

    }

    private async getLocalStream(): Promise<MediaStream | null> {
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            console.log("Obtained local media stream:", localStream);

            const debugStatus = WebRTCDebugService.getDebugStatus();
            if (debugStatus.localAudioDebug) {
                this.setupLocalAudioAnalyzer(localStream);
            }

            return localStream;
        } catch (error) {
            console.error("Error obtaining local media stream:", error);
            return null;
        }
    }

    private createAudioAnalyzer(stream: MediaStream, type: 'local' | 'remote'): AudioAnalyzer {
        const audioContext = new AudioContext();
        const analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.5;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyserNode);

        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        console.log(`🎛️ ${type} audio analyzer setup complete:`, {
            bufferLength,
            sampleRate: audioContext.sampleRate,
            fftSize: analyserNode.fftSize,
            timeStamp: new Date().toISOString()
        });

        return {
            audioContext,
            analyserNode,
            dataArray,
            animationFrameId: null
        };
    }

    private startAudioMonitoring(type: 'local' | 'remote') {
        const analyzer = this.analyzers[type];
        if (!analyzer) return;

        const debugService = new WebRTCDebugService(
            analyzer.audioContext,
            analyzer.analyserNode,
            analyzer.dataArray,
            type
        );

        const analyzeFrame = () => {
            const metrics = debugService.analyzeAudioFrame();

            if (metrics && this.onAudioLevel) {
                if (type === 'local') {
                    const remoteLevel = this.getRemoteAudioLevel();
                    this.onAudioLevel(metrics.level, remoteLevel);
                }
            }

            analyzer.animationFrameId = requestAnimationFrame(analyzeFrame);
        };

        console.log(`🎙️ Starting ${type} audio monitoring...`);
        analyzeFrame();
    }

    private setupLocalAudioAnalyzer(stream: MediaStream) {
        try {
            this.analyzers.local = this.createAudioAnalyzer(stream, 'local');
            this.startAudioMonitoring('local');
        } catch (error) {
            console.error('❌ Error setting up local audio analyser:', error);
        }
    }

    private setupRemoteAudioAnalyzer(stream: MediaStream) {
        try {
            this.analyzers.remote = this.createAudioAnalyzer(stream, 'remote');
            this.startAudioMonitoring('remote');
        } catch (error) {
            console.error('❌ Error setting up remote audio analyser:', error);
        }
    }

    private getRemoteAudioLevel(): number {
        const analyzer = this.analyzers.remote;
        if (!analyzer) return 0;

        analyzer.analyserNode.getByteFrequencyData(analyzer.dataArray);
        const average = analyzer.dataArray.reduce((acc, value) => acc + value, 0) /
            analyzer.dataArray.length;
        return Math.min(100, (average / 256) * 100);
    }

    private stopAudioMonitoring() {
        Object.entries(this.analyzers).forEach(([type, analyzer]) => {
            if (analyzer) {
                if (analyzer.animationFrameId !== null) {
                    cancelAnimationFrame(analyzer.animationFrameId);
                    analyzer.animationFrameId = null;
                    console.log(`🛑 ${type} audio monitoring stopped`);
                }

                analyzer.audioContext.close();
            }
        });

        this.analyzers = {
            local: null,
            remote: null
        };
    }

    private processBufferedIceCandidates() {
        if (this.peerConnection && this.iceCandidateQueue.length > 0) {
            console.log(`Processing ${this.iceCandidateQueue.length} buffered ICE candidates`);
            this.iceCandidateQueue.forEach((candidate) => {
                this.peerConnection!.addIceCandidate(candidate)
                    .then(() => console.log("Successfully added buffered ICE candidate"))
                    .catch((error) => console.error("Error adding buffered ICE candidate:", error));
            });
            this.iceCandidateQueue = [];
        }
    }

    async createAndSendOffer(targetId: string) {
        console.log("createAndSendOffer called");
        if (!this.peerConnection || !this.isVoiceEnabledRef.current) {
            console.log("Cannot create offer: no connection or voice is disabled");
            return;
        }

        this.targetId = targetId;
        const localStream = await this.getLocalStream();
        if (!localStream) return;

        // Attach each track to the peer connection (ensures audio is sent)
        localStream.getTracks().forEach((track) => {
            this.peerConnection!.addTrack(track, localStream);
        });

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.chatService.sendOffer(targetId, offer);
        console.log("Offer sent successfully.");
    }

    async handleIncomingOffer(senderId: string, offer: RTCSessionDescriptionInit) {
        if (!this.isVoiceEnabledRef.current) {
            console.log("Voice chat is disabled, ignoring incoming offer.");
            return;
        }

        console.log("Received offer from:", senderId);
        this.targetId = senderId;

        await this.setupConnection();
        await this.peerConnection!.setRemoteDescription(offer);

        // Process buffered candidates after setting remote description
        this.processBufferedIceCandidates();

        const localStream = await this.getLocalStream();
        if (!localStream) {
            console.error("Could not get local stream, cannot proceed with voice chat.");
            return;
        }

        localStream.getTracks().forEach((track) =>
            this.peerConnection!.addTrack(track, localStream)
        );

        const answer = await this.peerConnection!.createAnswer();
        await this.peerConnection!.setLocalDescription(answer);

        this.chatService.sendAnswer(senderId, answer);
        console.log("Created and sent answer.");
    }


    async handleIncomingAnswer(senderId: string, answer: RTCSessionDescriptionInit) {
        if (!this.isVoiceEnabledRef.current) {
            console.log("Voice chat is disabled, ignoring incoming answer.");
            return;
        }

        console.log("Received answer from:", senderId);
        await this.peerConnection!.setRemoteDescription(answer);
        console.log("Remote description set with answer.");

        // Ensure ICE candidates are processed after setting the remote description
        this.processBufferedIceCandidates();
    }

    handleIncomingCandidate(senderId: string, candidate: RTCIceCandidateInit) {
        if (!this.isVoiceEnabledRef.current) {
            console.log("Voice chat is disabled, ignoring incoming ICE candidate.");
            return;
        }

        console.log("Received ICE candidate from:", senderId);
        if (this.peerConnection) {
            if (this.peerConnection.remoteDescription?.type) {
                this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                    .then(() => console.log("Successfully added ICE candidate"))
                    .catch((error) => console.error("Error adding ICE candidate:", error));
            } else {
                console.log("Remote description not set yet, buffering ICE candidate");
                this.iceCandidateQueue.push(candidate);
            }
        }
    }

    cleanup() {
        if (this.peerConnection) {
            this.peerConnection.getSenders().forEach((sender) => {
                sender.track?.stop();
            });
            this.peerConnection.close();
            this.peerConnection = null;
        }
        this.stopAudioMonitoring();
        this.targetId = null;
        this.iceCandidateQueue = [];
        this.isEnabled = false;
    }

    // Static debug control methods now delegate to WebRTCDebugService
    public static setDebugFlags(localDebug: boolean, remoteDebug: boolean) {
        WebRTCDebugService.setDebugFlags(localDebug, remoteDebug);
    }

    public static getDebugStatus() {
        return WebRTCDebugService.getDebugStatus();
    }
}