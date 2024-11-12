import React, { createContext, useReducer, useContext, ReactNode, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { matchService } from "infrastructure/services/MatchService";

type MatchStatus = "idle" | "matching" | "found" | "failed";

interface MatchmakingState {
    status: MatchStatus;
    connected: boolean;
    isModalVisible: boolean;
    countdown: number;
}

const initialState: MatchmakingState = {
    status: "idle",
    connected: false,
    isModalVisible: false,
    countdown: 3
};

type MatchmakingAction =
    | { type: "START_MATCHING" }
    | { type: "MATCH_FOUND" }
    | { type: "MATCH_FAILED" }
    | { type: "CANCEL_MATCHING" }
    | { type: "RESET" }
    | { type: "SOCKET_CONNECTED" }
    | { type: "SOCKET_DISCONNECTED" }
    | { type: "SHOW_MODAL" }
    | { type: "HIDE_MODAL" }
    | { type: "SET_COUNTDOWN"; payload: number };

const matchmakingReducer = (state: MatchmakingState, action: MatchmakingAction): MatchmakingState => {
    switch (action.type) {
        case "START_MATCHING":
            return { ...state, status: "matching", isModalVisible: true };
        case "MATCH_FOUND":
            return { ...state, status: "found" };
        case "MATCH_FAILED":
            return { ...state, status: "failed", isModalVisible: true };
        case "CANCEL_MATCHING":
            return { ...state, status: "idle", isModalVisible: false };
        case "SOCKET_CONNECTED":
            return { ...state, connected: true };
        case "SOCKET_DISCONNECTED":
            return { ...state, connected: false, status: "idle" };
        case "RESET":
            return { ...initialState };
        case "SHOW_MODAL":
            return { ...state, isModalVisible: true };
        case "HIDE_MODAL":
            return { ...state, isModalVisible: false };
        case "SET_COUNTDOWN":
            return { ...state, countdown: action.payload };
        default:
            return state;
    }
};

type TimerAction =
    | { type: "START_TIMER" }
    | { type: "STOP_TIMER" }
    | { type: "INCREMENT_TIME" }
    | { type: "RESET_TIMER" };

const timerReducer = (state: number, action: TimerAction): number => {
    switch (action.type) {
        case "INCREMENT_TIME":
            return state + 1;
        case "RESET_TIMER":
            return 0;
        case "START_TIMER":
        case "STOP_TIMER":
            return state;
        default:
            return state;
    }
};

const MatchmakingContext = createContext<{
    state: MatchmakingState & { elapsedTime: number };
    dispatch: React.Dispatch<MatchmakingAction>;
    startMatching: (category: string, difficulty: string) => void;
    cancelMatching: () => void;
    reset: () => void;
    closeModal: () => void;
    showModal: () => void;
}>({
    state: { ...initialState, elapsedTime: 0 },
    dispatch: () => null,
    startMatching: () => {},
    cancelMatching: () => {},
    reset: () => {},
    closeModal: () => {},
    showModal: () => {}
});

export const MatchmakingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(matchmakingReducer, initialState);
    const [elapsedTime, timerDispatch] = useReducer(timerReducer, 0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const matchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isResetting = useRef(false);
    const isMatchingRef = useRef(false);
    const navigate = useNavigate();

    const startTimer = () => {
        if (!timerRef.current && !isResetting.current) {
            timerRef.current = setInterval(() => {
                if (!isResetting.current) {
                    timerDispatch({ type: "INCREMENT_TIME" });
                }
            }, 1000);
        }
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const reset = () => {
        isResetting.current = true;
        isMatchingRef.current = false;
        dispatch({ type: "RESET" });
        timerDispatch({ type: "RESET_TIMER" });
        stopTimer();
        if (matchTimeoutRef.current) {
            clearTimeout(matchTimeoutRef.current);
            matchTimeoutRef.current = null;
        }
        setTimeout(() => {
            isResetting.current = false;
        }, 0);
    };

    const startMatching = (category: string, difficulty: string) => {
        isMatchingRef.current = true;

        matchService
            .ensureConnected()
            .then(() => {
                if (!isMatchingRef.current) return;

                dispatch({ type: "SOCKET_CONNECTED" });
                matchService.startMatch(category, difficulty);
                dispatch({ type: "START_MATCHING" });
                timerDispatch({ type: "RESET_TIMER" });
                startTimer();

                matchTimeoutRef.current = setTimeout(() => {
                    if (isMatchingRef.current) {
                        dispatch({ type: "MATCH_FAILED" });
                        stopTimer();
                        isMatchingRef.current = false;
                    }
                }, 60000);
            })
            .catch(() => {
                dispatch({ type: "SOCKET_DISCONNECTED" });
                isMatchingRef.current = false;
            });
    };

    const cancelMatching = () => {
        matchService.cancelMatch();
        matchService.disconnect();
        dispatch({ type: "CANCEL_MATCHING" });
        dispatch({ type: "SOCKET_DISCONNECTED" });
        stopTimer();
        isMatchingRef.current = false;
        if (matchTimeoutRef.current) {
            clearTimeout(matchTimeoutRef.current);
        }
        reset();
    };

    const closeModal = () => {
        dispatch({ type: "HIDE_MODAL" });
    };

    const showModal = () => {
        dispatch({ type: "SHOW_MODAL" });
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        // Function to handle countdown and navigation
        const startCountdown = (
            message: string | null = null,
            category: string | null = null,
            difficulty: string | null = null,
            attemptStartedAt: string | null = null,
            matchId: string | null = null,
            roomId: string | null = null,
            matchUserId: string | null = null, 
            questionId: string | null = null,
        ) => {
            let countdown = state.countdown;
            intervalId = setInterval(() => {
                if (countdown > 0 && !isResetting.current) {
                    dispatch({ type: "SET_COUNTDOWN", payload: countdown - 1 });
                    countdown--;
                } else {
                    if (intervalId) clearInterval(intervalId);
                    if (!isResetting.current) {
                        reset();
                        navigate(`/room/${roomId}`, {
                            state: {
                                message, category, difficulty, attemptStartedAt, roomId, matchId, matchUserId, questionId
                            }
                        });
                    }
                }
            }, 1000);
        };

        // Listen for match found event and start countdown
        matchService.onMatchFound(({ message, category, difficulty, attemptStartedAt, matchId, roomId, matchUserId, questionId }) => {
            console.log({ message, category, difficulty, attemptStartedAt, matchId, roomId, matchUserId, questionId })
            if (isMatchingRef.current) {
                dispatch({ type: "MATCH_FOUND" });
                isMatchingRef.current = false;

                if (matchTimeoutRef.current) {
                    clearTimeout(matchTimeoutRef.current);
                }

                startCountdown(message, category, difficulty, attemptStartedAt, matchId, roomId, matchUserId, questionId); // Start countdown with roomId for navigation
            }
        });

        matchService.onMatchFail(() => {
            if (isMatchingRef.current) {
                dispatch({ type: "MATCH_FAILED" });
                isMatchingRef.current = false;

                if (matchTimeoutRef.current) {
                    clearTimeout(matchTimeoutRef.current);
                }

                stopTimer();
            }
        });

        // When the match status is "found", start countdown (if triggered elsewhere)
        if (state.status === "found" && !intervalId) {
            startCountdown();
        }

        // Cleanup function to clear the interval
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [state.status, state.countdown, navigate, reset]);

    return (
        <MatchmakingContext.Provider
            value={{
                state: { ...state, elapsedTime },
                dispatch,
                startMatching,
                cancelMatching,
                reset,
                closeModal,
                showModal
            }}
        >
            {children}
        </MatchmakingContext.Provider>
    );
};

export const useMatchmaking = () => useContext(MatchmakingContext);
