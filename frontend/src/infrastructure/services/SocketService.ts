// src/services/socketService.ts
import { io, Socket } from "socket.io-client";

class SocketService {
    private socket: Socket | null = null;

    connect() {
        if (!this.socket) {
            this.socket = io("http://localhost:7000");
            this.setupEventListeners();
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    private setupEventListeners() {
        if (this.socket) {
            this.socket.on("connect", () => {
                console.log("Connected to server");
                this.onConnectCallbacks.forEach(callback => callback());
            });

            this.socket.on("disconnect", () => {
                console.log("Disconnected from server");
                this.onDisconnectCallbacks.forEach(callback => callback());
            });

            this.socket.on("matchFound", () => {
                console.log("Match found");
                this.onMatchFoundCallbacks.forEach(callback => callback());
            });

            this.socket.on("startMatching", () => {
                console.log("Matching started");
                this.onMatchingStartCallbacks.forEach(callback => callback());
            });

            this.socket.on("cancelMatching", () => {
                console.log("Matching cancelled");
                this.onCancelMatchingCallbacks.forEach(callback => callback());
            });
        }
    }

    private onConnectCallbacks: (() => void)[] = [];
    private onDisconnectCallbacks: (() => void)[] = [];
    private onMatchFoundCallbacks: (() => void)[] = [];
    private onMatchingStartCallbacks: (() => void)[] = [];
    private onCancelMatchingCallbacks: (() => void)[] = [];

    onConnect(callback: () => void) {
        this.onConnectCallbacks.push(callback);
    }

    onDisconnect(callback: () => void) {
        this.onDisconnectCallbacks.push(callback);
    }

    onMatchFound(callback: () => void) {
        this.onMatchFoundCallbacks.push(callback);
    }

    onMatchingStart(callback: () => void) {
        this.onMatchingStartCallbacks.push(callback);
    }

    onCancelMatching(callback: () => void) {
        this.onCancelMatchingCallbacks.push(callback);
    }

    startMatching() {
        this.socket?.emit("startMatching");
    }

    cancelMatching() {
        this.socket?.emit("cancelMatching");
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();