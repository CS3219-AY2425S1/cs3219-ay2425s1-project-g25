// src/application/context/MatchmakingContext.tsx
import { socketService } from "infrastructure/services/SocketService";
import React, { createContext, useReducer, useContext, ReactNode, useEffect } from "react";

// State shape
interface MatchmakingState {
    isMatching: boolean;
    matchFound: boolean;
    elapsedTime: number;
    connected: boolean;
}

// Actions
type MatchmakingAction =
    | { type: "START_MATCHING" }
    | { type: "MATCH_FOUND" }
    | { type: "CANCEL_MATCHING" }
    | { type: "RESET" }
    | { type: "INCREMENT_TIME" }
    | { type: "SOCKET_CONNECTED" }
    | { type: "SOCKET_DISCONNECTED" };

// Initial state
const initialState: MatchmakingState = {
    isMatching: false,
    matchFound: false,
    elapsedTime: 0,
    connected: false
};

// Reducer function
const matchmakingReducer = (state: MatchmakingState, action: MatchmakingAction): MatchmakingState => {
    switch (action.type) {
        case "START_MATCHING":
            return { ...state, isMatching: true, matchFound: false };
        case "MATCH_FOUND":
            return { ...state, isMatching: false, matchFound: true };
        case "CANCEL_MATCHING":
            return { ...state, isMatching: false, matchFound: false, elapsedTime: 0 };
        case "RESET":
            return initialState;
        case "INCREMENT_TIME":
            return { ...state, elapsedTime: state.elapsedTime + 1 };
        case "SOCKET_CONNECTED":
            return { ...state, connected: true };
        case "SOCKET_DISCONNECTED":
            return { ...state, connected: false, isMatching: false };
        default:
            return state;
    }
};

// Context and Provider
const MatchmakingContext = createContext<{
    state: MatchmakingState;
    dispatch: React.Dispatch<MatchmakingAction>;
}>({ state: initialState, dispatch: () => null });

export const MatchmakingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(matchmakingReducer, initialState);

    useEffect(() => {
        socketService.onConnect(() => dispatch({ type: "SOCKET_CONNECTED" }));
        socketService.onDisconnect(() => dispatch({ type: "SOCKET_DISCONNECTED" }));
        socketService.onMatchingStart(() => dispatch({ type: "START_MATCHING" }));
        socketService.onMatchFound(() => dispatch({ type: "MATCH_FOUND" }));
        socketService.onCancelMatching(() => dispatch({ type: "CANCEL_MATCHING" }));

        return () => {
            socketService.disconnect();
        };
    }, []);

    return <MatchmakingContext.Provider value={{ state, dispatch }}>{children}</MatchmakingContext.Provider>;
};

// Custom Hook
export const useMatchmaking = () => {
    return useContext(MatchmakingContext);
};
