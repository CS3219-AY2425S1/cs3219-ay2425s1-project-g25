import { socketService } from "./SocketService";

class MatchService {
    private onMatchFoundCallbacks: ((data: any) => void)[] = [];
    private onMatchCancelCallbacks: ((data: any) => void)[] = [];
    private onMatchFailCallbacks: ((data: any) => void)[] = [];

    private eventsRegistered: boolean = false;

    private setupEventListeners() {
        if (this.eventsRegistered) return;

        socketService.on("matchFound", (data: { matchUserId: string; roomId: string }) => {
            console.log("MatchService: Match found:", data);
            this.onMatchFoundCallbacks.forEach(callback => callback(data));
            this.disconnect();
        });

        socketService.on("cancelMatching", (data) => {
            console.log("MatchService: Match canceled:", data);
            this.onMatchCancelCallbacks.forEach(callback => callback(data));
        });

        socketService.on("matchFailed", (data) => {
            console.log("MatchService: Match failed:", data);
            this.onMatchFailCallbacks.forEach(callback => callback(data));
        });


        this.eventsRegistered = true;
    }

    public ensureConnected(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isConnected()) {
                this.setupEventListeners();
                resolve();
            } else {
                socketService.connect();

                socketService.onConnect(() => {
                    console.log("MatchService: Socket connected, registering event listeners.");
                    this.setupEventListeners();
                    resolve();
                });

                socketService.onDisconnect(() => {
                    console.log("MatchService: Socket disconnected.");
                    this.eventsRegistered = false;
                    reject(new Error("Socket disconnected before it could connect."));
                });
            }
        });
    }

    async startMatch(category: string, difficulty: string): Promise<void> {
        try {
            await this.ensureConnected();
            const requestData = { category, difficulty };
            console.log("MatchService: Starting match with data:", requestData);
            socketService.emit('startMatching', requestData);
        } catch (error) {
            console.error("MatchService: Failed to start match:", error);
            throw error;
        }
    }

    async cancelMatch(): Promise<void> {
        try {
            await this.ensureConnected();
            console.log("MatchService: Canceling match.");
            socketService.emit('cancelMatching');
        } catch (error) {
            console.error("MatchService: Failed to cancel match:", error);
            throw error;
        }
    }

    disconnect() {
        console.log("MatchService: Disconnecting socket.");
        socketService.disconnect();
    }

    isConnected() {
        return socketService.isConnected();
    }

    onMatchFound(callback: (data: { matchUserId: string; roomId: string }) => void) {
        this.onMatchFoundCallbacks.push(callback);
    }
    onMatchCancel(callback: (data: any) => void) {
        this.onMatchCancelCallbacks.push(callback);
    }

    onMatchFail(callback: (data: any) => void) {
        this.onMatchFailCallbacks.push(callback);
    }

}

export const matchService = new MatchService();