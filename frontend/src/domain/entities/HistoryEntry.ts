export interface HistoryEntry {
    _id: string;
    key: string;
    roomId: string;
    attemptStartedAt: string;
    attemptCompletedAt: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topics: string[];
    attemptCodes: string[];
}