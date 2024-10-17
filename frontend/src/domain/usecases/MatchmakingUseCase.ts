// src/domain/useCases/matchmakingUseCase.ts
import { useEffect, useCallback } from "react";
import { socketService } from "infrastructure/services/SocketService";
import { useMatchmaking } from "../../application/context/MatchmakingContext";

export const useMatchmakingUseCase = () => {
    const { state, dispatch } = useMatchmaking();

    const updateConnectionStatus = useCallback((isConnected: boolean) => {
        dispatch({ type: isConnected ? "SOCKET_CONNECTED" : "SOCKET_DISCONNECTED" });
    }, [dispatch]);

    useEffect(() => {
        // Set up socket event listeners
        socketService.onConnect(() => updateConnectionStatus(true));
        socketService.onDisconnect(() => updateConnectionStatus(false));
        socketService.onMatchingStart(() => dispatch({ type: "START_MATCHING" }));
        socketService.onMatchFound(() => dispatch({ type: "MATCH_FOUND" }));
        socketService.onCancelMatching(() => dispatch({ type: "CANCEL_MATCHING" }));

        // Check initial connection status
        updateConnectionStatus(socketService.isConnected());

        // Clean up listeners on unmount
        return () => {
            socketService.disconnect();
        };
    }, [dispatch, updateConnectionStatus]);

    const connectSocket = useCallback(() => {
        socketService.connect();
        updateConnectionStatus(true);
    }, [updateConnectionStatus]);

    const disconnectSocket = useCallback(() => {
        socketService.disconnect();
        updateConnectionStatus(false);
    }, [updateConnectionStatus]);

    const startMatching = useCallback(() => {
        socketService.startMatching();
        dispatch({ type: "START_MATCHING" });
    }, [dispatch]);

    const cancelMatching = useCallback(() => {
        socketService.cancelMatching();
        dispatch({ type: "CANCEL_MATCHING" });
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch({ type: "RESET" });
    }, [dispatch]);

    const incrementTime = useCallback(() => {
        dispatch({ type: "INCREMENT_TIME" });
    }, [dispatch]);

    return {
        state,
        connectSocket,
        disconnectSocket,
        startMatching,
        cancelMatching,
        reset,
        incrementTime
    };
};