import { HistoryEntry } from "domain/entities/HistoryEntry";
import { historyRemoteDataSource } from "./HistoryRemoteDataSource";

export class HistoryRepositoryImpl {
    private dataSource = historyRemoteDataSource;

    async getAllUserHistories(): Promise<HistoryEntry[]> {
        return this.dataSource.getAllUserHistories();
    }

    async createOrUpdateUserHistory(questionId: string, roomId: string, attemptStartedAt: string, attemptCompletedAt: string, collaboratorId: string, attemptCode: string, isInitial: boolean): Promise<void> {
        this.dataSource.createOrUpdateUserHistory(questionId, roomId, attemptStartedAt, attemptCompletedAt, collaboratorId, attemptCode, isInitial)
    }

    async deleteSelectedUserHistories(selectedHistoryIds: string[]): Promise<void> {
        this.dataSource.deleteSelectedHistories(selectedHistoryIds);
    }

    async deleteAllUserHistories(): Promise<void> {
        this.dataSource.deleteAllUserHistories();
    }
}

export const historyRepository = new HistoryRepositoryImpl();
