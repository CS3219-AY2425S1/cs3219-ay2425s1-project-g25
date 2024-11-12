export interface HistoryEntry {
    _id: string;
    key: string;
    roomId?: string; // If null, room is expired
    attemptStartedAt: string;
    lastAttemptSubmittedAt: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topics: string[];
    description: string;
    attemptCodes: string[];
}