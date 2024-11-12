import { SOCKET_URL } from "config";
import AuthClientStore from "data/auth/AuthClientStore";
import { io, Socket } from "socket.io-client";

class SocketService {
    private socket: Socket | null = null;
    private onConnectCallbacks: (() => void)[] = [];
    private onDisconnectCallbacks: (() => void)[] = [];

    connect() {
        if (!this.socket) {
            const token = AuthClientStore.getAccessToken();
            this.socket = io(SOCKET_URL, {
                auth: {
                    token: token,
                },
            });
            this.setupEventListeners();
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log("Socket disconnected and cleaned up.");
        }
    }

    private setupEventListeners() {
        if (this.socket) {
            this.socket.on("connect", () => {
                console.log("Connected to server with socket ID:", this.socket?.id);
                this.onConnectCallbacks.forEach(callback => callback());
            });

            this.socket.on("disconnect", () => {
                console.log("Disconnected from server");
                this.onDisconnectCallbacks.forEach(callback => callback());
            });
        }
    }

    onConnect(callback: () => void) {
        this.onConnectCallbacks.push(callback);
    }

    onDisconnect(callback: () => void) {
        this.onDisconnectCallbacks.push(callback);
    }

    emit(event: string, data?: any) {
        if (this.socket) {
            this.socket.emit(event, data);
        } else {
            console.error("Socket not connected, cannot emit event.");
        }
    }

    on(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        } else {
            console.error("Socket not connected, cannot listen to event.");
        }
    }

    off(event: string, callback?: (data: any) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        } else {
            console.error("Socket not connected, cannot remove listener.");
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();
