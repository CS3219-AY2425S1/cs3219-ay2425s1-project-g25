
import { HistoryEntry } from "domain/entities/HistoryEntry";
import { BaseApi } from "../../infrastructure/Api/BaseApi";

const API_URL = "/api/history";

export class HistoryRemoteDataSource extends BaseApi {
    constructor() {
        super(API_URL);
    }

    async getAllUserHistories(): Promise<HistoryEntry[]> {
        return await this.protectedGet<HistoryEntry[]>("/");
    }

    async createOrUpdateUserHistory(questionId: string, roomId: string, attemptStartedAt: string, attemptCompletedAt: string, collaboratorId: string, attemptCode: string, isInitial: boolean): Promise<void> {
        return await this.protectedPost<void>("/", { questionId, roomId, attemptStartedAt, attemptCompletedAt, collaboratorId, attemptCode, isInitial });
    }

    async deleteSelectedHistories(selectedHistoryIds: string[]): Promise<void> {
        selectedHistoryIds.forEach(async (id) => {
            console.log(id);
            await this.protectedDelete<void>(`/user/${id}`);
        });
    }

    async deleteAllUserHistories(): Promise<void> {
        await this.protectedDelete<void>("/all");
    }
}

export const historyRemoteDataSource = new HistoryRemoteDataSource();
