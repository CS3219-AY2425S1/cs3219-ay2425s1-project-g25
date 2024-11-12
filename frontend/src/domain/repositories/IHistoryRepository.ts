import { HistoryEntry } from "domain/entities/HistoryEntry";

export interface IHistoryRepository {
	getAllUserHistories(): Promise<HistoryEntry[]>;
    createOrUpdateUserHistory(questionId: string, roomId: string, attemptStartedAt: string, attemptCompletedAt: string, collaboratorId: string, attemptCode: string, isInitial: boolean): Promise<void>;
    deleteSelectedUserHistories(selectedHistoryIds: string[]): Promise<void>;
    deleteAllUserHistories(): Promise<void>;
}